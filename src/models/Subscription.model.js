const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: String, enum: ["free", "pro", "elite"], required: true },
    status: { type: String, enum: ["active", "inactive", "expired", "cancelled"], default: "inactive" },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    startedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ user: 1, status: 1 });
SubscriptionSchema.index({ expiresAt: 1 });

module.exports = mongoose.model("Subscription", SubscriptionSchema);
