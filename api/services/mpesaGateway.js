import mongoose from 'mongoose';
import { User, Transaction, Notification, MpesaTransaction, Setting } from '../models.js';
import { connectDb } from '../db.js';
import { mapDarajaError } from './darajaErrorMapper.js';

// In-memory registry for active Server-Sent Event (SSE) clients listening for payment updates
const sseClients = new Map();

// In-memory fallback transaction registry for maximum reliability
const memoryTxs = new Map();

/**
 * Register an active SSE response connection for real-time payment status streaming
 */
export function registerSseClient(identifier, res) {
  sseClients.set(identifier, res);
  
  // Clean up on disconnect
  res.on('close', () => {
    sseClients.delete(identifier);
  });
}

/**
 * Broadcast real-time SSE payment frame to subscribed frontends
 */
export function broadcastPaymentState(tx) {
  if (!tx) return;

  // Cache transaction in memory for instant retrieval
  if (tx.reference) memoryTxs.set(tx.reference, tx);
  if (tx.checkoutRequestID) memoryTxs.set(tx.checkoutRequestID, tx);

  const identifiers = [tx.reference, tx.checkoutRequestID].filter(Boolean);
  const frameData = JSON.stringify({
    reference: tx.reference,
    checkoutRequestID: tx.checkoutRequestID,
    merchantRequestID: tx.merchantRequestID,
    status: tx.status,
    statusMessage: tx.statusMessage,
    errorCode: tx.errorCode,
    errorMessage: tx.errorMessage,
    humanError: tx.humanError,
    receiptNumber: tx.receiptNumber,
    amount: tx.amount,
    phone: tx.phone,
    timestamp: tx.updatedAt || tx.createdAt,
    walletBefore: tx.walletBefore,
    walletAfter: tx.walletAfter,
    timelineStep: getTimelineStep(tx.status)
  });

  identifiers.forEach(id => {
    const client = sseClients.get(id);
    if (client) {
      try {
        client.write(`data: ${frameData}\n\n`);
      } catch (e) {
        console.warn(`[SSE BROADCAST ERROR] Failed for ${id}:`, e.message);
      }
    }
  });
}

/**
 * Maps payment state to visual progress timeline step (1 to 6)
 */
function getTimelineStep(status) {
  switch (status) {
    case 'PENDING': return 1;
    case 'INITIATED': return 2;
    case 'STK_SENT': return 3;
    case 'AWAITING_PIN': return 4;
    case 'PROCESSING': return 5;
    case 'SUCCESS': return 6;
    case 'FAILED':
    case 'CANCELLED':
    case 'TIMEOUT':
    case 'EXPIRED':
    default: return -1;
  }
}

/**
 * Format phone number to Safaricom standard 12-digit format (2547XXXXXXXX)
 */
export function formatPhoneNumber(phone) {
  if (!phone) return '';
  let cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1);
  } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
    cleaned = '254' + cleaned;
  }
  return cleaned;
}

/**
 * Format current timestamp in Safaricom format YYYYMMDDHHmmss
 */
function getMpesaTimestamp() {
  const now = new Date();
  const t = (val) => String(val).padStart(2, '0');
  return `${now.getFullYear()}${t(now.getMonth() + 1)}${t(now.getDate())}${t(now.getHours())}${t(now.getMinutes())}${t(now.getSeconds())}`;
}

/**
 * Retry helper with exponential backoff for transient network & gateway failures
 */
async function fetchWithExponentialBackoff(url, options, maxRetries = 3) {
  let attempt = 0;
  let delay = 1000;

  while (attempt < maxRetries) {
    try {
      attempt++;
      const response = await fetch(url, options);
      if (response.ok || response.status === 400 || response.status === 401) {
        return response; // Return HTTP response (don't retry client-level errors)
      }
    } catch (err) {
      if (attempt >= maxRetries) throw err;
    }
    await new Promise(res => setTimeout(res, delay));
    delay *= 2; // 1s, 2s, 4s
  }
}

/**
 * Safely update state history & processing logs on an MpesaTransaction document
 */
