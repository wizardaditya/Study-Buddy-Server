const Message = require("../models/Message.model");

function registerChatSocket(io, socket) {
  // Join a room's chat
  socket.on("join_room", (roomId) => {
    socket.join(`room:${roomId}`);
    io.to(`room:${roomId}`).emit("user_joined", { userId: socket.userId, socketId: socket.id });
    console.log(`[Chat] User ${socket.userId} joined room ${roomId}`);
  });

  socket.on("leave_room", (roomId) => {
    socket.leave(`room:${roomId}`);
    io.to(`room:${roomId}`).emit("user_left", { userId: socket.userId });
  });

  socket.on("send_message", async ({ roomId, content, type = "text" }) => {
    if (!content?.trim()) return;
    try {
      const message = await Message.create({
        sender: socket.userId,
        room: roomId,
        content: content.trim(),
        type,
      });
      await message.populate("sender", "name username avatar");
      io.to(`room:${roomId}`).emit("message_received", message.toObject());
    } catch (err) {
      console.error("[Chat] Failed to save message:", err.message);
    }
  });

  socket.on("typing_start", ({ roomId }) => {
    socket.to(`room:${roomId}`).emit("typing_indicator", { userId: socket.userId, isTyping: true });
  });

  socket.on("typing_stop", ({ roomId }) => {
    socket.to(`room:${roomId}`).emit("typing_indicator", { userId: socket.userId, isTyping: false });
  });
}

module.exports = { registerChatSocket };
