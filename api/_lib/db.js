const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

let cached = globalThis.__mongoose_cached;
if (!cached) {
  cached = globalThis.__mongoose_cached = { conn: null, promise: null };
}

async function connectDb() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!mongoUri) {
    console.warn("[MONGODB] MONGO_URI is missing from environment variables.");
    return null;
  }

  if (!cached.promise) {
    const opts = {
      maxPoolSize: 5,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    };

    console.log("[MONGODB] Initializing new MongoDB connection pool...");
    cached.promise = mongoose.connect(mongoUri, opts)
      .then((m) => {
        console.log("[MONGODB] Connected successfully to MongoDB Database!");
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        console.error("[MONGODB] Connection failed:", err.message);
        return null;
      });
  } else {
    console.log("[MONGODB] Reusing warm database connection pool...");
  }

  try {
    cached.conn = await cached.promise;
    
    // Seed default settings on initial connection if model exists
    if (cached.conn && mongoose.models.Setting) {
      try {
        const count = await mongoose.models.Setting.countDocuments({});
        if (count === 0) {
          await mongoose.models.Setting.create([
            { key: 'minDeposit', value: 200 },
            { key: 'maxDeposit', value: 500000 },
            { key: 'minWithdrawal', value: 200 },
            { key: 'maxWithdrawal', value: 100000 },
            { key: 'mpesaPartyB', value: process.env.MPESA_SHORTCODE || process.env.MPESA_TILL_NUMBER || '174379' }
          ]);
          console.log("[SETTINGS SEED] Default limits and Party B successfully seeded to database!");
        }
      } catch (e) {
        console.warn("[SETTINGS SEED ERROR]:", e.message);
      }
    }
  } catch (e) {
    cached.promise = null; // Clear on error
    console.error("[MONGODB] MongoDB Connection error:", e.message);
  }

  return cached.conn;
}

async function getSetting(key, defaultValue) {
  try {
    await connectDb();
    if (mongoose.connection.readyState === 1 && mongoose.models.Setting) {
      const s = await mongoose.models.Setting.findOne({ key }).lean();
      if (s) return s.value;
    }
  } catch (e) {}
  return defaultValue;
}

async function setSetting(key, value) {
  try {
    await connectDb();
    if (mongoose.connection.readyState === 1 && mongoose.models.Setting) {
      await mongoose.models.Setting.findOneAndUpdate(
        { key },
        { value },
        { upsert: true, new: true }
      );
    }
  } catch (e) {}
}

module.exports = {
  connectDb,
  getSetting,
  setSetting
};
