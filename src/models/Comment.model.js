const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, maxlength: 1000 },
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" },
  },
  { timestamps: true }
);

CommentSchema.index({ post: 1, createdAt: 1 });

module.exports = mongoose.model("Comment", CommentSchema);