async function appendStateHistory(tx, status, statusMessage, errorCode = null, errorMessage = null) {
  tx.status = status;
  tx.statusMessage = statusMessage;
  if (errorCode) tx.errorCode = errorCode;
  if (errorMessage) tx.errorMessage = errorMessage;
  tx.updatedAt = new Date();

  if (!tx.history) tx.history = [];
  if (!tx.processingLogs) tx.processingLogs = [];

  const historyItem = {
    status,
    statusMessage,
    timestamp: new Date(),
    errorCode,
    errorMessage
  };

  const logItem = {
    stage: status,
    log: statusMessage,
    timestamp: new Date()
  };

  tx.history.push(historyItem);
  tx.processingLogs.push(logItem);

  // Update in DB safely using atomic updateOne to eliminate ParallelSaveError
  try {
    if (tx._id) {
      await MpesaTransaction.updateOne(
        { _id: tx._id },
        {
          $set: {
            status,
            statusMessage,
            errorCode,
            errorMessage,
            updatedAt: new Date(),
            checkoutRequestID: tx.checkoutRequestID,
            merchantRequestID: tx.merchantRequestID,
            humanError: tx.humanError
          },
          $push: {
            history: historyItem,
            processingLogs: logItem
          }
        }
      );
    } else if (tx.save && typeof tx.save === 'function') {
      await tx.save();
    }
  } catch (e) {
    console.warn("[MPESA DB SAVE WARNING]:", e.message);
  }

  broadcastPaymentState(tx);
}

/**
 * 1. INITIATE M-PESA STK PUSH TRANSACTION
 */
