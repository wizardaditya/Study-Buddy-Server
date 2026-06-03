const router = require("express").Router();

router.use("/auth", require("./auth.routes"));
router.use("/users", require("./user.routes"));
router.use("/posts", require("./post.routes"));
router.use("/doubts", require("./doubt.routes"));
router.use("/mentors", require("./mentor.routes"));
router.use("/rooms", require("./room.routes"));
router.use("/tests", require("./test.routes"));
router.use("/projects", require("./project.routes"));
router.use("/aura", require("./aura.routes"));
router.use("/subscriptions", require("./subscription.routes"));
router.use("/notifications", require("./notification.routes"));
router.use("/upload", require("./upload.routes"));
router.use("/hiring", require("./hiring.routes"));
router.use("/admin", require("./admin.routes"));
router.use("/search", require("./search.routes"));

// Health check
router.get("/health", (req, res) => {
  res.json({ success: true, message: "Study Buddy API is running 🚀", timestamp: new Date().toISOString() });
});

module.exports = router;
