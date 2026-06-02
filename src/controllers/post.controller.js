const Post = require("../models/Post.model");
const Like = require("../models/Like.model");
const Comment = require("../models/Comment.model");
const User = require("../models/User.model");
const { sendSuccess, sendError, sendPaginated } = require("../utils/response.utils");
const { getPagination } = require("../utils/pagination.utils");

async function getFeed(req, res) {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const total = await Post.countDocuments({ isDeleted: false });
    const posts = await Post.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "name username avatar xp level plan")
      .lean();

    // Attach isLiked if authenticated
    if (req.user) {
      const postIds = posts.map((p) => p._id);
      const likes = await Like.find({ user: req.user.userId, post: { $in: postIds } }).lean();
      const likedSet = new Set(likes.map((l) => l.post.toString()));
      posts.forEach((p) => { p.isLiked = likedSet.has(p._id.toString()); });
    }

    return sendPaginated(res, posts, { page, limit, total });
  } catch (err) {
    return sendError(res, "Failed to get feed", 500);
  }
}

async function createPost(req, res) {
  try {
    const { content, type, mediaUrl, tags } = req.body;
    const post = await Post.create({ content, type, mediaUrl, tags, author: req.user.userId });
    await post.populate("author", "name username avatar");
    // Award XP
    await User.findByIdAndUpdate(req.user.userId, { $inc: { xp: 10 } });
    return sendSuccess(res, post.toObject(), "Post created", 201);
  } catch (err) {
    return sendError(res, "Failed to create post", 500);
  }
}

async function getPost(req, res) {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false })
      .populate("author", "name username avatar")
      .lean();
    if (!post) return sendError(res, "Post not found", 404);
    return sendSuccess(res, post);
  } catch (err) {
    return sendError(res, "Failed to get post", 500);
  }
}

async function deletePost(req, res) {
  try {
    const post = await Post.findOne({ _id: req.params.id, author: req.user.userId });
    if (!post) return sendError(res, "Post not found or not authorized", 404);
    post.isDeleted = true;
    await post.save();
    return sendSuccess(res, null, "Post deleted");
  } catch (err) {
    return sendError(res, "Failed to delete post", 500);
  }
}

async function likePost(req, res) {
  try {
    const { id } = req.params;
    const post = await Post.findOne({ _id: id, isDeleted: false });
    if (!post) return sendError(res, "Post not found", 404);
    await Like.create({ user: req.user.userId, post: id });
    await Post.findByIdAndUpdate(id, { $inc: { likesCount: 1 } });
    return sendSuccess(res, null, "Post liked");
  } catch (err) {
    if (err.code === 11000) return sendError(res, "Already liked", 409);
    return sendError(res, "Failed to like post", 500);
  }
}

async function unlikePost(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Like.findOneAndDelete({ user: req.user.userId, post: id });
    if (!deleted) return sendError(res, "Not liked", 400);
    await Post.findByIdAndUpdate(id, { $inc: { likesCount: -1 } });
    return sendSuccess(res, null, "Post unliked");
  } catch (err) {
    return sendError(res, "Failed to unlike post", 500);
  }
}

async function getComments(req, res) {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .sort({ createdAt: 1 })
      .populate("author", "name username avatar")
      .lean();
    return sendSuccess(res, comments);
  } catch (err) {
    return sendError(res, "Failed to get comments", 500);
  }
}

async function addComment(req, res) {
  try {
    const { content, parentId } = req.body;
    const comment = await Comment.create({ content, post: req.params.id, author: req.user.userId, parentId });
    await Post.findByIdAndUpdate(req.params.id, { $inc: { commentsCount: 1 } });
    await comment.populate("author", "name username avatar");
    return sendSuccess(res, comment.toObject(), "Comment added", 201);
  } catch (err) {
    return sendError(res, "Failed to add comment", 500);
  }
}

module.exports = { getFeed, createPost, getPost, deletePost, likePost, unlikePost, getComments, addComment };
