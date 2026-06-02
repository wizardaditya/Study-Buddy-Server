const http = require("http");
const app = require("./app");
const env = require("./config/env");
const { connectDatabase } = require("./config/database");
const { connectRedis } = require("./config/redis");
const { initSocket } = require("./sockets/socket.server");

// Load cloudinary config (side effects)
require("./config/cloudinary");

const server = http.createServer(app);

// Initialize Socket.IO
const io = initSocket(server, env);

// Make io accessible in routes if needed
app.set("io", io);

async function start() {
  try {
    // Connect to DB and Redis
    await connectDatabase();
    await connectRedis();

    server.listen(env.PORT, () => {
      console.log(`\n🚀 Study Buddy Server running on port ${env.PORT}`);
      console.log(`📍 Environment: ${env.NODE_ENV}`);
      console.log(`🌐 Frontend URL: ${env.FRONTEND_URL}`);
      console.log(`🤖 AI Model: ${env.OPENAI_MODEL}\n`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received — shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

start();
