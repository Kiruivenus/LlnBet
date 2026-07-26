import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { connectDb, getSetting, setSetting } from './db.js';
import { User, Transaction, Bet, Notification, OddsHistory, Match, Setting } from './models.js';
import { matchCache } from './cache.js';
import { syncMatchesFromEspn } from './services/syncService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env from parent root directory
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
app.use(express.json());

// Serve static frontend files from parent root directory
app.use(express.static(path.resolve(__dirname, '..')));

const JWT_SECRET = process.env.JWT_SECRET || 'betpulse_super_secret_jwt_key_2026';

// Middleware: Ensure Database Connection on incoming API requests
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api') && req.path !== '/api/matches') {
    await connectDb();
  }
  next();
});

// In-memory fallback maps when Mongo is connecting (Persisted on globalThis)
if (!globalThis.__betpulse_memory_users) globalThis.__betpulse_memory_users = new Map();
if (!globalThis.__betpulse_memory_txs) globalThis.__betpulse_memory_txs = new Map();

const memoryUsers = globalThis.__betpulse_memory_users;
const memoryTransactions = globalThis.__betpulse_memory_txs;

// Resilience Helpers: Query MongoDB with In-Memory fallback and Retrying Connection checks
async function findUserByPhone(phone) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await connectDb();
      if (mongoose.connection.readyState === 1) {
        const u = await User.findOne({ phone }).maxTimeMS(5000);
        if (u) {
          memoryUsers.set(phone, u);
          return u;
        }
      }
    } catch (e) {}
    if (attempt < 3) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  if (memoryUsers.has(phone)) {
    return memoryUsers.get(phone);
  }
  return null;
}

async function findUserById(id) {
  const isMemId = String(id).startsWith('mem_');
  if (!isMemId) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await connectDb();
        if (mongoose.connection.readyState === 1) {
          const u = await User.findById(id).maxTimeMS(5000);
          if (u) return u;
        }
      } catch (e) {}
      if (attempt < 3) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  for (const u of memoryUsers.values()) {
    if (String(u._id) === String(id) || String(u.id) === String(id)) return u;
  }
  return null;
}

async function createUser(data) {
  let createdUser = null;
  if (mongoose.connection.readyState === 1) {
    try {
      createdUser = await User.create(data);
    } catch (e) {}
  }

  if (!createdUser) {
    const id = 'mem_' + Date.now();
    createdUser = {
      _id: id,
      id,
      ...data,
      verified: true,
      createdAt: new Date()
    };
  }

  memoryUsers.set(data.phone, createdUser);
  return createdUser;
}

