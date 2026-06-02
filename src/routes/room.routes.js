const router = require("express").Router();
const { getRooms, createRoom, getRoom, joinRoom, leaveRoom } = require("../controllers/room.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.get("/", authenticate, getRooms);
router.post("/", authenticate, createRoom);
router.get("/:id", authenticate, getRoom);
router.post("/:id/join", authenticate, joinRoom);
router.delete("/:id/leave", authenticate, leaveRoom);

module.exports = router;
