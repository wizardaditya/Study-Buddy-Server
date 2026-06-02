const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, and underscores only"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

module.exports = { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, refreshTokenSchema };
