require("dotenv").config();

const required = (key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required env variable: ${key}`);
    process.exit(1);
  }
  return process.env[key];
};

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT || "4000"),
  DATABASE_URL: required("DATABASE_URL"),
  REDIS_URL: required("REDIS_URL"),
  JWT_SECRET: required("JWT_SECRET"),
  JWT_REFRESH_SECRET: required("JWT_REFRESH_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  OPENAI_API_KEY: required("OPENAI_API_KEY"),
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o",
  OPENAI_EMBEDDING_MODEL: process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small",
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  FROM_EMAIL: process.env.FROM_EMAIL || "hello@studybuddy.in",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
};

module.exports = env;
