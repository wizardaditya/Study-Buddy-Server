const router = require("express").Router();
const { getStats, getUsers, banUser, getPendingMentors, verifyMentor } = require("../controllers/admin.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { requireAdmin } = require("../middleware/role.middleware");

router.use(authenticate, requireAdmin);

router.get("/stats", getStats);
router.get("/users", getUsers);
router.put("/users/:id/ban", banUser);
router.get("/mentors/pending", getPendingMentors);
router.put("/mentors/:id/verify", verifyMentor);

module.exports = router;
