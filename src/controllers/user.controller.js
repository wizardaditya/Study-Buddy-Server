const User = require("../models/User.model");
const Follow = require("../models/Follow.model");
const { sendSuccess, sendError, sendPaginated } = require("../utils/response.utils");
const { getPagination } = require("../utils/pagination.utils");

async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.userId).lean();
    if (!user) return sendError(res, "User not found", 404);
    return sendSuccess(res, user);
  } catch (err) {
    return sendError(res, "Failed to get profile", 500);
  }
}

async function updateMe(req, res) {
  try {
    const allowed = ["name", "bio", "avatar", "skills", "github", "linkedin", "college", "city", "state"];
    const updates = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });
    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).lean();
    return sendSuccess(res, user, "Profile updated");
  } catch (err) {
    return sendError(res, "Failed to update profile", 500);
  }
}

async function getProfile(req, res) {
  try {
    const user = await User.findOne({ username: req.params.username }).lean();
    if (!user) return sendError(res, "User not found", 404);
    let isFollowing = false;
    if (req.user) {
      const follow = await Follow.findOne({ follower: req.user.userId, following: user._id });
      isFollowing = !!follow;
    }
    return sendSuccess(res, { ...user, isFollowing });
  } catch (err) {
    return sendError(res, "Failed to get profile", 500);
  }
}

async function followUser(req, res) {
  try {
    const { id } = req.params;
    if (id === req.user.userId) return sendError(res, "Cannot follow yourself", 400);
    const already = await Follow.findOne({ follower: req.user.userId, following: id });
    if (already) return sendError(res, "Already following", 409);
    await Follow.create({ follower: req.user.userId, following: id });
    await User.findByIdAndUpdate(req.user.userId, { $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(id, { $inc: { followersCount: 1 } });
    return sendSuccess(res, null, "Followed successfully");
  } catch (err) {
    return sendError(res, "Failed to follow", 500);
  }
}

async function unfollowUser(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Follow.findOneAndDelete({ follower: req.user.userId, following: id });
    if (!deleted) return sendError(res, "Not following this user", 400);
    await User.findByIdAndUpdate(req.user.userId, { $inc: { followingCount: -1 } });
    await User.findByIdAndUpdate(id, { $inc: { followersCount: -1 } });
    return sendSuccess(res, null, "Unfollowed successfully");
  } catch (err) {
    return sendError(res, "Failed to unfollow", 500);
  }
}

async function getLeaderboard(req, res) {
  try {
    const type = req.query.type || "xp";
    const sort = type === "streak" ? { currentStreak: -1 } : { xp: -1 };
    const users = await User.find({ isActive: true }).sort(sort).limit(50).lean();
    const data = users.map((u, i) => ({
      rank: i + 1,
      user: { _id: u._id, name: u.name, username: u.username, avatar: u.avatar },
      xp: u.xp, streak: u.currentStreak, level: u.level,
    }));
    return sendSuccess(res, data);
  } catch (err) {
    return sendError(res, "Failed to get leaderboard", 500);
  }
}

module.exports = { getMe, updateMe, getProfile, followUser, unfollowUser, getLeaderboard };
