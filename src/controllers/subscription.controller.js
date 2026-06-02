const crypto = require("crypto");
const Subscription = require("../models/Subscription.model");
const User = require("../models/User.model");
const env = require("../config/env");
const { sendSuccess, sendError } = require("../utils/response.utils");

const PLANS = {
  pro: { amount: 299, name: "Pro" },
  elite: { amount: 699, name: "Elite" },
};

async function getPlans(req, res) {
  return sendSuccess(res, PLANS);
}

async function createOrder(req, res) {
  try {
    const { planId } = req.body;
    const plan = PLANS[planId];
    if (!plan) return sendError(res, "Invalid plan", 400);

    // TODO: use Razorpay SDK to create real order
    // const Razorpay = require("razorpay");
    // const rzp = new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
    // const order = await rzp.orders.create({ amount: plan.amount * 100, currency: "INR" });

    const mockOrderId = `order_${Date.now()}`;
    return sendSuccess(res, { orderId: mockOrderId, amount: plan.amount, currency: "INR" });
  } catch (err) {
    return sendError(res, "Failed to create order", 500);
  }
}

async function verifyPayment(req, res) {
  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, planId } = req.body;

    // Verify signature
    if (env.RAZORPAY_KEY_SECRET) {
      const body = `${razorpayOrderId}|${razorpayPaymentId}`;
      const expectedSignature = crypto
        .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");
      if (expectedSignature !== razorpaySignature) {
        return sendError(res, "Payment verification failed", 400);
      }
    }

    const plan = PLANS[planId];
    if (!plan) return sendError(res, "Invalid plan", 400);

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    await Subscription.create({
      user: req.user.userId,
      plan: planId,
      status: "active",
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      amount: plan.amount,
      expiresAt,
    });

    await User.findByIdAndUpdate(req.user.userId, { plan: planId });
    return sendSuccess(res, null, "Subscription activated!");
  } catch (err) {
    return sendError(res, "Failed to verify payment", 500);
  }
}

async function getStatus(req, res) {
  try {
    const sub = await Subscription.findOne({ user: req.user.userId, status: "active" })
      .sort({ createdAt: -1 }).lean();
    const user = await User.findById(req.user.userId).select("plan").lean();
    return sendSuccess(res, {
      plan: user?.plan || "free",
      status: sub ? "active" : "inactive",
      expiresAt: sub?.expiresAt,
    });
  } catch (err) {
    return sendError(res, "Failed to get status", 500);
  }
}

module.exports = { getPlans, createOrder, verifyPayment, getStatus };
