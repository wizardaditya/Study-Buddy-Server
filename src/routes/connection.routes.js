const router = require("express").Router();
const {
  sendRequest,
  acceptRequest,
  removeConnection,
  getConnectionStatus,
  getMyConnections,
  getPendingRequests,
  getSentRequests,
} = require("../controllers/connection.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.use(authenticate);

router.get("/", getMyConnections);
router.get("/pending", getPendingRequests);
router.get("/sent", getSentRequests);
router.get("/status/:id", getConnectionStatus);
router.post("/request/:id", sendRequest);
router.put("/accept/:id", acceptRequest);
router.delete("/:id", removeConnection);

module.exports = router;
