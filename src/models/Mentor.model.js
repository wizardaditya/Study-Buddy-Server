const mongoose = require("mongoose");

const MentorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    expertise: [{ type: String, trim: true }],
    hourlyRate: { type: Number, required: true, min: 0 },
    bio: { type: String, required: true, maxlength: 500 },
    isVerified: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    availability: [{ day: { type: Number, min: 0, max: 6 }, slots: [String] }],
  },
  { timestamps: true }
);

MentorSchema.index({ isVerified: 1, rating: -1 });
MentorSchema.index({ expertise: 1 });

module.exports = mongoose.model("Mentor", MentorSchema);
