const { verifyAccessToken } = require("../utils/jwt.utils");
const { sendError } = require("../utils/response.utils");

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "No token provided", 401);
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = { ...payload, _id: payload.userId };
    next();
  } catch {
    return sendError(res, "Invalid or expired token", 401);
  }
}

function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const payload = verifyAccessToken(token);
      req.user = { ...payload, _id: payload.userId };
    } catch {
      // ignore — optional
    }
  }
  next();
}

module.exports = { authenticate, optionalAuth };
