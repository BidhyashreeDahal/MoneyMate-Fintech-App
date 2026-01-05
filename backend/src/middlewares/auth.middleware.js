// Middleware to verify JWT token from cookies and authenticate the user.
// If valid: attaches userId to req.user and continues.
// If invalid or missing: blocks request with 401 Unauthorized.

import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // support different payload shapes safely
    const id = decoded?.id || decoded?.userId || decoded?._id;
    if (!id) {
      return res.status(401).json({ message: "Invalid token payload." });
    }

    req.user = { id };
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Not authenticated. Invalid/expired token." });
  }
};

export default authMiddleware;
