function registerPresenceSocket(io, socket, onlineUsers) {
  // Let the user know who is online among their contacts
  socket.on("get_online_users", () => {
    const onlineList = Array.from(onlineUsers.keys());
    socket.emit("online_users", onlineList);
  });

  socket.on("ping_presence", () => {
    socket.emit("pong_presence", { userId: socket.userId, timestamp: Date.now() });
  });
}

module.exports = { registerPresenceSocket };
