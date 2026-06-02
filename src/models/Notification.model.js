const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["like", "comment", "follow", "answer", "answer_accepted", "mention", "system", "streak"],
      required: true,
    },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", NotificationSchema);
