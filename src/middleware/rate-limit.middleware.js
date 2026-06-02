const rateLimit = require("express-rate-limit");

const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later" },
});

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many auth attempts, try again in 15 minutes" },
});

const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: "AI rate limit exceeded" },
});

module.exports = { globalRateLimit, authRateLimit, aiRateLimit };
