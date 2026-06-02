const mongoose = require("mongoose");
const env = require("./env");

async function connectDatabase() {
  try {
    await mongoose.connect(env.DATABASE_URL, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ MongoDB connected:", mongoose.connection.host);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

mongoose.connection.on("disconnected", () => console.warn("⚠️  MongoDB disconnected"));
mongoose.connection.on("reconnected", () => console.log("✅ MongoDB reconnected"));

module.exports = { connectDatabase };
