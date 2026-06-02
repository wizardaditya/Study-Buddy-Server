const Mentor = require("../models/Mentor.model");
const User = require("../models/User.model");
const { sendSuccess, sendError } = require("../utils/response.utils");

async function getMentors(req, res) {
  try {
    const filter = { isVerified: true };
    if (req.query.expertise) filter.expertise = req.query.expertise;
    const mentors = await Mentor.find(filter)
      .sort({ rating: -1 })
      .populate("user", "name username avatar bio city state")
      .lean();
    return sendSuccess(res, mentors);
  } catch (err) {
    return sendError(res, "Failed to get mentors", 500);
  }
}

async function getMentor(req, res) {
  try {
    const user = await User.findOne({ username: req.params.username }).lean();
    if (!user) return sendError(res, "Mentor not found", 404);
    const mentor = await Mentor.findOne({ user: user._id })
      .populate("user", "name username avatar bio city state").lean();
    if (!mentor) return sendError(res, "Mentor not found", 404);
    return sendSuccess(res, mentor);
  } catch (err) {
    return sendError(res, "Failed to get mentor", 500);
  }
}

async function applyAsMentor(req, res) {
  try {
    const { expertise, hourlyRate, bio } = req.body;
    const existing = await Mentor.findOne({ user: req.user.userId });
    if (existing) return sendError(res, "Already applied as mentor", 409);
    await Mentor.create({ user: req.user.userId, expertise, hourlyRate, bio });
    return sendSuccess(res, null, "Mentor application submitted! We'll review it shortly.", 201);
  } catch (err) {
    return sendError(res, "Failed to apply", 500);
  }
}

async function bookSession(req, res) {
  try {
    const { scheduledAt, topic } = req.body;
    // TODO: create session record, send email, charge Razorpay
    return sendSuccess(res, null, "Session booked! Check your email for confirmation.", 201);
  } catch (err) {
    return sendError(res, "Failed to book session", 500);
  }
}

module.exports = { getMentors, getMentor, applyAsMentor, bookSession };
