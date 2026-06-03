const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, minlength: 3, maxlength: 30 },
    name: { type: String, required: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["student", "mentor", "admin"], default: "student" },
    avatar: String,
    bio: { type: String, maxlength: 300 },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: Date,
    plan: { type: String, enum: ["free", "pro", "elite"], default: "free" },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    googleId: { type: String, sparse: true },
    skills: [{ type: String, trim: true }],
    github: String,
    linkedin: String,
    college: String,
    city: String,
    state: String,
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Only use schema.index() — remove duplicates by NOT using index:true on email/username above
// (unique:true on field definition is enough, no need for extra schema.index)
UserSchema.index({ xp: -1 });
UserSchema.index({ currentStreak: -1 });

module.exports = mongoose.model("User", UserSchema);
