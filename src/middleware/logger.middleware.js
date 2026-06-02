const morgan = require("morgan");
const env = require("../config/env");

const logger = morgan(env.NODE_ENV === "production" ? "combined" : "dev");

module.exports = { logger };