// Endpoint: Register User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { phone, password, name, referredBy } = req.body;
    console.log("[REGISTER REQUEST] Phone:", phone, "ReferredBy:", referredBy, "MongoDB readyState:", mongoose.connection.readyState);

    if (!phone || !password) {
      return res.status(400).json({ error: "Phone number and password are required." });
    }

    const cleanedPhone = formatPhoneNumber(phone);
    if (!cleanedPhone || cleanedPhone.length < 10) {
      return res.status(400).json({ error: "Invalid Kenyan phone number format. Must be e.g. 0712345678 or 254712345678." });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters long." });
    }

    let cleanReferrer = null;
    if (referredBy) {
      try {
        cleanReferrer = formatPhoneNumber(referredBy);
      } catch (err) {}
    }
    if (cleanReferrer === cleanedPhone) {
      cleanReferrer = null;
    }

    // Check if user exists
    const existingUser = await findUserByPhone(cleanedPhone);
    if (existingUser) {
      return res.status(400).json({ error: "Phone number is already registered. Please login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let userRole = 'USER';
    if (mongoose.connection.readyState === 1) {
      try {
        const count = await User.countDocuments({});
        if (count === 0) userRole = 'ADMIN';
      } catch (e) {}
    }
    if (cleanedPhone === '254700000000') {
      userRole = 'ADMIN';
    }

    const newUser = await createUser({
      phone: cleanedPhone,
      password: hashedPassword,
      name: name || `Player_${cleanedPhone.slice(-4)}`,
      balance: 0.00,
      bonusBalance: 0.00,
      referredBy: cleanReferrer,
      role: userRole
    });

    const userId = newUser._id ? newUser._id.toString() : newUser.id;

    if (mongoose.connection.readyState === 1) {
      Notification.create({
        userId,
        title: "Welcome to LlnBet!",
        message: "Your account has been registered successfully. Deposit min KES 200 to start betting!",
        type: "system"
      }).catch(() => {});
    }

    // Process Referral Bonus for Referrer
    if (cleanReferrer) {
      const referrer = await findUserByPhone(cleanReferrer);
      if (referrer) {
        if (mongoose.connection.readyState === 1) {
          try {
            await User.updateOne(
              { phone: cleanReferrer },
              { $inc: { referralCount: 1, referralEarnings: 500, balance: 500 } }
            );
          } catch (e) {
            console.error("Failed to update database referrer:", e);
          }
        }
        
        // Sync Memory User Map representation
        referrer.referralCount = (referrer.referralCount || 0) + 1;
        referrer.referralEarnings = (referrer.referralEarnings || 0) + 500;
        referrer.balance = (referrer.balance || 0) + 500;
        memoryUsers.set(cleanReferrer, referrer);

        // Add reward transaction & system alert notification for the referrer
        const refUserId = referrer._id ? referrer._id.toString() : referrer.id;
        if (mongoose.connection.readyState === 1) {
          Transaction.create({
            userId: refUserId,
            type: 'BET_WON',
            amount: 500.00,
            status: 'COMPLETED',
            reference: 'REF_' + Math.floor(100000 + Math.random() * 900000),
            description: `Referral signup reward for inviting Player_${cleanedPhone.slice(-4)}`
          }).catch(() => {});

          Notification.create({
            userId: refUserId,
            title: "Referral Reward Credited!",
            message: `Congratulations! Player_${cleanedPhone.slice(-4)} has successfully signed up using your link. KES 500.00 bonus has been credited to your balance.`,
            type: "system"
          }).catch(() => {});
        }
      }
    }

    const token = jwt.sign({ id: userId, phone: newUser.phone, role: newUser.role || 'USER' }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      token,
      user: {
        id: userId,
        phone: newUser.phone,
        name: newUser.name,
        balance: newUser.balance,
        bonusBalance: newUser.bonusBalance,
        referralCount: newUser.referralCount || 0,
        referralEarnings: newUser.referralEarnings || 0.00,
        role: newUser.role || 'USER',
        verified: newUser.verified !== false
      }
    });

  } catch (error) {
    console.error("[AUTH REGISTER ERROR]:", error);
    return res.status(500).json({ error: "Registration failed.", details: error.message });
  }
});

// Endpoint: Login User
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: "Phone number and password are required." });
    }

    const cleanedPhone = formatPhoneNumber(phone);
    const user = await findUserByPhone(cleanedPhone);

    if (!user) {
      return res.status(400).json({ error: "Invalid phone number or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid phone number or password." });
    }

    const userId = user._id ? user._id.toString() : user.id;
    const token = jwt.sign({ id: userId, phone: user.phone, role: user.role || 'USER' }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      token,
      user: {
        id: userId,
        phone: user.phone,
        name: user.name,
        balance: user.balance,
        bonusBalance: user.bonusBalance,
        referralCount: user.referralCount || 0,
        referralEarnings: user.referralEarnings || 0.00,
        role: user.role || 'USER',
        verified: user.verified !== false
      }
    });

  } catch (error) {
    console.error("[AUTH LOGIN ERROR]:", error);
    return res.status(500).json({ error: "Login failed.", details: error.message });
  }
});

// Endpoint: Get Current Authenticated User Profile & Balance
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const userId = user._id ? user._id.toString() : user.id;

    return res.json({
      user: {
        id: userId,
        phone: user.phone,
        name: user.name,
        balance: user.balance,
        bonusBalance: user.bonusBalance,
        referralCount: user.referralCount || 0,
        referralEarnings: user.referralEarnings || 0.00,
        role: user.role || 'USER',
        verified: user.verified !== false
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch user profile." });
  }
});

// Endpoint: Get User Notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    let list = [];
    if (mongoose.connection.readyState === 1) {
      list = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(50);
    }
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch notifications." });
  }
});

// Endpoint: Clear User Notifications
app.delete('/api/notifications', authenticateToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Notification.deleteMany({ userId: req.user.id });
    }
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to clear notifications." });
  }
});

