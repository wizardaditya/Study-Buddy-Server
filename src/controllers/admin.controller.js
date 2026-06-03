const User = require("../models/User.model");
const Mentor = require("../models/Mentor.model");
const Doubt = require("../models/Doubt.model");
const Answer = require("../models/Answer.model");
const Post = require("../models/Post.model");
const Comment = require("../models/Comment.model");
const Like = require("../models/Like.model");
const Follow = require("../models/Follow.model");
const Notification = require("../models/Notification.model");
const Project = require("../models/Project.model");
const MockTest = require("../models/MockTest.model");
const HiringPost = require("../models/HiringPost.model");
const Topic = require("../models/Topic.model");
const AuraSession = require("../models/AuraSession.model");
const AuraMemory = require("../models/AuraMemory.model");
const Streak = require("../models/Streak.model");
const StudyRoom = require("../models/StudyRoom.model");
const Message = require("../models/Message.model");
const Subscription = require("../models/Subscription.model");
const TestAttempt = require("../models/TestAttempt.model");
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

async function purgeAllData(req, res) {
  try {
    const adminId = req.user._id;

    // Delete all non-admin users
    await User.deleteMany({ role: { $ne: "admin" } });

    // Delete all content collections
    await Promise.all([
      Post.deleteMany({}),
      Comment.deleteMany({}),
      Like.deleteMany({}),
      Doubt.deleteMany({}),
      Answer.deleteMany({}),
      Follow.deleteMany({}),
      Notification.deleteMany({}),
      Project.deleteMany({}),
      MockTest.deleteMany({}),
      HiringPost.deleteMany({}),
      Topic.deleteMany({}),
      AuraSession.deleteMany({}),
      AuraMemory.deleteMany({}),
      Streak.deleteMany({}),
      StudyRoom.deleteMany({}),
      Message.deleteMany({}),
      Subscription.deleteMany({}),
      TestAttempt.deleteMany({}),
      Mentor.deleteMany({}),
    ]);

    return sendSuccess(res, null, "All dummy data purged. Database is clean.");
  } catch (err) {
    return sendError(res, "Purge failed: " + err.message, 500);
  }
}

module.exports = { getStats, getUsers, banUser, getPendingMentors, verifyMentor, purgeAllData };
