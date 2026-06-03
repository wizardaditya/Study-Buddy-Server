require("dotenv").config();

function required(key) {
  const value = process.env[key];
  if (!value) {
    // During build phase (npm install), env vars may not be set — skip exit
    if (process.env.npm_lifecycle_event === "install") {
      return "";
    }
    console.error(`❌ Missing required env variable: ${key}`);
    process.exit(1);
  }
  return value;
}

function optional(key, defaultValue = "") {
  return process.env[key] || defaultValue;
}

const env = {
  NODE_ENV:                  optional("NODE_ENV", "development"),
  PORT:                      parseInt(optional("PORT", "4000")),

  // Database
  DATABASE_URL:              required("DATABASE_URL"),

  // Redis — optional, falls back to in-memory if not set
  REDIS_URL:                 optional("REDIS_URL", ""),

  // Auth
  JWT_SECRET:                required("JWT_SECRET"),
  JWT_REFRESH_SECRET:        required("JWT_REFRESH_SECRET"),
  JWT_EXPIRES_IN:            optional("JWT_EXPIRES_IN", "15m"),
  JWT_REFRESH_EXPIRES_IN:    optional("JWT_REFRESH_EXPIRES_IN", "7d"),

  // OpenAI
  OPENAI_API_KEY:            optional("OPENAI_API_KEY", ""),
  OPENAI_MODEL:              optional("OPENAI_MODEL", "gpt-4o"),
  OPENAI_EMBEDDING_MODEL:    optional("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME:     optional("CLOUDINARY_CLOUD_NAME"),
  CLOUDINARY_API_KEY:        optional("CLOUDINARY_API_KEY"),
  CLOUDINARY_API_SECRET:     optional("CLOUDINARY_API_SECRET"),

  // Razorpay
  RAZORPAY_KEY_ID:           optional("RAZORPAY_KEY_ID"),
  RAZORPAY_KEY_SECRET:       optional("RAZORPAY_KEY_SECRET"),

  // Resend email
  RESEND_API_KEY:            optional("RESEND_API_KEY"),
  FROM_EMAIL:                optional("FROM_EMAIL", "hello@studybuddy.in"),

  // Frontend
  FRONTEND_URL:              optional("FRONTEND_URL", "http://localhost:5173"),
};

module.exports = env;
