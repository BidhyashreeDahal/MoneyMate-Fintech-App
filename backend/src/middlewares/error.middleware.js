// Global error handler for the backend.
// Catches and formats errors to send clean responses to the client.
export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not Found: ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  const statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message || "Server error",
    // show stack only in dev (helps debugging)
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};
