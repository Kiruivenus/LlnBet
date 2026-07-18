import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env from parent root directory
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const app = express();
app.use(express.json());

// Serve static frontend files from parent root directory
app.use(express.static(path.resolve(__dirname, '..')));

const JWT_SECRET = process.env.JWT_SECRET || 'betpulse_super_secret_jwt_key_2026';

// ---------------------------------------------------------------------
// MONGODB SCHEMAS & MODELS
// ---------------------------------------------------------------------

// User Schema
const UserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: 'LlnBet Player' },
  balance: { type: Number, default: 0.00 },
  bonusBalance: { type: Number, default: 0.00 },
  verified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Transaction Schema
const TransactionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, enum: ['DEPOSIT', 'WITHDRAWAL', 'BET_PLACED', 'BET_WON', 'CASHOUT'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['COMPLETED', 'PENDING', 'FAILED'], default: 'COMPLETED' },
  reference: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Bet Schema
const BetSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  betId: { type: String, required: true, unique: true },
  selections: { type: Array, required: true },
  totalOdds: { type: Number, required: true },
  stake: { type: Number, required: true },
  possiblePayout: { type: Number, required: true },
  status: { type: String, enum: ['OPEN', 'WON', 'LOST', 'CASHOUT'], default: 'OPEN' },
  cashoutAmount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Notification Schema
const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'system' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Odds History Schema
const OddsHistorySchema = new mongoose.Schema({
  matchId: { type: String, required: true, unique: true },
  r1: Number,
  rx: Number,
  r2: Number,
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
const Bet = mongoose.models.Bet || mongoose.model('Bet', BetSchema);
const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
const OddsHistory = mongoose.models.OddsHistory || mongoose.model('OddsHistory', OddsHistorySchema);

// Connect to MongoDB with Serverless Connection Caching
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
let isDbConnected = false;

async function connectDb() {
  if (isDbConnected && mongoose.connection.readyState === 1) return;
  if (!mongoUri) return;
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    isDbConnected = true;
    console.log("[MONGODB] Connected successfully to MongoDB Database!");
  } catch (err) {
    console.warn("[MONGODB] MongoDB Connection error:", err.message);
  }
}

// Middleware: Ensure Database Connection on incoming API requests
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    await connectDb();
  }
  next();
});

// In-memory fallback maps when Mongo is connecting (Persisted on globalThis)
if (!globalThis.__betpulse_memory_users) globalThis.__betpulse_memory_users = new Map();
if (!globalThis.__betpulse_memory_txs) globalThis.__betpulse_memory_txs = new Map();

const memoryUsers = globalThis.__betpulse_memory_users;
const memoryTransactions = globalThis.__betpulse_memory_txs;

// Resilience Helpers: Query MongoDB with In-Memory fallback
async function findUserByPhone(phone) {
  if (memoryUsers.has(phone)) {
    return memoryUsers.get(phone);
  }

  if (mongoose.connection.readyState === 1) {
    try {
      const u = await User.findOne({ phone }).maxTimeMS(3000);
      if (u) {
        memoryUsers.set(phone, u);
        return u;
      }
    } catch (e) {}
  }
  return null;
}

