/**
 * Reusable Zod validation middleware for Express.
 * Usage: router.post("/", validate(myZodSchema), controller.create)
 */
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map(e => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }
  // Replace req.body with the parsed (and coerced) data
  req.body = result.data;
  next();
};
