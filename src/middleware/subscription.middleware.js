const User = require("../models/User.model");
const { sendError } = require("../utils/response.utils");

function requirePlan(...plans) {
  return async (req, res, next) => {
    if (!req.user) return sendError(res, "Unauthorized", 401);
    const user = await User.findById(req.user.userId).select("plan").lean();
    if (!user || !plans.includes(user.plan)) {
      return sendError(res, `This feature requires a ${plans.join(" or ")} subscription`, 403);
    }
    next();
  };
}

const requirePro = requirePlan("pro", "elite");
const requireElite = requirePlan("elite");

module.exports = { requirePlan, requirePro, requireElite };
