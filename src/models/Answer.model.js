const mongoose = require("mongoose");

const AnswerSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, maxlength: 10000 },
    doubt: { type: mongoose.Schema.Types.ObjectId, ref: "Doubt", required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isAccepted: { type: Boolean, default: false },
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

AnswerSchema.index({ doubt: 1, createdAt: 1 });

module.exports = mongoose.model("Answer", AnswerSchema);
