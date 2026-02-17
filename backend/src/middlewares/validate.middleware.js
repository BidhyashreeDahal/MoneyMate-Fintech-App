import { ZodError } from "zod";

export const validateBody = (schema) => (req, res, next) => {
  try {
    // IMPORTANT: verify schema is valid
    if (!schema || typeof schema.parse !== "function") {
      res.status(500);
      return next(new Error("Validation schema is missing or invalid (schema.parse is not a function). Check your imports/exports."));
    }

    req.body = schema.parse(req.body);
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return res.status(400).json({
        message: "Validation failed",
        errors: details,
      });
    }

    // If it's not ZodError, it means schema was wrong or another error happened
    return res.status(400).json({
      message: error?.message || "Invalid request body",
    });
  }
};
