const router = require("express").Router();
const { getFeed, createPost, getPost, deletePost, likePost, unlikePost, getComments, addComment } = require("../controllers/post.controller");
const { authenticate, optionalAuth } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");
const { createPostSchema, createCommentSchema } = require("../validators/post.validator");

router.get("/", optionalAuth, getFeed);
router.post("/", authenticate, validate(createPostSchema), createPost);
router.get("/:id", optionalAuth, getPost);
router.delete("/:id", authenticate, deletePost);
router.post("/:id/like", authenticate, likePost);
router.delete("/:id/like", authenticate, unlikePost);
router.get("/:id/comments", getComments);
router.post("/:id/comments", authenticate, validate(createCommentSchema), addComment);

module.exports = router;
