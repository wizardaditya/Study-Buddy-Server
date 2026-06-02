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
app.use(
  cors({
    origin: [env.FRONTEND_URL, "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

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
