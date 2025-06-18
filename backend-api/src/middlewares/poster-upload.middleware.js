const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Xác định dung lượng lưu trữ cho các poster đã tải lên
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    // Tạo thư mục nếu nó không tồn tại
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `poster-${uniqueSuffix}${ext}`);
  },
});

// Bộ lọc để chỉ chấp nhận các tệp hình ảnh
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
      ),
      false
    );
  }
};

// Cấu hình multer
const upload = multer({
    storage: storage,        // Sử dụng diskStorage đã định nghĩa
    fileFilter: fileFilter,  // Sử dụng filter đã định nghĩa
    limits: {
        fileSize: 5 * 1024 * 1024, // Kích thước tệp tối đa 5MB
    },
});

// Middleware để xử lý tải lên poster
const posterUpload = (req, res, next) => {
  const uploader = upload.single("posterFile");
  
  uploader(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        status: "error",
        message: `Upload error: ${err.message}`,
      });
    } else if (err) {
      return res.status(400).json({
        status: "error",
        message: err.message,
      });
    }
    
    next();
  });
};

module.exports = { posterUpload }; 