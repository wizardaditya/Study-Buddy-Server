const router = require("express").Router();
const HiringPost = require("../models/HiringPost.model");
const { authenticate } = require("../middleware/auth.middleware");
const { requireElite } = require("../middleware/subscription.middleware");
const { sendSuccess, sendError } = require("../utils/response.utils");

router.get("/", authenticate, requireElite, async (req, res) => {
  try {
    const jobs = await HiringPost.find({ isActive: true })
      .sort({ postedAt: -1 })
      .populate("postedBy", "name username").lean();
    return sendSuccess(res, jobs);
  } catch (err) {
    return sendError(res, "Failed to get jobs", 500);
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const { companyName, role, skills, salary, location, type, description, applyUrl } = req.body;
    const job = await HiringPost.create({
      companyName, role, skills, salary, location, type, description, applyUrl,
      postedBy: req.user.userId,
    });
    return sendSuccess(res, job.toObject(), "Job posted", 201);
  } catch (err) {
    return sendError(res, "Failed to post job", 500);
  }
});

module.exports = router;
