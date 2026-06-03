const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const env = require("./config/env");
const { logger } = require("./middleware/logger.middleware");
const { globalRateLimit } = require("./middleware/rate-limit.middleware");
const { errorHandler, notFound } = require("./middleware/error.middleware");
const routes = require("./routes/index");

const app = express();

// Security
app.use(helmet());
app.set("trust proxy", 1);

// CORS
const allowedOrigins = [
  "https://study-buddy-client-tawny.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
];
if (env.FRONTEND_URL && !allowedOrigins.includes(env.FRONTEND_URL)) {
  allowedOrigins.push(env.FRONTEND_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight for all routes
app.options("*", cors());

// Rate limiting
app.use(globalRateLimit);

// Logging
app.use(logger);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API routes
app.use("/api", routes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;
