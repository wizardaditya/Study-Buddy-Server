const { Server } = require("socket.io");
const { verifyAccessToken } = require("../utils/jwt.utils");
const { registerChatSocket } = require("./chat.socket");
const { registerRoomSocket } = require("./room.socket");
const { registerNotificationSocket } = require("./notification.socket");
const { registerPresenceSocket } = require("./presence.socket");

// Track online users: userId -> socketId
const onlineUsers = new Map();

function initSocket(httpServer, env) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required"));
    try {
      const payload = verifyAccessToken(token);
      socket.userId = payload.userId;
      socket.userRole = payload.role;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const { userId } = socket;
    console.log(`[Socket] User ${userId} connected (${socket.id})`);

    // Track online
    onlineUsers.set(userId, socket.id);
    socket.broadcast.emit("user_online", { userId });

    // Register event handlers
    registerChatSocket(io, socket);
    registerRoomSocket(io, socket);
    registerNotificationSocket(io, socket);
    registerPresenceSocket(io, socket, onlineUsers);

    socket.on("disconnect", () => {
      console.log(`[Socket] User ${userId} disconnected`);
      onlineUsers.delete(userId);
      socket.broadcast.emit("user_offline", { userId });
    });
  });

  return io;
}

module.exports = { initSocket, onlineUsers };
