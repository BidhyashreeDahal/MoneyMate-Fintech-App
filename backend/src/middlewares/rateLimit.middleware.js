import rateLimit from "express-rate-limit";

/**
 * Bank-style idea:
 * - Auth endpoints should be much stricter (prevents password guessing)
 * - General API endpoints can be more generous (prevents abuse/spam)
 */

// Strict limiter for login/signup
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 requests per IP per window
  standardHeaders: true, // returns rate limit info in headers
  legacyHeaders: false,  // disables X-RateLimit-* old headers
  message: { message: "Too many auth attempts. Try again later." },
});

// General limiter for all API routes
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // max 120 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please slow down." },
});
