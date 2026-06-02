const Doubt = require("../models/Doubt.model");
const Answer = require("../models/Answer.model");
const User = require("../models/User.model");
const { sendSuccess, sendError, sendPaginated } = require("../utils/response.utils");
const { getPagination } = require("../utils/pagination.utils");

async function getDoubts(req, res) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};
    if (req.query.topic) filter.topic = req.query.topic;
    if (req.query.status) filter.status = req.query.status;
    const total = await Doubt.countDocuments(filter);
    const doubts = await Doubt.find(filter)
      .sort({ createdAt: -1 }).skip(skip).limit(limit)
      .populate("author", "name username avatar level").lean();
    return sendPaginated(res, doubts, { page, limit, total });
  } catch (err) {
    return sendError(res, "Failed to get doubts", 500);
  }
}

async function createDoubt(req, res) {
  try {
    const { title, content, topic, tags } = req.body;
    const doubt = await Doubt.create({ title, content, topic, tags, author: req.user.userId });
    await doubt.populate("author", "name username avatar");
    await User.findByIdAndUpdate(req.user.userId, { $inc: { xp: 15 } });
    return sendSuccess(res, doubt.toObject(), "Doubt posted", 201);
  } catch (err) {
    return sendError(res, "Failed to create doubt", 500);
  }
}

async function getDoubt(req, res) {
  try {
    const doubt = await Doubt.findByIdAndUpdate(
      req.params.id, { $inc: { views: 1 } }, { new: true }
    ).populate("author", "name username avatar level").lean();
    if (!doubt) return sendError(res, "Doubt not found", 404);
    const answers = await Answer.find({ doubt: req.params.id })
      .sort({ isAccepted: -1, upvotes: -1, createdAt: 1 })
      .populate("author", "name username avatar level").lean();
    return sendSuccess(res, { ...doubt, answers });
  } catch (err) {
    return sendError(res, "Failed to get doubt", 500);
  }
}

async function addAnswer(req, res) {
  try {
    const { content } = req.body;
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return sendError(res, "Doubt not found", 404);
    const answer = await Answer.create({ content, doubt: req.params.id, author: req.user.userId });
    await Doubt.findByIdAndUpdate(req.params.id, { $inc: { answersCount: 1 } });
    await answer.populate("author", "name username avatar");
    await User.findByIdAndUpdate(req.user.userId, { $inc: { xp: 20 } });
    return sendSuccess(res, answer.toObject(), "Answer posted", 201);
  } catch (err) {
    return sendError(res, "Failed to post answer", 500);
  }
}

async function acceptAnswer(req, res) {
  try {
    const { id: doubtId, answerId } = req.params;
    const doubt = await Doubt.findOne({ _id: doubtId, author: req.user.userId });
    if (!doubt) return sendError(res, "Not authorized or doubt not found", 403);
    await Answer.updateMany({ doubt: doubtId }, { isAccepted: false });
    const answer = await Answer.findByIdAndUpdate(answerId, { isAccepted: true }, { new: true });
    await Doubt.findByIdAndUpdate(doubtId, { isAnswered: true, status: "answered" });
    // Award XP to answer author
    await User.findByIdAndUpdate(answer.author, { $inc: { xp: 50 } });
    return sendSuccess(res, null, "Answer accepted");
  } catch (err) {
    return sendError(res, "Failed to accept answer", 500);
  }
}

async function upvoteAnswer(req, res) {
  try {
    const { answerId } = req.params;
    const answer = await Answer.findById(answerId);
    if (!answer) return sendError(res, "Answer not found", 404);
    const alreadyUpvoted = answer.upvotedBy.includes(req.user.userId);
    if (alreadyUpvoted) {
      await Answer.findByIdAndUpdate(answerId, { $inc: { upvotes: -1 }, $pull: { upvotedBy: req.user.userId } });
    } else {
      await Answer.findByIdAndUpdate(answerId, { $inc: { upvotes: 1 }, $addToSet: { upvotedBy: req.user.userId } });
    }
    return sendSuccess(res, null, alreadyUpvoted ? "Upvote removed" : "Answer upvoted");
  } catch (err) {
    return sendError(res, "Failed to upvote", 500);
  }
}

module.exports = { getDoubts, createDoubt, getDoubt, addAnswer, acceptAnswer, upvoteAnswer };
