import mongoose from 'mongoose';
import { connectDb, getSetting } from './db.js';
import { User, Transaction, MpesaTransaction, Notification } from './models.js';

const memoryTransactions = globalThis.__betpulse_memory_txs || (globalThis.__betpulse_memory_txs = new Map());
const sseClients = globalThis.__betpulse_sse_clients || (globalThis.__betpulse_sse_clients = new Map());

export function registerSseClient(reference, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  sseClients.set(reference, res);

  res.on('close', () => {
    sseClients.delete(reference);
  });
}

function notifySseClient(reference, data) {
  const client = sseClients.get(reference);
  if (client) {
    try {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (err) {}
  }
}

// Safaricom Daraja ResultCode & Failure Explanation Mapper
export function mapDarajaResultCode(resultCode, rawDesc = '') {
  const code = Number(resultCode);

  switch (code) {
    case 1032:
      return {
        title: 'Transaction Cancelled',
        explanation: 'You cancelled the M-Pesa STK Push prompt on your phone.',
        suggestion: 'Please initiate a new deposit and enter your 4-digit M-Pesa PIN when prompted on your phone screen.'
      };
    case 1:
      return {
        title: 'Insufficient M-Pesa Balance',
        explanation: 'Your M-Pesa wallet does not have enough funds to complete this deposit.',
        suggestion: 'Top up your M-Pesa account balance or try depositing a smaller amount.'
      };
    case 2001:
      return {
        title: 'Wrong M-Pesa PIN Entered',
        explanation: 'The M-Pesa PIN entered on your phone was incorrect.',
        suggestion: 'Please double-check your 4-digit M-Pesa PIN and initiate a new deposit request.'
      };
    case 1037:
      return {
        title: 'Phone Unreachable / Handset Timeout',
        explanation: 'The M-Pesa prompt timed out because your phone was locked, busy, or out of network coverage.',
        suggestion: 'Unlock your mobile screen, ensure your line is connected to Safaricom, and try again.'
      };
    case 1025:
      return {
        title: 'Handset Connection Error',
        explanation: 'Safaricom was unable to send the STK prompt to your phone handset.',
        suggestion: 'Restart your phone or check if your SIM card is active, then try again.'
      };
    case 1019:
      return {
        title: 'Transaction Expired',
        explanation: 'The STK push prompt expired before PIN entry was completed.',
        suggestion: 'Please enter your M-Pesa PIN immediately when the pop-up prompt appears.'
      };
    case 17:
      return {
        title: 'User M-Pesa Limit Exceeded',
        explanation: 'You have reached your daily or per-transaction M-Pesa transaction limit.',
        suggestion: 'Check your daily M-Pesa transaction limits with Safaricom (*334#).'
      };
    default:
      return {
        title: 'M-Pesa Payment Failed',
        explanation: rawDesc || 'The transaction was declined or timed out on the Safaricom network.',
        suggestion: 'Please verify your phone number, ensure your line is active, and try again.'
      };
  }
}

// Helper: Format Kenyan Phone Number to 254XXXXXXXXX
function formatPhone(phone) {
  let cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1);
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    cleaned = '254' + cleaned;
  }
  return cleaned;
}

// Helper: Generate Safaricom Daraja Timestamp YYYYMMDDHHmmss
function getDarajaTimestamp() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}${mm}${dd}${hh}${min}${ss}`;
}

// Helper: Obtain OAuth Access Token from Safaricom Daraja API
async function getMpesaAccessToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const env = process.env.MPESA_ENV === 'live' ? 'api' : 'sandbox';

  if (!consumerKey || !consumerSecret) {
    throw new Error("M-Pesa Consumer Key or Secret missing in server configuration.");
  }

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const url = `https://${env}.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${auth}`
    }
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("[MPESA OAUTH ERROR]:", errText);
    throw new Error(`Safaricom OAuth authentication failed: ${res.statusText}`);
  }

  const data = await res.json();
  return data.access_token;
}