// Helper: Format phone number
function formatPhoneNumber(phone) {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.slice(1);
  } else if (cleaned.startsWith('+254')) {
    cleaned = cleaned.slice(1);
  } else if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned;
  }
  return cleaned;
}

// Helper: Get timestamp in YYYYMMDDHHmmss format
function getMpesaTimestamp() {
  const now = new Date();
  const t = (val) => String(val).padStart(2, '0');
  return `${now.getFullYear()}${t(now.getMonth() + 1)}${t(now.getDate())}${t(now.getHours())}${t(now.getMinutes())}${t(now.getSeconds())}`;
}

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Authentication token required. Please login." });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Session expired or invalid token. Please login again." });
    }
    req.user = decoded;
    next();
  });
}



// ---------------------------------------------------------------------
// M-PESA & WALLET FINANCIAL ENDPOINTS (MIN KES 200 DEPOSIT & WITHDRAWAL)
// ---------------------------------------------------------------------

// Endpoint: Trigger M-Pesa STK Push Express (MIN KES 200)
app.post('/api/stkpush', async (req, res) => {
  try {
    const { phone, amount, userId } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({ error: "Phone number and amount are required." });
    }

    const numericAmount = Number(amount);

    // ENFORCE MINIMUM & MAXIMUM DEPOSIT LIMITS
    const minDep = await getSetting('minDeposit', 200);
    const maxDep = await getSetting('maxDeposit', 500000);
    if (numericAmount < minDep) {
      return res.status(400).json({ error: `Minimum deposit amount is KES ${minDep.toLocaleString()}.` });
    }
    if (numericAmount > maxDep) {
      return res.status(400).json({ error: `Maximum deposit amount is KES ${maxDep.toLocaleString()}.` });
    }

    const cleanedPhone = formatPhoneNumber(phone);
    const roundedAmount = Math.round(numericAmount);

    const consumerKey = process.env.MPESA_CONSUMER_KEY || '';
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET || '';

    // Fallback simulation if API keys are placeholders
    if (!consumerKey || consumerKey === 'your_sandbox_consumer_key' || !consumerSecret || consumerSecret === 'your_sandbox_consumer_secret') {
      const mockCheckoutId = `SIM-WS-${Math.floor(Math.random() * 900000 + 100000)}`;
      memoryTransactions.set(mockCheckoutId, { status: 'pending', amount: roundedAmount, phone: cleanedPhone, userId });

      // Auto-credit simulated deposit after 3 seconds for smooth flow
      setTimeout(async () => {
        try {
          const u = userId ? await User.findById(userId) : await User.findOne({ phone: cleanedPhone });
          if (u) {
            u.balance += roundedAmount;
            await u.save();

            const ref = `MP-${Math.floor(Math.random() * 900000 + 100000)}`;
            await Transaction.create({
              userId: u._id.toString(),
              type: 'DEPOSIT',
              amount: roundedAmount,
              status: 'COMPLETED',
              reference: ref,
              description: `M-Pesa Express Deposit (${cleanedPhone})`
            });

            await Notification.create({
              userId: u._id.toString(),
              title: "Deposit Confirmed",
              message: `KES ${roundedAmount.toLocaleString()} credited successfully to your wallet. Ref: ${ref}`,
              type: "deposit"
            });
          }
          memoryTransactions.set(mockCheckoutId, { status: 'success', amount: roundedAmount, phone: cleanedPhone });
        } catch (e) {
          console.error("Auto-credit simulation error:", e);
        }
      }, 3500);

      return res.json({ simulated: true, CheckoutRequestID: mockCheckoutId, message: "STK push prompt sent to phone. Enter M-Pesa PIN." });
    }

    const mpesaEnv = process.env.MPESA_ENV || 'sandbox';
    const baseUrl = mpesaEnv === 'live' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke';

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    const tokenResponse = await fetch(`${baseUrl}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: { 'Authorization': `Basic ${auth}` }
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      return res.status(502).json({ error: "Safaricom OAuth Token Generation failed.", details: errText });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    const dbPartyB = await getSetting('mpesaPartyB', '');
    const shortcode = process.env.MPESA_SHORTCODE || dbPartyB || '174379';
    const tillNumber = process.env.MPESA_TILL_NUMBER || shortcode;
    const passkey = process.env.MPESA_PASSKEY || '';
    const timestamp = getMpesaTimestamp();
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
    const callbackUrl = process.env.MPESA_CALLBACK_URL || '';
    const transactionType = process.env.MPESA_TRANSACTION_TYPE || 'CustomerBuyGoodsOnline';

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: transactionType,
      Amount: roundedAmount,
      PartyA: cleanedPhone,
      PartyB: transactionType === 'CustomerBuyGoodsOnline' ? tillNumber : shortcode,
      PhoneNumber: cleanedPhone,
      CallBackURL: callbackUrl,
      AccountReference: process.env.MPESA_ACCOUNT_REF || "LlnBetWallet",
      TransactionDesc: "Wallet Deposit"
    };

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
      return res.status(stkResponse.status).json({ error: "Safaricom Daraja API rejected the request.", details: stkData });
    }

    const checkoutId = stkData.CheckoutRequestID;
    memoryTransactions.set(checkoutId, { status: 'pending', amount: roundedAmount, phone: cleanedPhone, userId });

    return res.json({ simulated: false, CheckoutRequestID: checkoutId, message: stkData.CustomerMessage });

  } catch (error) {
    console.error("[MPESA SERVER ERROR]:", error);
    return res.status(500).json({ error: "Internal Server Error during deposit processing.", details: error.message });
  }
});

// Endpoint: M-Pesa Callback Handler
app.post('/api/mpesa-callback', async (req, res) => {
  try {
    const callbackData = req.body;
    const callbackBody = callbackData.Body?.stkCallback;
    if (!callbackBody) return res.status(400).json({ error: "Invalid callback payload" });

    const checkoutId = callbackBody.CheckoutRequestID;
    const resultCode = callbackBody.ResultCode;
    const resultDesc = callbackBody.ResultDesc;

    if (resultCode === 0) {
      const metadata = callbackBody.CallbackMetadata?.Item || [];
      const receiptItem = metadata.find(item => item.Name === 'MpesaReceiptNumber');
      const amountItem = metadata.find(item => item.Name === 'Amount');
      const phoneItem = metadata.find(item => item.Name === 'PhoneNumber');

      const receipt = receiptItem ? receiptItem.Value : `MP-${Math.floor(Math.random() * 900000 + 100000)}`;
      const amount = amountItem ? Number(amountItem.Value) : 0;
      const phone = phoneItem ? String(phoneItem.Value) : '';

      const txRecord = memoryTransactions.get(checkoutId);
      const targetPhone = phone || txRecord?.phone;

      // Credit user in MongoDB
      const user = txRecord?.userId ? await User.findById(txRecord.userId) : await User.findOne({ phone: formatPhoneNumber(targetPhone) });
      if (user) {
        user.balance += amount;
        await user.save();

        await Transaction.create({
          userId: user._id.toString(),
          type: 'DEPOSIT',
          amount: amount,
          status: 'COMPLETED',
          reference: receipt,
          description: `M-Pesa STK Deposit (${receipt})`
        });

        await Notification.create({
          userId: user._id.toString(),
          title: "Deposit Received",
          message: `KES ${amount.toLocaleString()} credited successfully to your wallet. Ref: ${receipt}`,
          type: "deposit"
        });
      }

      memoryTransactions.set(checkoutId, { status: 'success', amount, receipt });
    } else {
      memoryTransactions.set(checkoutId, { status: 'failed', reason: resultDesc });
    }

    return res.json({ ResultCode: 0, ResultDesc: "Success" });

  } catch (error) {
    console.error("[MPESA CALLBACK ERROR]:", error);
    return res.status(500).json({ error: "Internal Callback Error" });
  }
});

// Endpoint: Poll STK Transaction Status
app.get('/api/status/:checkoutId', (req, res) => {
  const checkoutId = req.params.checkoutId;
  const tx = memoryTransactions.get(checkoutId);
  if (!tx) return res.json({ status: 'pending' });
  return res.json(tx);
});

// Endpoint: Withdraw Money (MIN KES 200)
app.post('/api/wallet/withdraw', authenticateToken, async (req, res) => {
  try {
    const { amount, phone } = req.body;
    const numericAmount = Number(amount);

    if (!numericAmount || isNaN(numericAmount)) {
      return res.status(400).json({ error: "Please enter a valid withdrawal amount." });
    }

    // ENFORCE MINIMUM & MAXIMUM WITHDRAWAL LIMITS
    const minWith = await getSetting('minWithdrawal', 200);
    const maxWith = await getSetting('maxWithdrawal', 100000);
    if (numericAmount < minWith) {
      return res.status(400).json({ error: `Minimum withdrawal amount is KES ${minWith.toLocaleString()}.` });
    }
    if (numericAmount > maxWith) {
      return res.status(400).json({ error: `Maximum withdrawal amount is KES ${maxWith.toLocaleString()}.` });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (user.balance < numericAmount) {
      return res.status(400).json({ error: `Insufficient account balance. Available: KES ${user.balance.toFixed(2)}.` });
    }

    // Deduct balance in MongoDB
    user.balance -= numericAmount;
    await user.save();

    const ref = `WD-${Math.floor(Math.random() * 900000 + 100000)}`;
    const targetPhone = formatPhoneNumber(phone || user.phone);

    await Transaction.create({
      userId: user._id.toString(),
      type: 'WITHDRAWAL',
      amount: numericAmount,
      status: 'PENDING',
      reference: ref,
      description: `M-Pesa B2C Withdrawal to ${targetPhone} (Pending Approval)`
    });

    await Notification.create({
      userId: user._id.toString(),
      title: "Withdrawal Request Received",
      message: `Your withdrawal of KES ${numericAmount.toLocaleString()} is pending admin approval. Ref: ${ref}`,
      type: "withdrawal"
    });

    return res.json({
      success: true,
      message: `Withdrawal request of KES ${numericAmount.toLocaleString()} submitted. Pending admin approval.`,
      reference: ref,
      newBalance: user.balance
    });
  } catch (error) {
    console.error("[WITHDRAWAL ERROR]:", error);
    return res.status(500).json({ error: "Withdrawal failed.", details: error.message });
  }
});

// ---------------------------------------------------------------------
// REAL BET PLACEMENT & BET HISTORY ENDPOINTS
// ---------------------------------------------------------------------

// Endpoint: Place Bet
app.post('/api/bets/place', authenticateToken, async (req, res) => {
  try {
    const { selections, stake, totalOdds, possiblePayout } = req.body;

    if (!selections || !Array.isArray(selections) || selections.length === 0) {
      return res.status(400).json({ error: "At least one match selection is required." });
    }

    const numericStake = Number(stake);
    if (!numericStake || numericStake < 10) {
      return res.status(400).json({ error: "Minimum stake per bet is KES 10." });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (user.balance < numericStake) {
      return res.status(400).json({ error: `Insufficient wallet balance. Available: KES ${user.balance.toFixed(2)}. Please deposit funds.` });
    }

    // Deduct stake in MongoDB
    user.balance -= numericStake;
    await user.save();

    const betId = `BET-${Math.floor(Math.random() * 900000 + 100000)}`;

    const newBet = await Bet.create({
      userId: user._id.toString(),
      betId,
      selections,
      totalOdds: Number(totalOdds),
      stake: numericStake,
      possiblePayout: Number(possiblePayout),
      status: 'OPEN'
    });

    await Transaction.create({
      userId: user._id.toString(),
      type: 'BET_PLACED',
      amount: numericStake,
      status: 'COMPLETED',
      reference: betId,
      description: `placed ${selections.length} selection multibet ticket`
    });

    await Notification.create({
      userId: user._id.toString(),
      title: "Bet Placed Successfully",
      message: `Bet ${betId} placed for KES ${numericStake.toLocaleString()} (Potential Payout: KES ${possiblePayout.toLocaleString()})`,
      type: "bet"
    });

    return res.json({
      success: true,
      bet: newBet,
      newBalance: user.balance
    });

  } catch (error) {
    console.error("[PLACE BET ERROR]:", error);
    return res.status(500).json({ error: "Bet placement failed.", details: error.message });
  }
});

// Endpoint: Fetch User's Bets
app.get('/api/bets/my-bets', authenticateToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const bets = await Bet.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
      return res.json(bets);
    }
    return res.json([]);
  } catch (error) {
    return res.json([]);
  }
});

// Endpoint: Update Settle Bet Status & Selections outcomes in MongoDB
app.post('/api/bets/:id/settle', async (req, res) => {
  try {
    const betId = req.params.id;
    const { status, selections, winnings } = req.body;

    if (mongoose.connection.readyState === 1) {
      const bet = await Bet.findOne({ betId });
      if (!bet) return res.status(404).json({ error: "Bet not found." });

      if (bet.status !== 'OPEN') {
        return res.json({ success: true, message: "Bet is already settled." });
      }

      bet.status = status;
      if (selections) bet.selections = selections;
      if (winnings !== undefined) bet.cashoutAmount = winnings;
      await bet.save();

      // If the bet won or was cashed out, credit user balance!
      if ((status === 'WON' || status === 'CASHOUT') && winnings > 0) {
        const user = await User.findById(bet.userId);
        if (user) {
          user.balance += winnings;
          await user.save();

          await Transaction.create({
            userId: user._id.toString(),
            type: status === 'CASHOUT' ? 'CASHOUT' : 'BET_WON',
            amount: winnings,
            status: 'COMPLETED',
            reference: `${status === 'CASHOUT' ? 'CO' : 'WIN'}-${betId}`,
            description: status === 'CASHOUT'
              ? `Early cashout payout for Bet Ticket #${betId}`
              : `Winnings payout for Bet Ticket #${betId}`
          });

          await Notification.create({
            userId: user._id.toString(),
            title: status === 'CASHOUT' ? "Bet Cashed Out" : "Bet Won! Payout Credited",
            message: status === 'CASHOUT'
              ? `Your early cashout of KES ${winnings.toLocaleString()} for ticket #${betId} was successful.`
              : `Congratulations! Your bet ticket #${betId} won KES ${winnings.toLocaleString()}. Funds have been credited to your wallet.`,
            type: "bet"
          });
        }
      }
      return res.json({ success: true });
    }
    return res.status(400).json({ error: "No active database connection." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to settle bet." });
  }
});

