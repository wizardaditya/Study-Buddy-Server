const env = require("./env");

let redis = null;

// Simple in-memory fallback when Redis URL not configured
const memoryStore = new Map();

const memoryRedis = {
  get: async (key) => memoryStore.get(key) || null,
  set: async (key, value) => { memoryStore.set(key, value); return "OK"; },
  setex: async (key, ttl, value) => {
    memoryStore.set(key, value);
    setTimeout(() => memoryStore.delete(key), ttl * 1000);
    return "OK";
  },
  del: async (key) => { memoryStore.delete(key); return 1; },
  incr: async (key) => {
    const val = parseInt(memoryStore.get(key) || "0") + 1;
    memoryStore.set(key, String(val));
    return val;
  },
  expire: async (key, ttl) => {
    setTimeout(() => memoryStore.delete(key), ttl * 1000);
    return 1;
  },
  connect: async () => {},
  on: () => {},
};

async function connectRedis() {
  if (!env.REDIS_URL) {
    console.warn("⚠️  REDIS_URL not set — using in-memory store (not for production)");
    redis = memoryRedis;
    return;
  }

  try {
    const Redis = require("ioredis");
    redis = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        return Math.min(times * 50, 2000);
      },
      lazyConnect: true,
      tls: env.REDIS_URL.startsWith("rediss://") ? {} : undefined,
    });
    redis.on("connect", () => console.log("✅ Redis connected"));
    redis.on("error", (err) => {
      console.error("❌ Redis error:", err.message);
      // Fall back to memory store on persistent errors
      redis = memoryRedis;
    });
    await redis.connect();
  } catch (err) {
    console.warn("⚠️  Redis connection failed, using in-memory store:", err.message);
    redis = memoryRedis;
  }
}

function getRedis() {
  return redis || memoryRedis;
}

module.exports = { connectRedis, getRedis };
