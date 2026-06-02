const router = require("express").Router();
const { register, login, refresh, logout, forgotPassword, resetPassword } = require("../controllers/auth.controller");
const { validate } = require("../middleware/validate.middleware");
const { authRateLimit } = require("../middleware/rate-limit.middleware");
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require("../validators/auth.validator");

router.post("/register", authRateLimit, validate(registerSchema), register);
router.post("/login", authRateLimit, validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/forgot-password", authRateLimit, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

module.exports = router;
