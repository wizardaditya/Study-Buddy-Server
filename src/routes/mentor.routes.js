const router = require("express").Router();
const { getMentors, getMentor, applyAsMentor, bookSession } = require("../controllers/mentor.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.get("/", getMentors);
router.post("/apply", authenticate, applyAsMentor);
router.get("/:username", getMentor);
router.post("/:id/book", authenticate, bookSession);

module.exports = router;
