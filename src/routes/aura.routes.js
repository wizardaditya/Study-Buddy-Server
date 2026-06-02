const router = require("express").Router();
const { chat, getHistory, clearMemory, getSessions } = require("../controllers/aura.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { aiRateLimit } = require("../middleware/rate-limit.middleware");

router.post("/chat", authenticate, aiRateLimit, chat);
router.get("/sessions", authenticate, getSessions);
router.get("/history/:sessionId", authenticate, getHistory);
router.delete("/memory", authenticate, clearMemory);

module.exports = router;
