const mongoose = require("mongoose");

const AuraMessageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed },
});

const AuraSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sessionId: { type: String, required: true, unique: true },
    messages: [AuraMessageSchema],
  },
  { timestamps: true }
);

AuraSessionSchema.index({ user: 1, createdAt: -1 });
AuraSessionSchema.index({ sessionId: 1 });

module.exports = mongoose.model("AuraSession", AuraSessionSchema);
