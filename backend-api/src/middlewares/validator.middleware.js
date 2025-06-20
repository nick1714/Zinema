const { z } = require("zod");

const ApiError = require("../api-error");

/**
 * Validates the request object using the provided zod validator.
 *
 * @param {z.AnyZodObject} validator
 */

function validateRequest(validator) {
  return (req, res, next) => {
    try {
      let input;

      // GET/DELETE: Wrap query params và params trong input
      if (req.method === "GET" || req.method === "DELETE") {
        input = {
          input: { ...req.params, ...req.query }
        };
      }
      
      // POST/PUT: Xử lý theo content-type
      if (req.method === "POST" || req.method === "PUT") {
        const contentType = req.get('Content-Type') || '';
        
        // Multipart form data: wrap fields trong input + thêm id
        if (contentType.includes('multipart/form-data')) {
          input = {
            input: {
              ...(req.body ? req.body : {}),
              ...(req.params.id ? { id: req.params.id } : {})
            }
          };
        }
        // JSON: wrap body trong input + thêm id từ params
        else {
          // Nếu body đã có input, giữ nguyên; nếu không thì wrap
          if (req.body && req.body.input) {
            input = {
              ...(req.body ? req.body : {}),
              ...(req.params.id ? { id: req.params.id } : {})
            };
          } else {
            input = {
              input: {
                ...(req.body ? req.body : {})
              },
              ...(req.params.id ? { id: req.params.id } : {})
            };
          }
        }
      }
      
      console.log("Input before validation:", input);
      
      validator.parse(input);

      return next();
    } catch (error) {
      console.log("Validation error:", error);
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map((issue) => {
          const errorPath = issue.path.join(".");
          if (issue.code === z.ZodIssueCode.unrecognized_keys) {
            const invalidKeys = issue.keys.join(", ");
            return `${errorPath} contains invalid keys: ${invalidKeys}`;
          }
          return `${errorPath}: ${issue.message}`;
        });
        return next(new ApiError(400, errorMessages.join("; ")));
      }
      return next(new ApiError(500, "Internal Server Error"));
    }
  };
}

module.exports = {
  validateRequest,
};
