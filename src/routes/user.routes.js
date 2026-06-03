const router = require("express").Router();
const { getMe, updateMe, getProfile, followUser, unfollowUser, getLeaderboard, changePassword, getUsers } = require("../controllers/user.controller");
const { authenticate, optionalAuth } = require("../middleware/auth.middleware");

router.get("/me", authenticate, getMe);
router.put("/me", authenticate, updateMe);
router.put("/me/password", authenticate, changePassword);
router.get("/leaderboard", authenticate, getLeaderboard);
router.get("/", optionalAuth, getUsers);
router.get("/:username", optionalAuth, getProfile);
router.post("/:id/follow", authenticate, followUser);
router.delete("/:id/follow", authenticate, unfollowUser);

module.exports = router;
