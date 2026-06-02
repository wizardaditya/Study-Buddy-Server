const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
  explanation: String,
  type: { type: String, enum: ["mcq", "true_false"], default: "mcq" },
});

const MockTestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    topic: { type: String, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    questions: [QuestionSchema],
    duration: { type: Number, required: true, min: 5 },
    attempts: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

MockTestSchema.index({ topic: 1, difficulty: 1 });

module.exports = mongoose.model("MockTest", MockTestSchema);
