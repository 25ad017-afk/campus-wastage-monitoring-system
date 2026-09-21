const multer = require('multer');

// Use memoryStorage for 100% serverless / Vercel compatibility (zero disk filesystem dependency)
const storage = multer.memoryStorage();

// File filter: Allow only standard image MIME types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

// Multer upload instance with memory storage
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 Megabytes max limit
  }
});

module.exports = upload;


