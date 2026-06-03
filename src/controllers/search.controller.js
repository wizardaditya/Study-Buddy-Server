const User = require("../models/User.model");
const Post = require("../models/Post.model");
const Doubt = require("../models/Doubt.model");
const Project = require("../models/Project.model");
const { sendSuccess, sendError } = require("../utils/response.utils");

async function search(req, res) {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return sendSuccess(res, { users: [], posts: [], doubts: [], projects: [] });
    }

    const regex = { $regex: q.trim(), $options: "i" };

    const [users, posts, doubts, projects] = await Promise.all([
      User.find({
        isActive: true,
        $or: [{ name: regex }, { username: regex }, { bio: regex }],
      })
        .select("name username avatar bio role")
        .limit(5)
        .lean(),

      Post.find({
        isDeleted: false,
        content: regex,
      })
        .populate("author", "name username avatar")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      Doubt.find({
        $or: [{ title: regex }, { content: regex }],
      })
        .populate("author", "name username avatar")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),

      Project.find({
        $or: [{ title: regex }, { description: regex }],
      })
        .populate("owner", "name username avatar")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return sendSuccess(res, { users, posts, doubts, projects });
  } catch (err) {
    return sendError(res, "Search failed", 500);
  }
}

module.exports = { search };
