const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 3000 },
    topic: { type: String, required: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    githubUrl: String,
    demoUrl: String,
    mediaUrl: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stars: { type: Number, default: 0 },
    starredBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    views: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ProjectSchema.index({ author: 1, createdAt: -1 });
ProjectSchema.index({ topic: 1 });
ProjectSchema.index({ tags: 1 });
ProjectSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Project", ProjectSchema);
