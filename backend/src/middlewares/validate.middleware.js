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
    res.status(400);

    // Debug line (temporary)
    console.log("VALIDATION ERROR TYPE:", error?.constructor?.name);

    if (error instanceof ZodError) {
      const details = error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      }));
      return next(new Error(JSON.stringify(details)));
    }

    // If it's not ZodError, it means schema was wrong or another error happened
    return next(new Error(error?.message || "Invalid request body"));
  }
};
