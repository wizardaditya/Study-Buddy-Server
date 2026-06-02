const User = require("../models/User.model");
const { hashPassword, comparePassword } = require("../utils/hash.utils");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt.utils");
const { sendSuccess, sendError } = require("../utils/response.utils");

async function register(req, res) {
  try {
    const { name, username, email, password } = req.body;
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      const field = exists.email === email ? "email" : "username";
      return sendError(res, `This ${field} is already taken`, 409);
    }
    const hashed = await hashPassword(password);
    const user = await User.create({ name, username, email, password: hashed });
    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    const userObj = user.toObject();
    delete userObj.password;
    return sendSuccess(res, { user: userObj, accessToken, refreshToken }, "Account created successfully", 201);
  } catch (err) {
    console.error(err);
    return sendError(res, "Registration failed", 500);
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, isActive: true }).select("+password");
    if (!user) return sendError(res, "Invalid email or password", 401);
    const valid = await comparePassword(password, user.password);
    if (!valid) return sendError(res, "Invalid email or password", 401);
    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    const userObj = user.toObject();
    delete userObj.password;
    return sendSuccess(res, { user: userObj, accessToken, refreshToken }, "Login successful");
  } catch (err) {
    console.error(err);
    return sendError(res, "Login failed", 500);
  }
}

async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return sendError(res, "Refresh token required", 400);
    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) return sendError(res, "User not found", 401);
    const newPayload = { userId: user._id.toString(), role: user.role };
    const accessToken = signAccessToken(newPayload);
    return sendSuccess(res, { accessToken });
  } catch {
    return sendError(res, "Invalid refresh token", 401);
  }
}

async function logout(req, res) {
  return sendSuccess(res, null, "Logged out successfully");
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    // Always return success to prevent email enumeration
    if (user) {
      // TODO: generate token and send email via Resend
      console.log(`Password reset requested for: ${email}`);
    }
    return sendSuccess(res, null, "If that email exists, a reset link has been sent");
  } catch (err) {
    return sendError(res, "Failed to process request", 500);
  }
}

async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    // TODO: verify token from Redis/DB
    const hashed = await hashPassword(password);
    return sendSuccess(res, null, "Password reset successfully");
  } catch (err) {
    return sendError(res, "Failed to reset password", 500);
  }
}

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword };
