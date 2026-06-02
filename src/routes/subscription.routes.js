const router = require("express").Router();
const { getPlans, createOrder, verifyPayment, getStatus } = require("../controllers/subscription.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.get("/plans", getPlans);
router.post("/create", authenticate, createOrder);
router.post("/verify", authenticate, verifyPayment);
router.get("/status", authenticate, getStatus);

module.exports = router;
