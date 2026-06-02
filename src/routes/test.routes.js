const router = require("express").Router();
const { getTests, getTest, submitAttempt, getResult } = require("../controllers/test.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.get("/", getTests);
router.get("/results/:id", authenticate, getResult);
router.get("/:id", getTest);
router.post("/:id/attempt", authenticate, submitAttempt);

module.exports = router;
