const { sendError } = require("../utils/response.utils");

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return sendError(res, "Unauthorized", 401);
    if (!roles.includes(req.user.role)) return sendError(res, "Forbidden — insufficient permissions", 403);
    next();
  };
}

const requireAdmin = requireRole("admin");
const requireMentor = requireRole("mentor", "admin");

module.exports = { requireRole, requireAdmin, requireMentor };
