const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "StudyRoom" },
    content: { type: String, required: true, maxlength: 2000 },
    type: { type: String, enum: ["text", "image", "file"], default: "text" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

MessageSchema.index({ room: 1, createdAt: 1 });
MessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

module.exports = mongoose.model("Message", MessageSchema);
