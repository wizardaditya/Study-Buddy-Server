const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, maxlength: 2000 },
    type: { type: String, enum: ["text", "image", "project", "question"], default: "text" },
    mediaUrl: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    tags: [{ type: String, trim: true, lowercase: true }],
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", PostSchema);
