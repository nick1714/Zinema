const { z } = require("zod");

const ApiError = require("../api-error");

/**
 * Xác thực đối tượng yêu cầu bằng zod
 * @param {z.AnyZodObject} validator - Zod schema
 * @param {string} source - Nguồn dữ liệu để xác thực (body, params, query)
 */
function validateRequest(validator, source = 'body') {
  return (req, res, next) => {
    try {
      let dataToValidate;
      
      // Xác định nguồn dữ liệu cần validate
      switch (source) {
        case 'params':
          dataToValidate = req.params;
          break;
        case 'query':
          dataToValidate = req.query;
          break;
        case 'body':
        default:
          dataToValidate = req.body;
          
          // Nếu có file upload, thêm vào dữ liệu
          if (req.file) {
            dataToValidate.poster_url = `/uploads/posters/${req.file.filename}`;
          }
          break;
      }
      
      // Validate dữ liệu
      const validatedData = validator.parse(dataToValidate);
      
      // Cập nhật lại request với dữ liệu đã validate
      if (source === 'body') {
        req.body = validatedData;
      } else if (source === 'params') {
        req.params = validatedData;
      } else if (source === 'query') {
        req.query = validatedData;
      }

      return next();
    } catch (error) {
      console.log("Validation error:", error);
      if (error instanceof z.ZodError) {
        const errorMessages = error.issues.map((issue) => {
          const path = issue.path.join('.');
          return `${path ? path + ': ' : ''}${issue.message}`;
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
