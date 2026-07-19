import mongoose from 'mongoose';

// User Schema
const UserSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: 'LlnBet Player' },
  balance: { type: Number, default: 0.00 },
  bonusBalance: { type: Number, default: 0.00 },
  verified: { type: Boolean, default: true },
  referredBy: { type: String, default: null },
  referralCount: { type: Number, default: 0 },
  referralEarnings: { type: Number, default: 0.00 },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
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

// Match Cache Schema
const MatchSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  sport: String,
  league: String,
  country: String,
  isLive: Boolean,
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

export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);
export const Bet = mongoose.models.Bet || mongoose.model('Bet', BetSchema);
export const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
export const OddsHistory = mongoose.models.OddsHistory || mongoose.model('OddsHistory', OddsHistorySchema);
export const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema);
export const Setting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);
