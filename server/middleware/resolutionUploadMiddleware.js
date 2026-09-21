const multer = require('multer');

// Use memoryStorage for 100% serverless / Vercel compatibility
const storage = multer.memoryStorage();

// File filter: Only images allowed
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPEG, PNG, and WebP proof images are allowed.'), false);
  }
};

const uploadResolution = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

module.exports = uploadResolution;


