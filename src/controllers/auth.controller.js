const User = require("../models/User.model");
const { hashPassword, comparePassword } = require("../utils/hash.utils");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt.utils");
const { sendSuccess, sendError } = require("../utils/response.utils");

async function register(req, res) {
  try {
    const { name, username, email, password, role, expertise } = req.body;
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      const field = exists.email === email ? "email" : "username";
      return sendError(res, `This ${field} is already taken`, 409);
    }
    const hashed = await hashPassword(password);
    const assignedRole = role === "mentor" ? "mentor" : "student";
    const user = await User.create({ name, username, email, password: hashed, role: assignedRole });

    // If registering as mentor, create mentor profile (pending verification)
    if (assignedRole === "mentor" && expertise && expertise.length > 0) {
      const Mentor = require("../models/Mentor.model");
      await Mentor.create({ user: user._id, expertise, isVerified: false });
    }

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

async function googleAuth(req, res) {
  try {
    const { idToken } = req.body;
    if (!idToken) return sendError(res, "Google token required", 400);

    // Verify Google token
    const { OAuth2Client } = require("google-auth-library");
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();

    const { sub: googleId, email, name, picture } = payload;

    // Find or create user
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    const isNewUser = !user;

    if (!user) {
      // Generate unique username from email
      let baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_");
      let username = baseUsername;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter++}`;
      }
      user = await User.create({
        name,
        username,
        email,
        password: await require("../utils/hash.utils").hashPassword(Math.random().toString(36)),
        googleId,
        avatar: picture,
        isVerified: true,
        role: "student", // default; onboarding popup will allow change
      });
    } else if (!user.googleId) {
      // Link google to existing account
      user.googleId = googleId;
      if (!user.avatar) user.avatar = picture;
      await user.save();
    }

    const tokenPayload = { userId: user._id.toString(), role: user.role };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);
    const userObj = user.toObject();
    delete userObj.password;

    return sendSuccess(res, { user: userObj, accessToken, refreshToken, isNewUser }, "Google login successful");
  } catch (err) {
    console.error("Google auth error:", err);
    return sendError(res, "Google authentication failed", 401);
  }
}

async function completeOnboarding(req, res) {
  try {
    const { role, expertise } = req.body;
    const User = require("../models/User.model");
    const assignedRole = role === "mentor" ? "mentor" : "student";
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { role: assignedRole },
      { new: true }
    ).lean();

    if (assignedRole === "mentor" && expertise && expertise.length > 0) {
      const Mentor = require("../models/Mentor.model");
      const existing = await Mentor.findOne({ user: req.user.userId });
      if (!existing) {
        await Mentor.create({ user: req.user.userId, expertise, isVerified: false });
      } else {
        await Mentor.findOneAndUpdate({ user: req.user.userId }, { expertise });
      }
    }
    return sendSuccess(res, user, "Onboarding complete");
  } catch (err) {
    return sendError(res, "Onboarding failed", 500);
  }
}

async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    const hashed = await hashPassword(password);
    return sendSuccess(res, null, "Password reset successfully");
  } catch (err) {
    return sendError(res, "Failed to reset password", 500);
  }
}

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword, googleAuth, completeOnboarding };
