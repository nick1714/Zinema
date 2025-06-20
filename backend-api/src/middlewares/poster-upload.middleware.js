const multer = require('multer');
const path = require('path');

const ApiError = require('../api-error');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniquePrefix = Date.now() + '_' + 
        Math.round(Math.random() * 1e9);
    cb(null, uniquePrefix + path.extname(file.originalname));
  },
});

function posterUpload(req, res, next) {
  const upload = multer({ storage: storage }).single('posterFile');

  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.log('Multer Error:', err.code, err.message);
      return next(
        new ApiError(
          400,
          `Upload error: ${err.message}`
        )
      );
    } else if (err) {
      console.log('General Error:', err.message);
      return next(
        new ApiError(
          500,
          `Upload error: ${err.message}`
        )
      );
    }

    console.log('Upload successful, file:', req.file);
    if (!req.file) {
      delete req.body.posterFile;
    }

    next();
  });
}

module.exports = {
  posterUpload,
}; 