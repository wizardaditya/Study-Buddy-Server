const Project = require("../models/Project.model");
const User = require("../models/User.model");
const { sendSuccess, sendError, sendPaginated } = require("../utils/response.utils");
const { getPagination } = require("../utils/pagination.utils");

async function getProjects(req, res) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { isPublished: true };

    if (req.query.topic) filter.topic = req.query.topic;
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    const total = await Project.countDocuments(filter);
    const projects = await Project.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name username avatar")
      .lean();

    return sendPaginated(res, projects, { page, limit, total });
  } catch (err) {
    return sendError(res, "Failed to get projects", 500);
  }
}

async function createProject(req, res) {
  try {
    const { title, description, topic, tags, githubUrl, demoUrl, mediaUrl } = req.body;

    if (!title || !description || !topic) {
      return sendError(res, "Title, description and topic are required", 400);
    }

    const project = await Project.create({
      title, description, topic, tags, githubUrl, demoUrl, mediaUrl,
      author: req.user.userId,
    });

    await project.populate("author", "name username avatar");

    // Award XP for sharing a project
    await User.findByIdAndUpdate(req.user.userId, { $inc: { xp: 20 } });

    return sendSuccess(res, project.toObject(), "Project shared!", 201);
  } catch (err) {
    return sendError(res, "Failed to create project", 500);
  }
}

async function getProject(req, res) {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("author", "name username avatar bio")
      .lean();

    if (!project) return sendError(res, "Project not found", 404);
    return sendSuccess(res, project);
  } catch (err) {
    return sendError(res, "Failed to get project", 500);
  }
}

async function starProject(req, res) {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return sendError(res, "Project not found", 404);

    const alreadyStarred = project.starredBy.includes(req.user.userId);
    if (alreadyStarred) {
      project.starredBy.pull(req.user.userId);
      project.stars = Math.max(0, project.stars - 1);
    } else {
      project.starredBy.push(req.user.userId);
      project.stars += 1;
    }
    await project.save();

    return sendSuccess(res, { stars: project.stars, starred: !alreadyStarred });
  } catch (err) {
    return sendError(res, "Failed to star project", 500);
  }
}

async function deleteProject(req, res) {
  try {
    const project = await Project.findOne({ _id: req.params.id, author: req.user.userId });
    if (!project) return sendError(res, "Project not found or not authorized", 404);
    await Project.findByIdAndDelete(req.params.id);
    return sendSuccess(res, null, "Project deleted");
  } catch (err) {
    return sendError(res, "Failed to delete project", 500);
  }
}

module.exports = { getProjects, createProject, getProject, starProject, deleteProject };
