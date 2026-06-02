const { sendError } = require("../utils/response.utils");

function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = {};
      result.error.errors.forEach((err) => {
        const field = err.path.join(".");
        if (!errors[field]) errors[field] = [];
        errors[field].push(err.message);
      });
      return sendError(res, "Validation failed", 422, errors);
    }
    req.body = result.data;
    next();
  };
}

module.exports = { validate };
