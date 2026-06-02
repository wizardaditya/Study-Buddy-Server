const router = require("express").Router();
const { getDoubts, createDoubt, getDoubt, addAnswer, acceptAnswer, upvoteAnswer } = require("../controllers/doubt.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");
const { createDoubtSchema, createAnswerSchema } = require("../validators/doubt.validator");

router.get("/", getDoubts);
router.post("/", authenticate, validate(createDoubtSchema), createDoubt);
router.get("/:id", getDoubt);
router.post("/:id/answers", authenticate, validate(createAnswerSchema), addAnswer);
router.put("/:id/answers/:answerId/accept", authenticate, acceptAnswer);
router.post("/:id/answers/:answerId/upvote", authenticate, upvoteAnswer);

module.exports = router;
