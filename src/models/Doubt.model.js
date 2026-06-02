const mongoose = require("mongoose");

const DoubtSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true, maxlength: 5000 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true, trim: true },
    status: { type: String, enum: ["open", "answered", "closed"], default: "open" },
    isAnswered: { type: Boolean, default: false },
    answersCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    tags: [{ type: String, trim: true, lowercase: true }],
  },
  { timestamps: true }
);

DoubtSchema.index({ topic: 1, createdAt: -1 });
DoubtSchema.index({ status: 1 });
DoubtSchema.index({ title: "text", content: "text" });

module.exports = mongoose.model("Doubt", DoubtSchema);