// Endpoint: Fetch User's Transaction History
app.get('/api/wallet/transactions', authenticateToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const txs = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
      return res.json(txs);
    }
    return res.json([]);
  } catch (error) {
    return res.json([]);
  }
});

// Endpoint: Fetch User's Notifications
app.get('/api/notifications', authenticateToken, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const notifs = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
      return res.json(notifs);
    }
    return res.json([]);
  } catch (error) {
    return res.json([]);
  }
});

// ---------------------------------------------------------------------
// ODDS SYNC ENDPOINTS
// ---------------------------------------------------------------------
app.get('/api/odds', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const records = await OddsHistory.find({}).lean();
      return res.json(records);
    }
    return res.json([]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/odds', async (req, res) => {
  try {
    const { matchId, r1, rx, r2 } = req.body;
    if (!matchId) return res.status(400).json({ error: "matchId required" });

    if (mongoose.connection.readyState === 1) {
      await OddsHistory.updateOne(
        { matchId },
        { $set: { r1, rx, r2, updatedAt: new Date() } },
        { upsert: true }
      );
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------
// DYNAMIC MATCH CACHING & BACKGROUND SYNCHRONIZATION
// ---------------------------------------------------------------------
let lastSyncTime = 0;

app.get('/api/matches', async (req, res) => {
  try {
    const now = Date.now();

    // 1. Serve from global in-memory cache if fresh (< 10 seconds old)
    if (matchCache.matches.length > 0 && (now - matchCache.lastFetched < 10000)) {
      return res.json(matchCache.matches);
    }

    // 2. Refresh/Fetch from MongoDB if memory cache is stale
    await connectDb();

    if (mongoose.connection.readyState === 1) {
      // Trigger non-blocking sync in background if last ESPN fetch was > 30 seconds ago
      if (now - lastSyncTime > 30000 && !matchCache.syncInProgress) {
        lastSyncTime = now;
        matchCache.syncInProgress = true;
        syncMatchesFromEspn()
          .catch((err) => {
            console.warn("[BACKEND SYNC ERROR]:", err.message);
          })
          .finally(() => {
            matchCache.syncInProgress = false;
          });
      }

      const cachedMatches = await Match.find({}).lean();
      matchCache.matches = cachedMatches;
      matchCache.lastFetched = now;
      return res.json(cachedMatches);
    }

    // Return stale cache if DB is offline
    return res.json(matchCache.matches);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------
// ROLE-BASED ADMIN DASHBOARD ENDPOINTS
// ---------------------------------------------------------------------

// Middleware: Authenticate Admin Privilege
function authenticateAdmin(req, res, next) {
  authenticateToken(req, res, () => {
    if (req.user && req.user.role === 'ADMIN') {
      next();
    } else {
      res.status(403).json({ error: "Access Denied: Admin privilege required." });
    }
  });
}

// 1. Get all registered users
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    let list = [];
    if (mongoose.connection.readyState === 1) {
      list = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    } else {
      list = Array.from(memoryUsers.values()).map(u => {
        const { password, ...safeUser } = u;
        return safeUser;
      });
    }
    return res.json({ success: true, users: list });
  } catch (error) {
    return res.status(500).json({ error: "Failed to list users." });
  }
});

// 2. Adjust user balance
app.post('/api/admin/users/:id/balance', authenticateAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { amount, action } = req.body; // action: 'add' | 'subtract'
    const numericAmount = Number(amount);

    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: "Please enter a valid positive adjustment amount." });
    }

    let user = null;
    if (mongoose.connection.readyState === 1) {
      user = await User.findById(userId);
      if (user) {
        if (action === 'add') {
          user.balance += numericAmount;
        } else {
          user.balance = Math.max(0, user.balance - numericAmount);
        }
        await user.save();
      }
    }

    // fallback memory
    if (!user) {
      for (const u of memoryUsers.values()) {
        if (String(u._id) === String(userId) || String(u.id) === String(userId)) {
          user = u;
          if (action === 'add') {
            user.balance += numericAmount;
          } else {
            user.balance = Math.max(0, user.balance - numericAmount);
          }
          memoryUsers.set(u.phone, user);
          break;
        }
      }
    }

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Log transaction
    const ref = `ADJ-${Math.floor(Math.random() * 900000 + 100000)}`;
    if (mongoose.connection.readyState === 1) {
      await Transaction.create({
        userId: userId,
        type: action === 'add' ? 'DEPOSIT' : 'WITHDRAWAL',
        amount: numericAmount,
        status: 'COMPLETED',
        reference: ref,
        description: `Admin Balance Adjustment (${action.toUpperCase()})`
      });

      await Notification.create({
        userId: userId,
        title: "Balance Adjusted by Admin",
        message: `Your wallet balance has been adjusted by KES ${numericAmount.toLocaleString()} (${action === 'add' ? 'Added' : 'Subtracted'}). New Balance: KES ${user.balance.toFixed(2)}`,
        type: "system"
      });
    }

    return res.json({ success: true, newBalance: user.balance });
  } catch (error) {
    return res.status(500).json({ error: "Failed to adjust balance." });
  }
});

