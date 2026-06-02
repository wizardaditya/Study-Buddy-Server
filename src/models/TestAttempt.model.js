const mongoose = require("mongoose");

const TestAttemptSchema = new mongoose.Schema(
  {
    test: { type: mongoose.Schema.Types.ObjectId, ref: "MockTest", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    answers: { type: Map, of: String },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    timeTaken: { type: Number, required: true },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

TestAttemptSchema.index({ user: 1, completedAt: -1 });
TestAttemptSchema.index({ test: 1 });

module.exports = mongoose.model("TestAttempt", TestAttemptSchema);
