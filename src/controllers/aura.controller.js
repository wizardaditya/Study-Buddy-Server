const { v4: uuidv4 } = require("crypto");
const AuraSession = require("../models/AuraSession.model");
const AuraMemory = require("../models/AuraMemory.model");
const User = require("../models/User.model");
const { openai, OPENAI_MODEL } = require("../config/openai");
const { redis } = require("../config/redis");
const { sendSuccess, sendError } = require("../utils/response.utils");

const SYSTEM_PROMPT = `You are Aura, an expert AI study companion built exclusively for students learning Robotics, IoT, and Artificial Intelligence in India. You are warm, encouraging, and deeply knowledgeable.

Your expertise covers:
- Robotics: Arduino, Raspberry Pi, ROS, servo motors, sensors, drones, SLAM
- IoT: ESP32, MQTT, AWS IoT, home automation, LoRaWAN, edge computing
- AI/ML: Machine Learning, Deep Learning, Computer Vision, NLP, TensorFlow, PyTorch, LLMs

Guidelines:
- Always explain concepts with practical examples relevant to Indian students
- When helping with code, provide complete working examples
- Break down complex topics into digestible steps
- Encourage and motivate students — learning these subjects is hard
- Remember context from the conversation to give personalized help
- If asked about something outside your domain, kindly redirect to Robotics/IoT/AI topics`;

async function chat(req, res) {
  try {
    const { message, sessionId } = req.body;
    if (!message?.trim()) return sendError(res, "Message is required", 400);

    const user = await User.findById(req.user.userId).select("name plan xp level currentStreak").lean();

    // Check daily limit for free users
    if (user.plan === "free") {
      const key = `aura:daily:${req.user.userId}:${new Date().toDateString()}`;
      const used = await redis.incr(key);
      await redis.expire(key, 86400);
      if (used > 10) return sendError(res, "Daily AI limit reached. Upgrade to Pro for unlimited Aura AI.", 429);
    }

    // Get or create session
    let sid = sessionId;
    let session;
    if (sid) {
      session = await AuraSession.findOne({ sessionId: sid, user: req.user.userId });
    }
    if (!session) {
      sid = uuidv4().replace(/-/g, "").slice(0, 16);
      session = await AuraSession.create({ user: req.user.userId, sessionId: sid, messages: [] });
    }

    // Build messages for OpenAI (last 20)
    const history = session.messages.slice(-20).map((m) => ({ role: m.role, content: m.content }));
    const messages = [
      { role: "system", content: `${SYSTEM_PROMPT}\n\nUser context: ${user.name}, Level ${user.level}, ${user.xp} XP, ${user.currentStreak} day streak.` },
      ...history,
      { role: "user", content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages,
      max_tokens: 1500,
      temperature: 0.7,
    });

    const replyContent = completion.choices[0].message.content;
    const now = new Date();

    // Save messages
    const userMsg = { role: "user", content: message, timestamp: now };
    const assistantMsg = { role: "assistant", content: replyContent, timestamp: now };
    session.messages.push(userMsg, assistantMsg);
    await session.save();

    const reply = {
      _id: `${Date.now()}_assistant`,
      role: "assistant",
      content: replyContent,
      timestamp: now.toISOString(),
    };

    return sendSuccess(res, { reply, sessionId: sid });
  } catch (err) {
    console.error("[Aura] Chat error:", err.message);
    return sendError(res, "Aura is having trouble right now. Please try again.", 500);
  }
}

async function getHistory(req, res) {
  try {
    const session = await AuraSession.findOne({
      sessionId: req.params.sessionId,
      user: req.user.userId,
    }).lean();
    if (!session) return sendError(res, "Session not found", 404);
    return sendSuccess(res, session);
  } catch (err) {
    return sendError(res, "Failed to get history", 500);
  }
}

async function clearMemory(req, res) {
  try {
    await AuraMemory.deleteMany({ user: req.user.userId });
    return sendSuccess(res, null, "Memory cleared");
  } catch (err) {
    return sendError(res, "Failed to clear memory", 500);
  }
}

async function getSessions(req, res) {
  try {
    const sessions = await AuraSession.find({ user: req.user.userId })
      .sort({ updatedAt: -1 }).limit(20)
      .select("sessionId messages createdAt updatedAt").lean();
    return sendSuccess(res, sessions);
  } catch (err) {
    return sendError(res, "Failed to get sessions", 500);
  }
}

module.exports = { chat, getHistory, clearMemory, getSessions };
