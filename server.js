import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
app.use(express.json());

// Serve static frontend sportsbook files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));

// In-memory map to store transaction status callback records
// Key: CheckoutRequestID, Value: { status: 'pending'|'success'|'failed', amount, receipt, reason }
const transactions = new Map();

// Helper: Get timestamp in YYYYMMDDHHmmss format (EAT time, approx)
function getMpesaTimestamp() {
  const now = new Date();
  const t = (val) => String(val).padStart(2, '0');
  const year = now.getFullYear();
  const month = t(now.getMonth() + 1);
  const day = t(now.getDate());
  const hours = t(now.getHours());
  const minutes = t(now.getMinutes());
  const seconds = t(now.getSeconds());
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

// Helper: Format phone number to Safaricom Daraja format (2547XXXXXXXX / 2541XXXXXXXX)
function formatPhoneNumber(phone) {
  let cleaned = phone.replace(/\D/g, ''); // numbers only
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1);
  } else if (cleaned.startsWith('+254')) {
    cleaned = cleaned.slice(1);
  } else if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned;
  }
  return cleaned;
}

// Endpoint: Trigger M-Pesa STK Push Express
app.post('/api/stkpush', async (req, res) => {
  try {
    const { phone, amount } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({ error: "Phone number and amount are required." });
    }

    const cleanedPhone = formatPhoneNumber(phone);
    const roundedAmount = Math.round(amount);

    const consumerKey = process.env.MPESA_CONSUMER_KEY || '';
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET || '';

    // Safeguard: Fallback to simulated flow if keys are not configured
    if (!consumerKey || consumerKey === 'your_sandbox_consumer_key' || !consumerSecret || consumerSecret === 'your_sandbox_consumer_secret') {
      console.log(`[MPESA SIMULATION] Triggered fallback for KES ${roundedAmount} to ${cleanedPhone}`);
      const mockCheckoutId = `SIM-WS-${Math.floor(Math.random() * 900000 + 100000)}`;
      transactions.set(mockCheckoutId, { status: 'pending', amount: roundedAmount, phone: cleanedPhone });
      return res.json({ simulated: true, CheckoutRequestID: mockCheckoutId });
    }

    const mpesaEnv = process.env.MPESA_ENV || 'sandbox';
    const baseUrl = mpesaEnv === 'live' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';

    // 1. Generate OAuth access token
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenResponse = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error("[MPESA] Token Generation failed:", errText);
      return res.status(502).json({ error: "OAuth Token Generation failed.", details: errText });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Prepare parameters for STK Push
    const shortcode = process.env.MPESA_SHORTCODE || '174379';
    const passkey = process.env.MPESA_PASSKEY || '';
    const timestamp = getMpesaTimestamp();
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    const callbackUrl = process.env.MPESA_CALLBACK_URL || '';

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: roundedAmount,
      PartyA: cleanedPhone,
      PartyB: shortcode,
      PhoneNumber: cleanedPhone,
      CallBackURL: callbackUrl,
      AccountReference: "BetPulseWallet",
      TransactionDesc: "Wallet Deposit"
    };

    console.log("[MPESA] Sending STK Push request payload:", payload);

    // 3. Post STK Push request
    const stkResponse = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const stkData = await stkResponse.json();

    if (!stkResponse.ok) {
      console.error("[MPESA] STK push execution error response:", stkData);
      return res.status(stkResponse.status).json({ error: "Safaricom Daraja API rejected the request.", details: stkData });
    }

    console.log("[MPESA] STK push initiated successfully:", stkData);

    const checkoutId = stkData.CheckoutRequestID;
    transactions.set(checkoutId, { status: 'pending', amount: roundedAmount, phone: cleanedPhone });

    return res.json({ simulated: false, CheckoutRequestID: checkoutId, message: stkData.CustomerMessage });

  } catch (error) {
    console.error("[MPESA SERVER ERROR]:", error);
    return res.status(500).json({ error: "Internal Server Error during M-Pesa processing.", details: error.message });
  }
});

// Endpoint: M-Pesa API Webhook Callback Handler
app.post('/api/mpesa-callback', (req, res) => {
  try {
    const callbackData = req.body;
    console.log("[MPESA CALLBACK RECEIVER] Received Webhook Callback Payload:", JSON.stringify(callbackData, null, 2));

    const callbackBody = callbackData.Body?.stkCallback;
    if (!callbackBody) {
      return res.status(400).json({ error: "Invalid callback format" });
    }

    const checkoutId = callbackBody.CheckoutRequestID;
    const resultCode = callbackBody.ResultCode;
    const resultDesc = callbackBody.ResultDesc;

    if (resultCode === 0) {
      // Find M-Pesa receipt number from metadata items
      const metadata = callbackBody.CallbackMetadata?.Item || [];
      const receiptItem = metadata.find(item => item.Name === 'MpesaReceiptNumber');
      const amountItem = metadata.find(item => item.Name === 'Amount');
      const receipt = receiptItem ? receiptItem.Value : `MP-${Math.floor(Math.random() * 900000 + 100000)}`;
      const amount = amountItem ? amountItem.Value : 0;

      console.log(`[MPESA SUCCESS] Transaction checkout ${checkoutId} confirmed. Receipt: ${receipt}, Amount: KES ${amount}`);
      transactions.set(checkoutId, { status: 'success', amount, receipt });
    } else {
      console.warn(`[MPESA FAILED] Transaction checkout ${checkoutId} rejected. Code: ${resultCode}, Desc: ${resultDesc}`);
      transactions.set(checkoutId, { status: 'failed', reason: resultDesc });
    }

    // Acknowledge Safaricom Callback successfully
    return res.json({ ResultCode: 0, ResultDesc: "Success" });

  } catch (error) {
    console.error("[MPESA WEBHOOK ERROR]:", error);
    return res.status(500).json({ error: "Internal Callback Error" });
  }
});

// Endpoint: Poll Transaction Status by CheckoutRequestID
app.get('/api/status/:checkoutId', (req, res) => {
  const checkoutId = req.params.checkoutId;
  const tx = transactions.get(checkoutId);

  if (!tx) {
    return res.json({ status: 'pending' });
  }

  // Once checked success/failure, clear memory slot after 10s to keep RAM clean
  if (tx.status !== 'pending') {
    setTimeout(() => {
      transactions.delete(checkoutId);
    }, 10000);
  }

  return res.json(tx);
});

// Start Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`---------------------------------------------------------------------`);
  console.log(`BetPulse backend server running on http://localhost:${PORT}`);
  console.log(`M-Pesa Env: ${process.env.MPESA_ENV || 'sandbox'}`);
  console.log(`Callback Endpoint registered on /api/mpesa-callback`);
  console.log(`---------------------------------------------------------------------`);
});
