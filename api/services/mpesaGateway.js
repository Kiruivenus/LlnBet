import mongoose from 'mongoose';
import { User, Transaction, Notification, MpesaTransaction, Setting } from '../models.js';
import { connectDb } from '../db.js';
import { mapDarajaError } from './darajaErrorMapper.js';

// In-memory registry for active Server-Sent Event (SSE) clients
const sseClients = new Map();

// In-memory transaction registry for instant zero-latency retrieval
const memoryTxs = new Map();

/**
 * Register an active SSE response connection for real-time status streaming
 */
export function registerSseClient(identifier, res) {
  sseClients.set(identifier, res);
  res.on('close', () => {
    sseClients.delete(identifier);
  });
}

/**
 * Broadcast real-time SSE payment frame to connected frontends
 */
export function broadcastPaymentState(tx) {
  if (!tx) return;

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
    timelineStep: getTimelineStep(tx.status),
    debug: tx.debugInfo || null
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
 * STEP 5: STRICT PHONE NUMBER NORMALIZATION ENGINE
 * Converts:
 * 0712345678   -> 254712345678
 * 712345678    -> 254712345678
 * +254712345678-> 254712345678
 * 0112345678   -> 254112345678
 * 112345678    -> 254112345678
 * +254112345678-> 254112345678
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
 * Validate phone number format strictly for Kenyan M-Pesa lines
 */
export function validateKenyanPhone(cleanedPhone) {
  if (!cleanedPhone || cleanedPhone.length !== 12) return false;
  return cleanedPhone.startsWith('2547') || cleanedPhone.startsWith('2541');
}

/**
 * Format current timestamp in Safaricom Daraja format YYYYMMDDHHmmss
 */
function getMpesaTimestamp() {
  const now = new Date();
  const t = (val) => String(val).padStart(2, '0');
  return `${now.getFullYear()}${t(now.getMonth() + 1)}${t(now.getDate())}${t(now.getHours())}${t(now.getMinutes())}${t(now.getSeconds())}`;
}

/**
 * STEP 1: VALIDATE REQUIRED ENVIRONMENT CONFIGURATION
 */
export function validateEnvironmentConfig() {
  const mpesaEnv = process.env.MPESA_ENV || 'live';
  const consumerKey = process.env.MPESA_CONSUMER_KEY || '';
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET || '';
  const passkey = process.env.MPESA_PASSKEY || '';
  const shortcode = process.env.MPESA_SHORTCODE || '';
  const callbackUrl = process.env.MPESA_CALLBACK_URL || '';

  const missing = [];

  if (!consumerKey || consumerKey.includes('your_')) missing.push('MPESA_CONSUMER_KEY');
  if (!consumerSecret || consumerSecret.includes('your_')) missing.push('MPESA_CONSUMER_SECRET');
  if (!passkey || passkey.includes('your_')) missing.push('MPESA_PASSKEY');
  if (!shortcode || shortcode.includes('your_')) missing.push('MPESA_SHORTCODE');
  if (!callbackUrl || callbackUrl.includes('your_')) missing.push('MPESA_CALLBACK_URL');

  if (mpesaEnv === 'live' && missing.length > 0) {
    return {
      valid: false,
      missingVariables: missing,
      error: `Missing or placeholder environment variables: ${missing.join(', ')}.`
    };
  }

  return { valid: true, mpesaEnv };
}

/**
 * Safely append state history and processing logs using atomic updateOne
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
            humanError: tx.humanError,
            debugInfo: tx.debugInfo
          },
          $push: {
            history: historyItem,
            processingLogs: logItem
          }
        }
      );
    }
  } catch (e) {
    console.warn("[MPESA DB SAVE WARNING]:", e.message);
  }

  broadcastPaymentState(tx);
}

/**
 * END-TO-END PRODUCTION STK PUSH INITIATION PIPELINE
 */
export async function initiateMpesaDeposit({ userId, phone, amount, ipAddress = '', deviceInfo = '', isDebug = false }) {
  const startTime = Date.now();
  console.log(`\n======================================================`);
  console.log(`[STAGE 1] INCOMING DEPOSIT REQUEST: Amount KES ${amount}, Phone: ${phone}, User: ${userId}`);
  console.log(`======================================================`);

  try {
    await connectDb();
  } catch (e) {
    console.warn("[STAGE 1 WARNING] MongoDB connection pool check fallback:", e.message);
  }

  // 1. Amount Validation
  const numericAmount = Number(amount);
  if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
    throw new Error("Please enter a valid deposit amount.");
  }

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

  // 2. Step 5: Phone Number Normalization & Validation
  const cleanedPhone = formatPhoneNumber(phone);
  console.log(`[STAGE 2] PHONE NORMALIZED: '${phone}' -> '${cleanedPhone}'`);

  if (!validateKenyanPhone(cleanedPhone)) {
    throw new Error("Please enter a valid Kenyan M-Pesa line (e.g. 0712345678 or 0112345678).");
  }

  // 3. Step 1: Validate Environment Variables
  const envValidation = validateEnvironmentConfig();
  if (!envValidation.valid) {
    console.error(`[STAGE 3 FAILED] Environment variables missing:`, envValidation.missingVariables);
    throw new Error(`Live Safaricom Credentials Required: ${envValidation.error}`);
  }

  const roundedAmount = Math.round(numericAmount);
  const reference = `LLN-DEP-${Math.floor(Math.random() * 900000 + 100000)}`;

  // Create Transaction Record
  let tx;
  try {
    tx = new MpesaTransaction({
      reference,
      userId,
      phone: cleanedPhone,
      amount: roundedAmount,
      status: 'PENDING',
      statusMessage: 'Connecting to Safaricom...',
      ipAddress,
      deviceInfo,
      history: [{ status: 'PENDING', statusMessage: 'Connecting to Safaricom...', timestamp: new Date() }],
      processingLogs: [{ stage: 'PENDING', log: `Initiated KES ${roundedAmount.toLocaleString()} for +${cleanedPhone}`, timestamp: new Date() }]
    });
    await tx.save();
  } catch (e) {
    tx = {
      reference,
      userId,
      phone: cleanedPhone,
      amount: roundedAmount,
      status: 'PENDING',
      statusMessage: 'Connecting to Safaricom...',
      ipAddress,
      deviceInfo,
      history: [{ status: 'PENDING', statusMessage: 'Connecting to Safaricom...', timestamp: new Date() }],
      processingLogs: [{ stage: 'PENDING', log: `Initiated KES ${roundedAmount.toLocaleString()} for +${cleanedPhone}`, timestamp: new Date() }]
    };
  }

  broadcastPaymentState(tx);

  await appendStateHistory(tx, 'INITIATED', 'Generating secure payment request...');

  const mpesaEnv = process.env.MPESA_ENV || 'live';
  const baseUrl = mpesaEnv === 'live' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';

  const consumerKey = process.env.MPESA_CONSUMER_KEY || '';
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET || '';
  const passkey = process.env.MPESA_PASSKEY || '';

  let dbPartyB = '';
  try {
    const partyBSetting = await Setting.findOne({ key: 'mpesaPartyB' });
    const rawDbPartyB = partyBSetting ? String(partyBSetting.value).trim() : '';
    if (rawDbPartyB && !rawDbPartyB.includes('your_')) dbPartyB = rawDbPartyB;
  } catch (e) {}

  const shortcode = process.env.MPESA_SHORTCODE || '9962118';
  const tillNumber = dbPartyB || process.env.MPESA_TILL_NUMBER || '8583204';

  // 4. Step 2: Request OAuth Token with Logging & Retry
  console.log(`[STAGE 4] REQUESTING OAUTH TOKEN FROM: ${baseUrl}/oauth/v1/generate?grant_type=client_credentials`);
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  let tokenResponse;
  try {
    tokenResponse = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: { 'Authorization': `Basic ${auth}` }
    });
  } catch (netErr) {
    console.error(`[STAGE 4 NET ERROR] OAuth fetch failed:`, netErr.message);
    const errObj = mapDarajaError('OAUTH_NETWORK_ERROR', netErr.message);
    tx.humanError = errObj;
    await appendStateHistory(tx, 'FAILED', 'OAuth Network Failure', 'OAUTH_NETWORK_ERROR', netErr.message);
    throw new Error(`Safaricom OAuth Network Failure: ${netErr.message}`);
  }

  const tokenText = await tokenResponse.text();
  console.log(`[STAGE 4 OAUTH RESPONSE] Status ${tokenResponse.status}: ${tokenText}`);

  if (!tokenResponse.ok) {
    const errObj = mapDarajaError('OAUTH_FAILURE', tokenText);
    tx.humanError = errObj;
    await appendStateHistory(tx, 'FAILED', 'Safaricom OAuth Authorization Rejected', 'OAUTH_FAILURE', tokenText);
    throw new Error(`Safaricom OAuth Authorization Rejected (${tokenResponse.status}): ${tokenText}`);
  }

  let tokenData;
  try {
    tokenData = JSON.parse(tokenText);
  } catch (e) {
    throw new Error("Invalid OAuth response JSON from Safaricom.");
  }

  const accessToken = tokenData.access_token;
  if (!accessToken) {
    throw new Error("No access_token field returned in Safaricom OAuth payload.");
  }

  console.log(`[STAGE 5] OAUTH TOKEN VALIDATED: ${accessToken.slice(0, 8)}... (Expires in ${tokenData.expires_in}s)`);

  // 5. Step 3: Construct STK Push Payload
  const timestamp = getMpesaTimestamp();
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
  const callbackUrl = process.env.MPESA_CALLBACK_URL || 'https://www.llnebet.co.ke/api/mpesa-callback';

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

  console.log(`[STAGE 6] STK PAYLOAD ASSEMBLED:`, JSON.stringify({ ...payload, Password: '[MASKED]' }, null, 2));

  await appendStateHistory(tx, 'STK_SENT', 'Sending STK Push to Safaricom...');

  // 6. Step 4: Send STK Push & Log Safaricom Response
  console.log(`[STAGE 7] DISPATCHING STK PUSH TO: ${baseUrl}/mpesa/stkpush/v1/processrequest`);

  let stkResponse;
  try {
    stkResponse = await fetch(`${baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  } catch (stkErr) {
    console.error(`[STAGE 7 NET ERROR] STK fetch failed:`, stkErr.message);
    const errObj = mapDarajaError('STK_NETWORK_ERROR', stkErr.message);
    tx.humanError = errObj;
    await appendStateHistory(tx, 'FAILED', 'Safaricom STK Gateway Network Error', 'STK_NETWORK_ERROR', stkErr.message);
    throw new Error(`Safaricom STK Gateway Network Error: ${stkErr.message}`);
  }

  const stkText = await stkResponse.text();
  console.log(`[STAGE 8] SAFARICOM RAW RESPONSE (Status ${stkResponse.status}):`, stkText);

  let stkData;
  try {
    stkData = JSON.parse(stkText);
  } catch (e) {
    throw new Error("Invalid JSON response from Safaricom STK Push endpoint.");
  }

  // Step 11: Step Debug Mode Payload Attachment
  tx.debugInfo = {
    durationMs: Date.now() - startTime,
    timestamp,
    maskedPassword: password.slice(0, 6) + '...' + password.slice(-4),
    oauthStatus: tokenResponse.status,
    stkHttpStatus: stkResponse.status,
    payload: { ...payload, Password: '[MASKED]' },
    safaricomResponse: stkData
  };

  // Step 4 Verification: Check ResponseCode == "0"
  if (!stkResponse.ok || String(stkData.ResponseCode) !== "0") {
    const errorMsg = stkData.errorMessage || stkData.ResponseDescription || stkText;
    console.error(`[STAGE 8 FAILED] Safaricom rejected STK Push. ResponseCode: ${stkData.ResponseCode}, Desc: ${errorMsg}`);

    const errObj = mapDarajaError(stkData.ResponseCode || 'STK_REJECTED', errorMsg);
    tx.humanError = errObj;
    await appendStateHistory(tx, 'FAILED', `Safaricom Rejected Request (${stkData.ResponseCode || 'ERR'}): ${errorMsg}`, String(stkData.ResponseCode || 'STK_REJECTED'), errorMsg);
    throw new Error(`Safaricom Rejected Request: ${errorMsg}`);
  }

  // Step 4 Success: Store IDs
  tx.checkoutRequestID = stkData.CheckoutRequestID;
  tx.merchantRequestID = stkData.MerchantRequestID;

  console.log(`[STAGE 8 SUCCESS] CheckoutRequestID: ${stkData.CheckoutRequestID}, MerchantRequestID: ${stkData.MerchantRequestID}`);

  // Transition to AWAITING_PIN (Do NOT cancel based on timer!)
  await appendStateHistory(tx, 'AWAITING_PIN', `STK Push delivered to +${cleanedPhone}. Awaiting M-Pesa PIN confirmation...`);

  return {
    success: true,
    reference,
    checkoutRequestID: stkData.CheckoutRequestID,
    merchantRequestID: stkData.MerchantRequestID,
    message: stkData.CustomerMessage || "STK push prompt sent to your mobile phone."
  };
}

/**
 * STEP 6: PROCESS SAFARICOM WEBHOOK CALLBACK (HTTP 200 OK)
 */
export async function processMpesaCallback(callbackData) {
  console.log(`\n------------------------------------------------------`);
  console.log(`[STAGE 9] SAFARICOM WEBHOOK CALLBACK RECEIVED:`, JSON.stringify(callbackData, null, 2));
  console.log(`------------------------------------------------------`);

  try {
    const callbackBody = callbackData?.Body?.stkCallback;
    if (!callbackBody) {
      console.log("[STAGE 9] Non-STK Webhook ping received. Returning 200 OK.");
      return { success: true, ResultCode: 0, ResultDesc: "Callback URL health check accepted" };
    }

    try {
      await connectDb();
    } catch (e) {}

    const checkoutRequestID = callbackBody.CheckoutRequestID;
    const merchantRequestID = callbackBody.MerchantRequestID;
    const resultCode = callbackBody.ResultCode;
    const resultDesc = callbackBody.ResultDesc || '';

    const tx = memoryTxs.get(checkoutRequestID) || await MpesaTransaction.findOne({ checkoutRequestID });

    if (!tx) {
      console.warn(`[STAGE 9 WARNING] Transaction with CheckoutID ${checkoutRequestID} not found in store.`);
      return { success: true, ResultCode: 0, ResultDesc: "Transaction not found" };
    }

    // Idempotency Guard
    if (['SUCCESS', 'FAILED', 'CANCELLED', 'TIMEOUT', 'EXPIRED'].includes(tx.status)) {
      console.log(`[STAGE 9 IDEMPOTENCY] Transaction ${tx.reference} already in state ${tx.status}. Ignoring duplicate callback.`);
      return { success: true, ResultCode: 0, ResultDesc: "Duplicate callback ignored" };
    }

    tx.callbackPayload = callbackData;
    tx.merchantRequestID = merchantRequestID || tx.merchantRequestID;

    // STEP 7: Only update state based on official Safaricom ResultCode!
    if (resultCode === 0) {
      console.log(`[STAGE 10] CALLBACK RESULT 0 (SUCCESS) for CheckoutID ${checkoutRequestID}`);
      const metadata = callbackBody.CallbackMetadata?.Item || [];
      const receiptItem = metadata.find(item => item.Name === 'MpesaReceiptNumber');
      const amountItem = metadata.find(item => item.Name === 'Amount');
      const phoneItem = metadata.find(item => item.Name === 'PhoneNumber');

      const receiptNumber = receiptItem ? String(receiptItem.Value) : `MP-${Math.floor(Math.random() * 900000 + 100000)}`;
      const amount = amountItem ? Number(amountItem.Value) : tx.amount;
      const phone = phoneItem ? String(phoneItem.Value) : tx.phone;

      await handleSuccessfulPayment(tx, receiptNumber, amount, phone);
      return { success: true, ResultCode: 0, ResultDesc: "Payment processed successfully" };

    } else {
      console.log(`[STAGE 10] CALLBACK RESULT ${resultCode} (FAILURE) for CheckoutID ${checkoutRequestID}: ${resultDesc}`);
      const errObj = mapDarajaError(resultCode, resultDesc);
      tx.errorCode = String(resultCode);
      tx.errorMessage = resultDesc;
      tx.humanError = errObj;

      const finalState = (resultCode === 1032 || resultCode === 1037) ? 'CANCELLED' : (resultCode === 1031 ? 'TIMEOUT' : 'FAILED');
      await appendStateHistory(tx, finalState, errObj.title + ': ' + resultDesc, String(resultCode), resultDesc);

      return { success: true, ResultCode: 0, ResultDesc: "Callback processed" };
    }

  } catch (err) {
    console.error("[STAGE 9 EXCEPTION] Callback processing error:", err.message);
    return { success: true, ResultCode: 0, ResultDesc: "Callback accepted with warning" };
  }
}

/**
 * WALLET CREDIT & AUDIT RECORDING
 */
async function handleSuccessfulPayment(tx, receiptNumber, amount, phone) {
  await appendStateHistory(tx, 'PROCESSING', `Validating payment receipt ${receiptNumber} and crediting wallet balance...`);

  try {
    await connectDb();
    const user = await User.findById(tx.userId) || await User.findOne({ phone: formatPhoneNumber(phone) });

    if (user) {
      tx.walletBefore = user.balance || 0;
      user.balance = (user.balance || 0) + amount;
      tx.walletAfter = user.balance;
      await user.save();

      await Transaction.create({
        userId: user._id.toString(),
        type: 'DEPOSIT',
        amount: amount,
        status: 'COMPLETED',
        reference: receiptNumber,
        description: `M-Pesa STK Deposit (${receiptNumber})`
      });

      await Notification.create({
        userId: user._id.toString(),
        title: "Deposit Confirmed",
        message: `KES ${amount.toLocaleString()} credited successfully to your wallet. Receipt: ${receiptNumber}`,
        type: "deposit"
      });
    }
  } catch (e) {
    console.warn("[WALLET CREDIT WARNING]:", e.message);
  }

  tx.receiptNumber = receiptNumber;
  await appendStateHistory(tx, 'SUCCESS', `Payment confirmed by Safaricom M-Pesa. Receipt: ${receiptNumber}`);
}

/**
 * GET TRANSACTION STATUS WITH FULL TIMELINE & DEBUG DATA
 */
export async function getTransactionStatus(identifier) {
  let tx = memoryTxs.get(identifier);

  try {
    await connectDb();
    const dbTx = await MpesaTransaction.findOne({
      $or: [{ reference: identifier }, { checkoutRequestID: identifier }]
    }).lean();
    if (dbTx) tx = dbTx;
  } catch (e) {}

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
    processingLogs: tx.processingLogs || [],
    debug: tx.debugInfo || null
  };
}