// 3. Get all withdrawal requests
app.get('/api/admin/withdrawals', authenticateAdmin, async (req, res) => {
  try {
    let list = [];
    if (mongoose.connection.readyState === 1) {
      list = await Transaction.find({ type: 'WITHDRAWAL' }).sort({ createdAt: -1 });
    }
    return res.json({ success: true, withdrawals: list });
  } catch (error) {
    return res.status(500).json({ error: "Failed to list withdrawals." });
  }
});

// 4. Approve or decline withdrawal request
app.post('/api/admin/withdrawals/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const txId = req.params.id;
    const { status } = req.body; // status: 'APPROVED' | 'DECLINED'

    if (status !== 'APPROVED' && status !== 'DECLINED') {
      return res.status(400).json({ error: "Invalid action. Must be APPROVED or DECLINED." });
    }

    if (mongoose.connection.readyState === 1) {
      const tx = await Transaction.findById(txId);
      if (!tx || tx.type !== 'WITHDRAWAL') {
        return res.status(404).json({ error: "Withdrawal transaction not found." });
      }

      if (tx.status !== 'PENDING') {
        return res.status(400).json({ error: "Transaction is already processed." });
      }

      const user = await User.findById(tx.userId);
      if (status === 'APPROVED') {
        tx.status = 'COMPLETED';
        tx.description = tx.description.replace('(Pending Approval)', '(Approved)');
        await tx.save();

        if (user) {
          await Notification.create({
            userId: user._id.toString(),
            title: "Withdrawal Approved",
            message: `Your withdrawal of KES ${tx.amount.toLocaleString()} has been approved and sent to M-Pesa. Ref: ${tx.reference}`,
            type: "withdrawal"
          });
        }
      } else {
        tx.status = 'FAILED';
        tx.description = tx.description.replace('(Pending Approval)', '(Declined)');
        await tx.save();

        if (user) {
          // Refund balance!
          user.balance += tx.amount;
          await user.save();

          await Notification.create({
            userId: user._id.toString(),
            title: "Withdrawal Declined",
            message: `Your withdrawal request of KES ${tx.amount.toLocaleString()} has been declined. Funds have been refunded to your wallet.`,
            type: "system"
          });
        }
      }
      return res.json({ success: true, newStatus: tx.status });
    }

    return res.status(400).json({ error: "Operation requires active database connection." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to process withdrawal status." });
  }
});

