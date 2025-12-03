// Middleware to verify JWT token from cookies and authenticate the user.
// If valid: attaches userId to req.user and continues.
// If invalid or missing: blocks request with 401 Unauthorized.

import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    // Read token from cookies
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated. No token provided." });
    }

    // Verify token using JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user ID to req.user
    req.user = { id: decoded.id };

    // Continue to next middleware or controller
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

export default authMiddleware;
