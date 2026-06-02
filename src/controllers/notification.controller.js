const Notification = require("../models/Notification.model");
const { sendSuccess, sendError } = require("../utils/response.utils");

async function getNotifications(req, res) {
  try {
    const notifications = await Notification.find({ user: req.user.userId })
      .sort({ createdAt: -1 }).limit(50).lean();
    return sendSuccess(res, notifications);
  } catch (err) {
    return sendError(res, "Failed to get notifications", 500);
  }
}

async function markRead(req, res) {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { isRead: true }
    );
    return sendSuccess(res, null, "Marked as read");
  } catch (err) {
    return sendError(res, "Failed to mark notification", 500);
  }
}

async function markAllRead(req, res) {
  try {
    await Notification.updateMany({ user: req.user.userId, isRead: false }, { isRead: true });
    return sendSuccess(res, null, "All marked as read");
  } catch (err) {
    return sendError(res, "Failed to mark notifications", 500);
  }
}

module.exports = { getNotifications, markRead, markAllRead };