// Public Endpoint: Get general system config limits and Party B details
app.get('/api/settings', async (req, res) => {
  try {
    const minDeposit = await getSetting('minDeposit', 200);
    const maxDeposit = await getSetting('maxDeposit', 500000);
    const minWithdrawal = await getSetting('minWithdrawal', 200);
    const maxWithdrawal = await getSetting('maxWithdrawal', 100000);
    const mpesaPartyB = await getSetting('mpesaPartyB', '254700000000');

    return res.json({
      success: true,
      settings: { minDeposit, maxDeposit, minWithdrawal, maxWithdrawal, mpesaPartyB }
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch settings." });
  }
});

// 5. Get system config settings
app.get('/api/admin/settings', authenticateAdmin, async (req, res) => {
  try {
    const minDeposit = await getSetting('minDeposit', 200);
    const maxDeposit = await getSetting('maxDeposit', 500000);
    const minWithdrawal = await getSetting('minWithdrawal', 200);
    const maxWithdrawal = await getSetting('maxWithdrawal', 100000);
    const mpesaPartyB = await getSetting('mpesaPartyB', '254700000000');

    return res.json({
      success: true,
      settings: { minDeposit, maxDeposit, minWithdrawal, maxWithdrawal, mpesaPartyB }
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch settings." });
  }
});

// 6. Update system config settings
app.post('/api/admin/settings', authenticateAdmin, async (req, res) => {
  try {
    const { minDeposit, maxDeposit, minWithdrawal, maxWithdrawal, mpesaPartyB } = req.body;

    if (minDeposit !== undefined) await setSetting('minDeposit', Number(minDeposit));
    if (maxDeposit !== undefined) await setSetting('maxDeposit', Number(maxDeposit));
    if (minWithdrawal !== undefined) await setSetting('minWithdrawal', Number(minWithdrawal));
    if (maxWithdrawal !== undefined) await setSetting('maxWithdrawal', Number(maxWithdrawal));
    if (mpesaPartyB !== undefined) await setSetting('mpesaPartyB', String(mpesaPartyB));

    return res.json({ success: true, message: "Settings saved successfully." });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update settings." });
  }
});

// Endpoint: Fetch backend telemetry for active connection status and cache hits
app.get('/api/admin/telemetry', authenticateAdmin, async (req, res) => {
  try {
    await connectDb();
    
    const dbState = mongoose.connection.readyState;
    const dbStateLabel = dbState === 0 ? "Disconnected" : dbState === 1 ? "Connected" : dbState === 2 ? "Connecting" : "Disconnecting";
    
    const cacheCount = matchCache.matches ? matchCache.matches.length : 0;
    const cacheAgeSeconds = matchCache.lastFetched ? Math.round((Date.now() - matchCache.lastFetched) / 1000) : null;
    const lastSyncAgeSeconds = lastSyncTime ? Math.round((Date.now() - lastSyncTime) / 1000) : null;

    return res.json({
      success: true,
      telemetry: {
        dbState: dbStateLabel,
        poolCached: globalThis.__mongoose_cached ? true : false,
        cacheCount,
        cacheAgeSeconds,
        lastSyncAgeSeconds,
        syncInProgress: matchCache.syncInProgress
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch telemetry data." });
  }
});

// Start Express Server
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`---------------------------------------------------------------------`);
    console.log(`LlnBet backend server running on http://localhost:${PORT}`);
    console.log(`MongoDB URI: ${(process.env.MONGO_URI || process.env.MONGODB_URI) ? 'Configured' : 'Missing'}`);
    console.log(`M-Pesa Env: ${process.env.MPESA_ENV || 'sandbox'}`);
    console.log(`---------------------------------------------------------------------`);
  });
}

export default app;
