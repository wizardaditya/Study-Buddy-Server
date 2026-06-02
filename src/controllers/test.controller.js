const MockTest = require("../models/MockTest.model");
const TestAttempt = require("../models/TestAttempt.model");
const User = require("../models/User.model");
const { sendSuccess, sendError } = require("../utils/response.utils");

async function getTests(req, res) {
  try {
    const filter = { isPublished: true };
    if (req.query.topic) filter.topic = req.query.topic;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    const tests = await MockTest.find(filter)
      .select("-questions")
      .sort({ createdAt: -1 }).lean();
    const mapped = tests.map((t) => ({ ...t, questionsCount: t.questions?.length || 0 }));
    return sendSuccess(res, mapped);
  } catch (err) {
    return sendError(res, "Failed to get tests", 500);
  }
}

async function getTest(req, res) {
  try {
    const test = await MockTest.findOne({ _id: req.params.id, isPublished: true }).lean();
    if (!test) return sendError(res, "Test not found", 404);
    // Strip correct answers before sending to client
    const safeQuestions = test.questions.map(({ _id, question, options, type }) => ({
      _id, question, options, type,
    }));
    return sendSuccess(res, { ...test, questions: safeQuestions });
  } catch (err) {
    return sendError(res, "Failed to get test", 500);
  }
}

async function submitAttempt(req, res) {
  try {
    const { answers, timeTaken = 0 } = req.body;
    const test = await MockTest.findOne({ _id: req.params.id, isPublished: true }).lean();
    if (!test) return sendError(res, "Test not found", 404);

    let correct = 0;
    test.questions.forEach((q) => {
      if (answers[q._id.toString()] === q.correctAnswer) correct++;
    });

    const score = Math.round((correct / test.questions.length) * 100);
    const attempt = await TestAttempt.create({
      test: test._id,
      user: req.user.userId,
      answers,
      score,
      totalQuestions: test.questions.length,
      correctAnswers: correct,
      timeTaken,
    });

    // Update test stats
    await MockTest.findByIdAndUpdate(test._id, {
      $inc: { attempts: 1 },
      avgScore: score, // simplified — real app would compute rolling average
    });

    // Award XP
    const xp = Math.round(score / 4); // max 25 XP
    await User.findByIdAndUpdate(req.user.userId, { $inc: { xp } });

    return sendSuccess(res, attempt.toObject(), "Test submitted", 201);
  } catch (err) {
    return sendError(res, "Failed to submit test", 500);
  }
}

async function getResult(req, res) {
  try {
    const attempt = await TestAttempt.findOne({ _id: req.params.id, user: req.user.userId })
      .populate("test", "title topic").lean();
    if (!attempt) return sendError(res, "Result not found", 404);
    return sendSuccess(res, attempt);
  } catch (err) {
    return sendError(res, "Failed to get result", 500);
  }
}

module.exports = { getTests, getTest, submitAttempt, getResult };