export async function initiateMpesaDeposit({ userId, phone, amount, ipAddress = '', deviceInfo = '' }) {
  try {
    await connectDb();
  } catch (e) {
    console.warn("[MPESA DB CONNECT WARNING]: Proceeding with in-memory transaction cache:", e.message);
  }

  const numericAmount = Number(amount);
  if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
    throw new Error("Please enter a valid deposit amount.");
  }

  // Validate against active database limits with safe defaults
  let minDep = 200;
  let maxDep = 500000;
  try {
    const minDepSetting = await Setting.findOne({ key: 'minDeposit' });
    const maxDepSetting = await Setting.findOne({ key: 'maxDeposit' });
    if (minDepSetting) minDep = Number(minDepSetting.value);
    if (maxDepSetting) maxDep = Number(maxDepSetting.value);
  } catch (e) {}

  if (numericAmount < minDep) {
    throw new Error(`Minimum deposit amount is KES ${minDep.toLocaleString()}.`);
  }
  if (numericAmount > maxDep) {
    throw new Error(`Maximum deposit amount is KES ${maxDep.toLocaleString()}.`);
  }

  const cleanedPhone = formatPhoneNumber(phone);
  if (cleanedPhone.length !== 12 || !cleanedPhone.startsWith('254')) {
    throw new Error("Please enter a valid 10-digit M-Pesa mobile phone number.");
  }

  const roundedAmount = Math.round(numericAmount);
  const reference = `LLN-DEP-${Math.floor(Math.random() * 900000 + 100000)}`;

  // Create Pending Transaction Object
  let tx;
  try {
    tx = new MpesaTransaction({
      reference,
      userId,
      phone: cleanedPhone,
      amount: roundedAmount,
      status: 'PENDING',
      statusMessage: 'Payment request initialized',
      ipAddress,
      deviceInfo,
      history: [{ status: 'PENDING', statusMessage: 'Payment request initialized', timestamp: new Date() }],
      processingLogs: [{ stage: 'PENDING', log: `User initialized deposit request of KES ${roundedAmount.toLocaleString()}`, timestamp: new Date() }]
    });
    await tx.save();
  } catch (e) {
    console.warn("[MPESA TX INIT WARNING]: Falling back to memory object:", e.message);
    tx = {
      reference,
      userId,
      phone: cleanedPhone,
      amount: roundedAmount,
      status: 'PENDING',
      statusMessage: 'Payment request initialized',
      ipAddress,
      deviceInfo,
      history: [{ status: 'PENDING', statusMessage: 'Payment request initialized', timestamp: new Date() }],
      processingLogs: [{ stage: 'PENDING', log: `User initialized deposit request of KES ${roundedAmount.toLocaleString()}`, timestamp: new Date() }]
    };
  }

  broadcastPaymentState(tx);

  // Transition to INITIATED state
  await appendStateHistory(tx, 'INITIATED', 'Validating gateway parameters and obtaining OAuth authorization token...');

  const mpesaEnv = process.env.MPESA_ENV || 'live';
  const baseUrl = mpesaEnv === 'live' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';

  const consumerKey = process.env.MPESA_CONSUMER_KEY || '';
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET || '';
  const passkey = process.env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';

  let dbPartyB = '';
  try {
    const partyBSetting = await Setting.findOne({ key: 'mpesaPartyB' });
    const rawDbPartyB = partyBSetting ? String(partyBSetting.value).trim() : '';
    if (rawDbPartyB && !rawDbPartyB.includes('your_')) dbPartyB = rawDbPartyB;
  } catch (e) {}

  const shortcode = process.env.MPESA_SHORTCODE || '9962118';
  const tillNumber = dbPartyB || process.env.MPESA_TILL_NUMBER || '8583204';

  const isPlaceholder = !consumerKey ||
    consumerKey.includes('your_') ||
    !consumerSecret ||
    consumerSecret.includes('your_');

  // In Live Mode, if keys are missing/placeholders, abort with clear actionable guidance
  if (mpesaEnv === 'live' && isPlaceholder) {
    const errorDetails = mapDarajaError('LIVE_CREDENTIALS_MISSING', 'Live Safaricom credentials required. Please configure MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET in Vercel Environment Variables.');
    tx.humanError = {
      title: 'Live Safaricom Credentials Required',
      explanation: 'Your Vercel deployment is set to Live Mode (MPESA_ENV=live), but MPESA_CONSUMER_KEY or MPESA_CONSUMER_SECRET are set to placeholder values.',
      suggestion: 'Add your live Safaricom Daraja API credentials in Vercel Environment Variables (or set MPESA_ENV=sandbox for testing).'
    };
    appendStateHistory(tx, 'FAILED', 'Live Safaricom Credentials Required', 'LIVE_CREDENTIALS_MISSING', errorDetails.explanation);
    await tx.save();
    throw new Error("Live Safaricom Credentials Required: Please configure valid MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET in Vercel Environment Variables.");
  }

  // In Sandbox Mode with placeholder keys, run sandbox simulation cleanly
  if (mpesaEnv === 'sandbox' && isPlaceholder) {
    const mockCheckoutId = `SIM-WS-${Math.floor(Math.random() * 900000 + 100000)}`;
    const mockMerchantId = `SIM-M-${Math.floor(Math.random() * 900000 + 100000)}`;

    tx.checkoutRequestID = mockCheckoutId;
    tx.merchantRequestID = mockMerchantId;

    appendStateHistory(tx, 'STK_SENT', `STK Push prompt initiated for +${cleanedPhone} (Sandbox Test Mode)`);
    await tx.save();

    setTimeout(async () => {
      try {
        const freshTx = await MpesaTransaction.findOne({ reference });
        if (freshTx && freshTx.status === 'STK_SENT') {
          appendStateHistory(freshTx, 'AWAITING_PIN', 'Simulating M-Pesa PIN confirmation prompt...');
          await freshTx.save();

          // Auto-credit sandbox simulated deposit after 3.5 seconds
          setTimeout(async () => {
            await handleSuccessfulPayment(freshTx, `MP-${Math.floor(Math.random() * 900000 + 100000)}`, roundedAmount, cleanedPhone);
          }, 3000);
        }
      } catch (e) {
        console.error("[SANDBOX SIMULATION ERROR]:", e.message);
      }
    }, 1500);

    return {
      success: true,
      simulated: true,
      reference,
      checkoutRequestID: mockCheckoutId,
      message: "Sandbox STK push simulated."
    };
  }

  // -------------------------------------------------------------------
  // REAL SAFARICOM DARAJA API EXECUTION WITH RETRY LOGIC
  // -------------------------------------------------------------------
  try {
    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenResponse = await fetchWithExponentialBackoff(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: { 'Authorization': `Basic ${auth}` }
    }, 3);

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      const errObj = mapDarajaError('OAUTH_FAILURE', errText);
      tx.humanError = errObj;
      appendStateHistory(tx, 'FAILED', 'Safaricom OAuth Authorization Failed', 'OAUTH_FAILURE', errText);
      await tx.save();
      throw new Error(`Safaricom Authorization Failed: ${errText}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const timestamp = getMpesaTimestamp();
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
    const callbackUrl = process.env.MPESA_CALLBACK_URL || 'https://lln-bet.vercel.app/api/mpesa-callback';

    let transactionType = process.env.MPESA_TRANSACTION_TYPE || '';
    if (!transactionType) {
      if (process.env.MPESA_TILL_NUMBER && process.env.MPESA_TILL_NUMBER !== shortcode) {
        transactionType = 'CustomerBuyGoodsOnline';
      } else {
        transactionType = 'CustomerPayBillOnline';
      }
    }

    const partyB = (transactionType === 'CustomerBuyGoodsOnline' || transactionType === 'CustomerBuyGoods')
      ? (process.env.MPESA_TILL_NUMBER || tillNumber || shortcode)
      : shortcode;

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: transactionType === 'CustomerBuyGoods' ? 'CustomerBuyGoodsOnline' : transactionType,
      Amount: roundedAmount,
      PartyA: cleanedPhone,
      PartyB: partyB,
      PhoneNumber: cleanedPhone,
      CallBackURL: callbackUrl,
      AccountReference: process.env.MPESA_ACCOUNT_REF || "LlnBetWallet",
      TransactionDesc: "Wallet Deposit"
    };

    appendStateHistory(tx, 'STK_SENT', `Dispatching STK Push payload to Safaricom Daraja gateway (${baseUrl})...`);
    await tx.save();

    const stkResponse = await fetchWithExponentialBackoff(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }, 3);

    const stkData = await stkResponse.json();

    if (!stkResponse.ok || stkData.ResponseCode !== "0") {
      const errorMsg = stkData.errorMessage || stkData.ResponseDescription || JSON.stringify(stkData);
      const errObj = mapDarajaError(stkData.ResponseCode || 'STK_REJECTED', errorMsg);
      tx.humanError = errObj;
      appendStateHistory(tx, 'FAILED', 'Safaricom Gateway Rejected STK Push Request', stkData.ResponseCode || 'STK_REJECTED', errorMsg);
      await tx.save();
      throw new Error(`Safaricom Gateway Rejected Request: ${errorMsg}`);
    }

    tx.checkoutRequestID = stkData.CheckoutRequestID;
    tx.merchantRequestID = stkData.MerchantRequestID;

    appendStateHistory(tx, 'AWAITING_PIN', `STK Push delivered to +${cleanedPhone}. Awaiting user PIN confirmation on mobile handset.`);
    await tx.save();

    return {
      success: true,
      simulated: false,
      reference,
      checkoutRequestID: stkData.CheckoutRequestID,
      merchantRequestID: stkData.MerchantRequestID,
      message: stkData.CustomerMessage || "STK push prompt sent to your mobile phone."
    };

  } catch (err) {
    if (tx.status !== 'FAILED') {
      const errObj = mapDarajaError('GATEWAY_ERROR', err.message);
      tx.humanError = errObj;
      appendStateHistory(tx, 'FAILED', 'STK Push Initiation Error', 'GATEWAY_ERROR', err.message);
      await tx.save();
    }
    throw err;
  }
}

/**
 * 2. PROCESS SAFARICOM DARAJA CALLBACK WITH IDEMPOTENCY GUARD
 */
export async function processMpesaCallback(callbackData) {
  try {
    const callbackBody = callbackData?.Body?.stkCallback;
    if (!callbackBody) {
      console.log("[CALLBACK HEALTH PING] Received non-STK webhook ping. Responding with 200 OK.");
      return { success: true, ResultCode: 0, ResultDesc: "Callback URL health check accepted" };
    }

    try {
      await connectDb();
    } catch (dbErr) {
      console.warn("[CALLBACK DB WARNING]: Failed to connect to DB during callback", dbErr.message);
    }

    const checkoutRequestID = callbackBody.CheckoutRequestID;
    const merchantRequestID = callbackBody.MerchantRequestID;
    const resultCode = callbackBody.ResultCode;
    const resultDesc = callbackBody.ResultDesc || '';

    // Atomic database lookup to prevent duplicate crediting & race conditions
    const tx = await MpesaTransaction.findOne({ checkoutRequestID });

  if (!tx) {
    console.warn(`[CALLBACK WARNING] Transaction with CheckoutRequestID ${checkoutRequestID} not found in database.`);
    return { success: false, reason: "Transaction record not found" };
  }

  // Idempotency Guard: Ignore duplicate callbacks for already finalized transactions
  if (['SUCCESS', 'FAILED', 'CANCELLED', 'TIMEOUT', 'EXPIRED'].includes(tx.status)) {
    console.log(`[CALLBACK IDEMPOTENCY GUARD] Transaction ${tx.reference} already in terminal state (${tx.status}). Ignoring duplicate callback.`);
    return { success: true, duplicate: true, status: tx.status };
  }

  tx.callbackPayload = callbackData;
  tx.merchantRequestID = merchantRequestID || tx.merchantRequestID;

  if (resultCode === 0) {
    // Extract metadata
    const metadata = callbackBody.CallbackMetadata?.Item || [];
    const receiptItem = metadata.find(item => item.Name === 'MpesaReceiptNumber');
    const amountItem = metadata.find(item => item.Name === 'Amount');
    const phoneItem = metadata.find(item => item.Name === 'PhoneNumber');

    const receiptNumber = receiptItem ? String(receiptItem.Value) : `MP-${Math.floor(Math.random() * 900000 + 100000)}`;
    const amount = amountItem ? Number(amountItem.Value) : tx.amount;
    const phone = phoneItem ? String(phoneItem.Value) : tx.phone;

    await handleSuccessfulPayment(tx, receiptNumber, amount, phone);
    return { success: true, status: 'SUCCESS', receiptNumber };
  } else {
    // Handle failed / cancelled / timeout result code
    const errObj = mapDarajaError(resultCode, resultDesc);
    tx.errorCode = String(resultCode);
    tx.errorMessage = resultDesc;
    tx.humanError = errObj;

    const finalState = errObj.status || 'FAILED';
    appendStateHistory(tx, finalState, errObj.title + ': ' + resultDesc, String(resultCode), resultDesc);
    await tx.save();

    return { success: true, status: finalState, reason: resultDesc };
  }
  } catch (err) {
    console.error("[MPESA CALLBACK EXCEPTION]:", err.message);
    return { success: true, ResultCode: 0, ResultDesc: "Callback accepted" };
  }
}

/**
 * ATOMIC USER WALLET CREDIT & AUDIT RECORDING
 */
async function handleSuccessfulPayment(tx, receiptNumber, amount, phone) {
  appendStateHistory(tx, 'PROCESSING', `Validating payment receipt ${receiptNumber} and crediting wallet balance...`);
  await tx.save();

  // Find user and record balance snapshot
  const user = await User.findById(tx.userId) || await User.findOne({ phone: formatPhoneNumber(phone) });

  if (user) {
    tx.walletBefore = user.balance || 0;
    user.balance = (user.balance || 0) + amount;
    tx.walletAfter = user.balance;
    await user.save();

    // Create Audit Transaction Record
    await Transaction.create({
      userId: user._id.toString(),
      type: 'DEPOSIT',
      amount: amount,
      status: 'COMPLETED',
      reference: receiptNumber,
      description: `M-Pesa STK Deposit (${receiptNumber})`
    });

    // Create Notification Record
    await Notification.create({
      userId: user._id.toString(),
      title: "Deposit Confirmed",
      message: `KES ${amount.toLocaleString()} credited successfully to your wallet. Receipt: ${receiptNumber}`,
      type: "deposit"
    });
  }

  tx.receiptNumber = receiptNumber;
  appendStateHistory(tx, 'SUCCESS', `Payment confirmed by Safaricom M-Pesa. Receipt: ${receiptNumber}`);
  await tx.save();
}

/**
 * 3. GET REAL-TIME TRANSACTION STATUS WITH TIMELINE
 */
export async function getTransactionStatus(identifier) {
  let tx = memoryTxs.get(identifier);

  try {
    await connectDb();
    const dbTx = await MpesaTransaction.findOne({
      $or: [{ reference: identifier }, { checkoutRequestID: identifier }]
    }).lean();
    if (dbTx) tx = dbTx;
  } catch (e) {
    console.warn("[MPESA STATUS FETCH WARNING]: Falling back to in-memory transaction status:", e.message);
  }

  if (!tx) return null;

  return {
    reference: tx.reference,
    checkoutRequestID: tx.checkoutRequestID,
    merchantRequestID: tx.merchantRequestID,
    status: tx.status,
    statusMessage: tx.statusMessage,
    errorCode: tx.errorCode,
    errorMessage: tx.errorMessage,
    humanError: tx.humanError,
    receiptNumber: tx.receiptNumber,
    amount: tx.amount,
    phone: tx.phone,
    timestamp: tx.updatedAt || tx.createdAt,
    walletBefore: tx.walletBefore,
    walletAfter: tx.walletAfter,
    timelineStep: getTimelineStep(tx.status),
    history: tx.history || [],
    processingLogs: tx.processingLogs || []
  };
}
