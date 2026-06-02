const Redis = require("ioredis");
const env = require("./env");

const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
  lazyConnect: true,
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error:", err.message));

async function connectRedis() {
  try {
    await redis.connect();
  } catch (error) {
    console.error("❌ Redis connection failed:", error.message);
  }
}

module.exports = { redis, connectRedis };
