const mongoose = require("mongoose");

const StudyRoomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    topic: { type: String, required: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isLive: { type: Boolean, default: true },
    maxParticipants: { type: Number, default: 10, min: 2, max: 50 },
    participantsCount: { type: Number, default: 1 },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    roomCode: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

StudyRoomSchema.index({ isLive: 1, createdAt: -1 });

module.exports = mongoose.model("StudyRoom", StudyRoomSchema);
