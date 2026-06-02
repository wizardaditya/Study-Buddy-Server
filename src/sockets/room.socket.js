const StudyRoom = require("../models/StudyRoom.model");

function registerRoomSocket(io, socket) {
  socket.on("room_update", async ({ roomId, data }) => {
    try {
      const room = await StudyRoom.findById(roomId);
      if (!room) return;
      if (room.host.toString() !== socket.userId) return; // only host
      io.to(`room:${roomId}`).emit("room_updated", { roomId, ...data });
    } catch (err) {
      console.error("[Room] Update error:", err.message);
    }
  });

  socket.on("end_room", async ({ roomId }) => {
    try {
      const room = await StudyRoom.findById(roomId);
      if (!room || room.host.toString() !== socket.userId) return;
      room.isLive = false;
      await room.save();
      io.to(`room:${roomId}`).emit("room_ended", { roomId });
    } catch (err) {
      console.error("[Room] End room error:", err.message);
    }
  });
}

module.exports = { registerRoomSocket };