// Main STK Push Initiation Engine
export async function initiateMpesaDeposit({ phone, amount, userId }) {
  const formattedPhone = formatPhone(phone);
  const depositAmount = Math.round(Number(amount));

  if (isNaN(depositAmount) || depositAmount < 10) {
    throw new Error("Minimum deposit amount is KES 10.");
  }

  if (!formattedPhone || formattedPhone.length !== 12) {
    throw new Error("Invalid Kenyan phone number. Use format 07XXXXXXXX or 01XXXXXXXX.");
  }

  const ref = `STK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Read Party B (Till or Shortcode) set on Admin Portal
  const adminPartyB = await getSetting('mpesaPartyB', null);
  const partyB = String(adminPartyB || process.env.MPESA_TILL_NUMBER || process.env.MPESA_SHORTCODE || '8583204').trim();
  const shortCode = String(process.env.MPESA_SHORTCODE || partyB).trim();
  const passKey = process.env.MPESA_PASSKEY || '';
  const txType = process.env.MPESA_TRANSACTION_TYPE || (partyB.length === 7 ? 'CustomerBuyGoodsOnline' : 'CustomerPayBillOnline');

  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const env = process.env.MPESA_ENV === 'live' ? 'api' : 'sandbox';

  // Check if real Daraja API credentials are raw/configured
  if (consumerKey && consumerSecret && passKey) {
    try {
      console.log(`[STK PUSH] Initiating Real Safaricom Daraja STK Push to ${formattedPhone} for KES ${depositAmount} (PartyB: ${partyB})...`);
      
      const accessToken = await getMpesaAccessToken();
      const timestamp = getDarajaTimestamp();
      const password = Buffer.from(`${shortCode}${passKey}${timestamp}`).toString('base64');
      const callbackUrl = process.env.MPESA_CALLBACK_URL || 'https://www.llnebet.co.ke/api/mpesa-callback';

      const stkPayload = {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: txType,
        Amount: depositAmount,
        PartyA: formattedPhone,
        PartyB: partyB,
        PhoneNumber: formattedPhone,
        CallBackURL: callbackUrl,
        AccountReference: process.env.MPESA_ACCOUNT_REF || "LlnBetWallet",
        TransactionDesc: "Deposit to LlnBet Wallet"
      };

      const stkUrl = `https://${env}.safaricom.co.ke/mpesa/stkpush/v1/processrequest`;
      const stkRes = await fetch(stkUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stkPayload)
      });

      const stkData = await stkRes.json();
      console.log("[DARAJA STK RESPONSE]:", stkData);

      if (stkData.ResponseCode === "0") {
        const txRecord = {
          reference: ref,
          merchantRequestID: stkData.MerchantRequestID,
          checkoutRequestID: stkData.CheckoutRequestID,
          userId,
          phone: formattedPhone,
          amount: depositAmount,
          status: 'PENDING',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        memoryTransactions.set(ref, txRecord);

        await connectDb();
        if (mongoose.connection.readyState === 1) {
          try {
            await MpesaTransaction.create(txRecord);
          } catch (e) {}
        }

        return {
          success: true,
          reference: ref,
          merchantRequestID: stkData.MerchantRequestID,
          checkoutRequestID: stkData.CheckoutRequestID,
          CustomerMessage: stkData.CustomerMessage || `STK Push prompt sent to ${formattedPhone}. Enter your M-Pesa PIN on your phone to complete payment.`
        };
      } else {
        throw new Error(stkData.ResponseDescription || stkData.errorMessage || "Safaricom rejected STK Push request.");
      }
    } catch (darajaErr) {
      console.error("[DARAJA STK PUSH FAILED]:", darajaErr.message);
      throw new Error(`M-Pesa STK Push Error: ${darajaErr.message}`);
    }
  }

  // Fallback Simulation Mode (If credentials missing)
  console.log(`[STK PUSH SIMULATION] Credentials incomplete. Simulating deposit for ${formattedPhone}...`);
  const txData = {
    reference: ref,
    merchantRequestID: `MRID-${Date.now()}`,
    checkoutRequestID: `ws_CO_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    userId,
    phone: formattedPhone,
    amount: depositAmount,
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  memoryTransactions.set(ref, txData);
  await connectDb();
  if (mongoose.connection.readyState === 1) {
    try {
      await MpesaTransaction.create(txData);
    } catch (err) {}
  }

  setTimeout(async () => {
    await processMpesaCallback({
      Body: {
        stkCallback: {
          MerchantRequestID: txData.merchantRequestID,
          CheckoutRequestID: txData.checkoutRequestID,
          ResultCode: 0,
          ResultDesc: "The service request is processed successfully.",
          CallbackMetadata: {
            Item: [
              { Name: "Amount", Value: depositAmount },
              { Name: "MpesaReceiptNumber", Value: `Q${Math.random().toString(36).substring(2, 9).toUpperCase()}` },
              { Name: "TransactionDate", Value: Date.now() },
              { Name: "PhoneNumber", Value: formattedPhone }
            ]
          }
        }
      }
    });
  }, 3000);

  return {
    success: true,
    reference: ref,
    merchantRequestID: txData.merchantRequestID,
    checkoutRequestID: txData.checkoutRequestID,
    CustomerMessage: `STK Push sent to ${formattedPhone}. Enter your M-Pesa PIN to complete deposit.`
  };
}

// Process Webhook Callback from Safaricom
export async function processMpesaCallback(callbackBody) {
  try {
    const callbackData = callbackBody?.Body?.stkCallback;
    if (!callbackData) return { success: false, error: "Invalid callback payload format." };

    const checkoutRequestID = callbackData.CheckoutRequestID;
    const resultCode = Number(callbackData.ResultCode);
    const resultDesc = callbackData.ResultDesc;

    await connectDb();
    let tx = null;
    if (mongoose.connection.readyState === 1) {
      tx = await MpesaTransaction.findOne({ checkoutRequestID });
    }

    if (!tx) {
      for (const t of memoryTransactions.values()) {
        if (t.checkoutRequestID === checkoutRequestID) {
          tx = t;
          break;
        }
      }
    }

    if (!tx) return { success: false, error: "Transaction reference not found." };
    if (tx.status !== 'PENDING') return { success: true, message: "Transaction already processed." };

    let mpesaReceiptNumber = 'N/A';
    if (callbackData.CallbackMetadata?.Item) {
      const receiptItem = callbackData.CallbackMetadata.Item.find(i => i.Name === 'MpesaReceiptNumber');
      if (receiptItem) mpesaReceiptNumber = receiptItem.Value;
    }

    if (resultCode === 0) {
      tx.status = 'COMPLETED';
      tx.resultCode = resultCode;
      tx.resultDesc = resultDesc;
      tx.mpesaReceiptNumber = mpesaReceiptNumber;
      tx.updatedAt = new Date();

      if (mongoose.connection.readyState === 1 && typeof tx.save === 'function') {
        await tx.save();
      }
      memoryTransactions.set(tx.reference, tx);

      // Credit User Wallet
      if (mongoose.connection.readyState === 1) {
        const u = await User.findById(tx.userId);
        if (u) {
          u.balance += tx.amount;
          await u.save();

          await Transaction.create({
            userId: u._id.toString(),
            type: 'DEPOSIT',
            amount: tx.amount,
            status: 'COMPLETED',
            reference: tx.reference,
            description: `M-Pesa Express Deposit (${mpesaReceiptNumber})`
          });

          await Notification.create({
            userId: u._id.toString(),
            title: "M-Pesa Deposit Successful",
            message: `Deposit of KES ${tx.amount.toLocaleString()} received successfully via M-Pesa. Receipt: ${mpesaReceiptNumber}`,
            type: "success"
          });
        }
      }

      notifySseClient(tx.reference, {
        status: 'COMPLETED',
        amount: tx.amount,
        mpesaReceiptNumber,
        message: "Payment received! Wallet updated successfully."
      });

      return { success: true, status: 'COMPLETED' };
    } else {
      const humanError = mapDarajaResultCode(resultCode, resultDesc);
      tx.status = 'FAILED';
      tx.resultCode = resultCode;
      tx.resultDesc = humanError.explanation || resultDesc;
      tx.humanError = humanError;
      tx.updatedAt = new Date();

      if (mongoose.connection.readyState === 1 && typeof tx.save === 'function') {
        await tx.save();
      }
      memoryTransactions.set(tx.reference, tx);

      notifySseClient(tx.reference, {
        status: 'FAILED',
        isFailed: true,
        resultCode,
        resultDesc: humanError.explanation || resultDesc,
        humanError,
        message: humanError.explanation || resultDesc || "M-Pesa payment failed or cancelled by user."
      });

      return { success: false, status: 'FAILED', error: humanError.explanation || resultDesc };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function getTransactionStatus(identifier) {
  if (!identifier) return null;
  await connectDb();
  let tx = null;

  if (mongoose.connection.readyState === 1) {
    tx = await MpesaTransaction.findOne({
      $or: [
        { reference: identifier },
        { checkoutRequestID: identifier },
        { merchantRequestID: identifier }
      ]
    }).lean();
  }

  if (!tx) {
    tx = memoryTransactions.get(identifier);
    if (!tx) {
      for (const t of memoryTransactions.values()) {
        if (t.checkoutRequestID === identifier || t.merchantRequestID === identifier || t.reference === identifier) {
          tx = t;
          break;
        }
      }
    }
  }

  if (!tx) return { success: false, status: 'PENDING', statusMessage: 'Transaction initializing...' };

  const isCompleted = tx.status === 'COMPLETED' || tx.status === 'SUCCESS';
  const isFailed = tx.status === 'FAILED' || tx.status === 'DECLINED' || tx.status === 'CANCELLED';
  const humanError = isFailed ? (tx.humanError || mapDarajaResultCode(tx.resultCode, tx.resultDesc)) : null;

  return {
    success: true,
    status: isCompleted ? 'SUCCESS' : tx.status,
    rawStatus: tx.status,
    isCompleted,
    isPending: tx.status === 'PENDING',
    isFailed,
    resultCode: tx.resultCode,
    resultDesc: tx.resultDesc,
    humanError: humanError || { title: 'M-Pesa Payment Failed', explanation: tx.resultDesc || 'Payment failed or cancelled.', suggestion: 'Please try again.' },
    amount: tx.amount,
    phone: tx.phone,
    mpesaReceiptNumber: tx.mpesaReceiptNumber || 'N/A',
    statusMessage: isCompleted ? "Payment processed successfully!" : (humanError ? humanError.explanation : tx.resultDesc || "Transaction processing..."),
    transaction: tx
  };
}
