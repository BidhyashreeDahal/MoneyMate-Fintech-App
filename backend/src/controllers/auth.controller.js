// Handles authentication logic: user signup, login, and logout.
// Uses the User model for database operations and JWT for issuing tokens.

import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendPasswordResetEmail } from "../services/email.service.js";

// Helper: generate JWT token for a user
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },                 // Payload
    process.env.JWT_SECRET,         // Secret key
    { expiresIn: '1d' }             // 1 day expiration
  );
};

// POST /api/auth/signup
export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please provide name, email, and password.'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'User already exists with this email.' });
    }

    // Create new user
    const newUser = await User.create({ name, email, password });

    // Generate token
    const token = generateToken(newUser._id);

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,           // true only in production
      sameSite: isProd ? "lax" : "lax", // use lax instead of none
      maxAge: 7 * 24 * 60 * 60 * 1000,

});


    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Server error during signup' });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Please provide email and password.' });
    }

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await existingUser.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(existingUser._id);

   const isProd = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,

  });

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: existingUser._id,
        name: existingUser.name,
        email: existingUser.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

// POST /api/auth/logout
export const logout = (req, res) => {
  try {
       const isProd = process.env.NODE_ENV === "production";

   res.cookie("token", token, {
   httpOnly: true,
   secure: isProd,
   sameSite: "lax",
   maxAge: 7 * 24 * 60 * 60 * 1000,

    });


    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Server error during logout' });
  }
};

// GET /api/auth/me
export const me = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("_id name email");
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Me error:", error);
    return res.status(500).json({ message: "Server error fetching session" });
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    console.log("[password-reset] request for email:", email, "user_found:", !!user);

    // Always respond the same to avoid leaking which emails exist
    const okResponse = () =>
      res.status(200).json({
        message: "If that email exists, you'll receive a reset link shortly.",
      });

    if (!user) return okResponse();

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.passwordResetTokenHash = tokenHash;
    user.passwordResetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrlBase =
      process.env.PASSWORD_RESET_URL_BASE ||
      `${process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || "http://localhost:3000"}/reset-password`;
    const resetUrl = `${resetUrlBase}?token=${encodeURIComponent(rawToken)}`;

    try {
      await sendPasswordResetEmail({ to: user.email, resetUrl });
    } catch (err) {
      console.error("[password-reset] email send failed:", err);
      // Still return ok response (avoid user enumeration), but logs will show the cause.
    }
    return okResponse();
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetTokenExpiresAt: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token." });
    }

    user.password = password; // will be hashed by pre-save hook
    user.passwordResetTokenHash = undefined;
    user.passwordResetTokenExpiresAt = undefined;
    await user.save();

    return res.status(200).json({ message: "Password reset successful. Please log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
