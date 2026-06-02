const Notification = require("../models/Notification.model");

function registerNotificationSocket(io, socket) {
  // Join personal notification room
  socket.join(`user:${socket.userId}`);
}

// Helper to push a notification to a user in real-time
async function pushNotification(io, userId, { type, content, metadata = {} }) {
  try {
    const notification = await Notification.create({ user: userId, type, content, metadata });
    io.to(`user:${userId}`).emit("notification_new", notification.toObject());
  } catch (err) {
    console.error("[Notification] Push error:", err.message);
  }
}

module.exports = { registerNotificationSocket, pushNotification };