async function findUserById(id) {
  if (mongoose.connection.readyState === 1 && !String(id).startsWith('mem_')) {
    try {
      const u = await User.findById(id).maxTimeMS(3000);
      if (u) return u;
    } catch (e) {}
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
    const { phone, password, name } = req.body;
    console.log("[REGISTER REQUEST] Phone:", phone, "MongoDB readyState:", mongoose.connection.readyState);

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

    // Check if user exists
    const existingUser = await findUserByPhone(cleanedPhone);
    if (existingUser) {
      return res.status(400).json({ error: "Phone number is already registered. Please login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createUser({
      phone: cleanedPhone,
      password: hashedPassword,
      name: name || `Player_${cleanedPhone.slice(-4)}`,
      balance: 0.00,
      bonusBalance: 0.00
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

    const token = jwt.sign({ id: userId, phone: newUser.phone }, JWT_SECRET, { expiresIn: '14d' });

    return res.json({
      success: true,
      token,
      user: {
        id: userId,
        phone: newUser.phone,
        name: newUser.name,
        balance: newUser.balance,
        bonusBalance: newUser.bonusBalance,
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
    const token = jwt.sign({ id: userId, phone: user.phone }, JWT_SECRET, { expiresIn: '14d' });

    return res.json({
      success: true,
      token,
      user: {
        id: userId,
        phone: user.phone,
        name: user.name,
        balance: user.balance,
        bonusBalance: user.bonusBalance,
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
        verified: user.verified !== false
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch user profile." });
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
// AUTHENTICATION ENDPOINTS
// ---------------------------------------------------------------------

// Endpoint: Register User
app.post('/api/auth/register', async (req, res) => {
  try {
    const { phone, password, name } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: "Phone number and password are required." });
    }

    const cleanedPhone = formatPhoneNumber(phone);
    if (cleanedPhone.length !== 12) {
      return res.status(400).json({ error: "Invalid Kenyan phone number format. Must be e.g. 0712345678 or 254712345678." });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters long." });
    }

    // Check if user exists
    const existingUser = await User.findOne({ phone: cleanedPhone });
    if (existingUser) {
      return res.status(400).json({ error: "Phone number is already registered. Please login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      phone: cleanedPhone,
      password: hashedPassword,
      name: name || `Player_${cleanedPhone.slice(-4)}`,
      balance: 0.00,
      bonusBalance: 0.00
    });

    // Create Welcome Notification
    await Notification.create({
      userId: newUser._id.toString(),
      title: "Welcome to BetPulse!",
      message: "Your account has been registered successfully. Deposit min KES 200 to start betting!",
      type: "system"
    });

    const token = jwt.sign({ id: newUser._id.toString(), phone: newUser.phone }, JWT_SECRET, { expiresIn: '14d' });

    return res.json({
      success: true,
      token,
      user: {
        id: newUser._id.toString(),
        phone: newUser.phone,
        name: newUser.name,
        balance: newUser.balance,
        bonusBalance: newUser.bonusBalance,
        verified: newUser.verified
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
    const user = await User.findOne({ phone: cleanedPhone });

    if (!user) {
      return res.status(400).json({ error: "Invalid phone number or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid phone number or password." });
    }

    const token = jwt.sign({ id: user._id.toString(), phone: user.phone }, JWT_SECRET, { expiresIn: '14d' });

    return res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        phone: user.phone,
        name: user.name,
        balance: user.balance,
        bonusBalance: user.bonusBalance,
        verified: user.verified
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
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.json({
      user: {
        id: user._id.toString(),
        phone: user.phone,
        name: user.name,
        balance: user.balance,
        bonusBalance: user.bonusBalance,
        verified: user.verified
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

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

    // ENFORCE MINIMUM DEPOSIT KES 200
    if (numericAmount < 200) {
      return res.status(400).json({ error: "Minimum deposit amount is KES 200." });
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

    // ENFORCE MINIMUM WITHDRAWAL KES 200
    if (numericAmount < 200) {
      return res.status(400).json({ error: "Minimum withdrawal amount is KES 200." });
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
      status: 'COMPLETED',
      reference: ref,
      description: `M-Pesa B2C Withdrawal to ${targetPhone}`
    });

    await Notification.create({
      userId: user._id.toString(),
      title: "Withdrawal Processed",
      message: `KES ${numericAmount.toLocaleString()} sent to M-Pesa number ${targetPhone}. Ref: ${ref}`,
      type: "withdrawal"
    });

    return res.json({
      success: true,
      message: `Withdrawal of KES ${numericAmount.toLocaleString()} to ${targetPhone} processed successfully.`,
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
app.post('/api/odds', async (req, res) => {
  try {
    const { matchId, r1, rx, r2 } = req.body;
    if (!matchId) return res.status(400).json({ error: "matchId required" });

    if (mongoUri && mongoose.connection.readyState === 1) {
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

app.get('/api/odds', async (req, res) => {
  try {
    if (mongoUri && mongoose.connection.readyState === 1) {
      const records = await OddsHistory.find({}).lean();
      return res.json(records);
    }
    return res.json([]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Start Express Server
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`---------------------------------------------------------------------`);
    console.log(`LlnBet backend server running on http://localhost:${PORT}`);
    console.log(`MongoDB URI: ${mongoUri ? 'Configured' : 'Missing'}`);
    console.log(`M-Pesa Env: ${process.env.MPESA_ENV || 'sandbox'}`);
    console.log(`---------------------------------------------------------------------`);
  });
}

export default app;
