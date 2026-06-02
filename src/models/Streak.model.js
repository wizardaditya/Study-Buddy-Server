const mongoose = require("mongoose");

const StreakSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: Date,
    totalActiveDays: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Streak", StreakSchema);
