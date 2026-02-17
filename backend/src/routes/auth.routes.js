// Defines routes for authentication.
// Endpoints: POST /signup, POST /login, POST /logout.
// Connects to auth.controller.js for handling requests.

import express from 'express';
import {
  signup,
  login,
  logout,
  me,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validators.js";
import { authLimiter } from "../middlewares/rateLimit.middleware.js";
import authMiddleware from '../middlewares/auth.middleware.js';
const router = express.Router();
// POST /api/auth/signup → Create a new user account
router.post("/signup", authLimiter, validateBody(signupSchema), signup);
// POST /api/auth/login → Authenticate user and return JWT
router.post("/login", authLimiter, validateBody(loginSchema), login);

// POST /api/auth/logout → Log out user by clearing JWT cookie
router.post('/logout', logout);
// GET /api/auth/me → Get current authenticated user
router.get('/me', authMiddleware, me);

// POST /api/auth/forgot-password → Request password reset email
router.post(
  "/forgot-password",
  authLimiter,
  validateBody(forgotPasswordSchema),
  forgotPassword
);

// POST /api/auth/reset-password → Reset password using token
router.post(
  "/reset-password",
  authLimiter,
  validateBody(resetPasswordSchema),
  resetPassword
);
export default router;
