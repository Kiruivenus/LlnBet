const mongoose = require('mongoose');
const { connectDb, getSetting } = require('./db.js');
const { User, Transaction, MpesaTransaction, Notification } = require('./models.js');

const memoryTransactions = globalThis.__betpulse_memory_txs || (globalThis.__betpulse_memory_txs = new Map());
const sseClients = globalThis.__betpulse_sse_clients || (globalThis.__betpulse_sse_clients = new Map());

function registerSseClient(reference, res) {
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

async function initiateMpesaDeposit({ phone, amount, userId }) {
  const ref = `STK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const txData = {
    reference: ref,
    merchantRequestID: `MRID-${Date.now()}`,
    checkoutRequestID: `ws_CO_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    userId,
    phone,
    amount: Number(amount),
    status: 'PENDING',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  memoryTransactions.set(ref, txData);

  if (mongoose.connection.readyState === 1) {
    try {
      await MpesaTransaction.create(txData);
    } catch (err) {}
  }

  // Simulate M-Pesa STK Push Response
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
              { Name: "Amount", Value: amount },
              { Name: "MpesaReceiptNumber", Value: `Q${Math.random().toString(36).substring(2, 9).toUpperCase()}` },
              { Name: "TransactionDate", Value: Date.now() },
              { Name: "PhoneNumber", Value: phone }
            ]
          }
        }
      }
    });
  }, 2500);

  return {
    success: true,
    reference: ref,
    merchantRequestID: txData.merchantRequestID,
    checkoutRequestID: txData.checkoutRequestID,
    CustomerMessage: `STK Push sent to ${phone}. Enter your M-Pesa PIN to complete deposit.`
  };
}

async function processMpesaCallback(callbackBody) {
  try {
    const callbackData = callbackBody?.Body?.stkCallback;
    if (!callbackData) return { success: false, error: "Invalid callback payload format." };

    const checkoutRequestID = callbackData.CheckoutRequestID;
    const resultCode = Number(callbackData.ResultCode);
    const resultDesc = callbackData.ResultDesc;

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
      tx.status = 'FAILED';
      tx.resultCode = resultCode;
      tx.resultDesc = resultDesc;
      tx.updatedAt = new Date();

      if (mongoose.connection.readyState === 1 && typeof tx.save === 'function') {
        await tx.save();
      }
      memoryTransactions.set(tx.reference, tx);

      notifySseClient(tx.reference, {
        status: 'FAILED',
        message: resultDesc || "M-Pesa payment failed or cancelled by user."
      });

      return { success: false, status: 'FAILED', error: resultDesc };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function getTransactionStatus(reference) {
  let tx = null;
  if (mongoose.connection.readyState === 1) {
    tx = await MpesaTransaction.findOne({ reference }).lean();
  }

  if (!tx) {
    tx = memoryTransactions.get(reference);
  }

  if (!tx) return { success: false, error: "Transaction not found." };
  return { success: true, transaction: tx };
}

module.exports = {
  registerSseClient,
  initiateMpesaDeposit,
  processMpesaCallback,
  getTransactionStatus
};
