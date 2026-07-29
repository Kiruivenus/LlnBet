const mongoose = require('mongoose');

// User Schema
const UserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  balance: { type: Number, default: 0.00 },
  bonusBalance: { type: Number, default: 0.00 },
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: String },
  referralCount: { type: Number, default: 0 },
  referralEarnings: { type: Number, default: 0.00 },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  verified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Transaction Schema
const TransactionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  type: { type: String, enum: ['DEPOSIT', 'WITHDRAWAL', 'BET_PLACED', 'BET_WON', 'BONUS'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED', 'DECLINED'], default: 'PENDING' },
  reference: { type: String, required: true, unique: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Bet Schema
const BetSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  betId: { type: String, required: true, unique: true },
  type: { type: String, enum: ['SINGLE', 'MULTIPLE'], default: 'SINGLE' },
  stake: { type: Number, required: true },
  totalOdds: { type: Number, required: true },
  possiblePayout: { type: Number, required: true },
  status: { type: String, enum: ['OPEN', 'WON', 'LOST', 'CASHOUT'], default: 'OPEN' },
  selections: [
    {
      id: String,
      matchId: String,
      matchName: String,
      team: String,
      market: String,
      odds: Number,
      status: { type: String, enum: ['OPEN', 'WON', 'LOST'], default: 'OPEN' }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

// Notification Schema
const NotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  type: { type: String, default: 'info' },
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

// Match Cache Schema
const MatchSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  sport: String,
  league: String,
  country: String,
  isLive: Boolean,
  isCustom: Boolean,
  timer: String,
  scores: { home: Number, away: Number },
  kickoffTime: String,
  teams: {
    home: { name: String },
    away: { name: String }
  },
  venue: String,
  stats: mongoose.Schema.Types.Mixed,
  markets: mongoose.Schema.Types.Mixed,
  updatedAt: { type: Date, default: Date.now }
});

// Setting Schema
const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
});

// Enterprise M-Pesa STK Push Payment Transaction Schema
const MpesaTransactionSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true, index: true },
  merchantRequestID: { type: String, index: true },
  checkoutRequestID: { type: String, index: true },
  userId: { type: String, required: true, index: true },
  phone: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
  resultCode: { type: Number },
  resultDesc: { type: String },
  mpesaReceiptNumber: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Booking Code Schema for Shareable Betslip Links
const BookingCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true },
  selections: [mongoose.Schema.Types.Mixed],
  createdAt: { type: Date, default: Date.now, expires: 604800 }
});

module.exports = {
  User: mongoose.models.User || mongoose.model('User', UserSchema),
  Transaction: mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema),
  Bet: mongoose.models.Bet || mongoose.model('Bet', BetSchema),
  Notification: mongoose.models.Notification || mongoose.model('Notification', NotificationSchema),
  OddsHistory: mongoose.models.OddsHistory || mongoose.model('OddsHistory', OddsHistorySchema),
  Match: mongoose.models.Match || mongoose.model('Match', MatchSchema),
  Setting: mongoose.models.Setting || mongoose.model('Setting', SettingSchema),
  MpesaTransaction: mongoose.models.MpesaTransaction || mongoose.model('MpesaTransaction', MpesaTransactionSchema),
  BookingCode: mongoose.models.BookingCode || mongoose.model('BookingCode', BookingCodeSchema)
};
