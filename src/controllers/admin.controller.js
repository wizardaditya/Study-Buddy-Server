const User = require("../models/User.model");
const Mentor = require("../models/Mentor.model");
const Doubt = require("../models/Doubt.model");
const Post = require("../models/Post.model");
const Subscription = require("../models/Subscription.model");
const { sendSuccess, sendError } = require("../utils/response.utils");
const { startOfDay } = require("../utils/date.utils");

async function getStats(req, res) {
  try {
    const [totalUsers, activeSubscriptions, doubtsToday, totalPosts] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Subscription.countDocuments({ status: "active" }),
      Doubt.countDocuments({ createdAt: { $gte: startOfDay() } }),
      Post.countDocuments({ isDeleted: false }),
    ]);
    return sendSuccess(res, { totalUsers, activeSubscriptions, doubtsToday, totalPosts, openReports: 0 });
  } catch (err) {
    return sendError(res, "Failed to get stats", 500);
  }
}

async function getUsers(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const users = await User.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    return sendSuccess(res, users);
  } catch (err) {
    return sendError(res, "Failed to get users", 500);
  }
}

async function banUser(req, res) {
  try {
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    return sendSuccess(res, null, "User banned");
  } catch (err) {
    return sendError(res, "Failed to ban user", 500);
  }
}

async function getPendingMentors(req, res) {
  try {
    const mentors = await Mentor.find({ isVerified: false })
      .populate("user", "name email username avatar").lean();
    return sendSuccess(res, mentors);
  } catch (err) {
    return sendError(res, "Failed to get pending mentors", 500);
  }
}

async function verifyMentor(req, res) {
  try {
    await Mentor.findByIdAndUpdate(req.params.id, { isVerified: true });
    const mentor = await Mentor.findById(req.params.id);
    await User.findByIdAndUpdate(mentor.user, { role: "mentor" });
    return sendSuccess(res, null, "Mentor verified");
  } catch (err) {
    return sendError(res, "Failed to verify mentor", 500);
  }
}

module.exports = { getStats, getUsers, banUser, getPendingMentors, verifyMentor };
