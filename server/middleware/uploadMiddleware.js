const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Helper to determine writable upload folder (local vs serverless /tmp)
const getUploadDir = (subdir = 'reports') => {
  if (process.env.VERCEL) {
    const tmpDir = path.join(os.tmpdir(), 'cwms_uploads', subdir);
    if (!fs.existsSync(tmpDir)) {
      try {
        fs.mkdirSync(tmpDir, { recursive: true });
      } catch (e) {
        // Ignore folder creation errors if already created concurrently
      }
    }
    return tmpDir;
  }

  const localDir = path.join(__dirname, '..', 'uploads', subdir);
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    // Verify write permissions
    const testFile = path.join(localDir, `.write_test_${Date.now()}`);
    fs.writeFileSync(testFile, '1');
    fs.unlinkSync(testFile);
    return localDir;
  } catch (e) {
    const tmpDir = path.join(os.tmpdir(), 'cwms_uploads', subdir);
    if (!fs.existsSync(tmpDir)) {
      try {
        fs.mkdirSync(tmpDir, { recursive: true });
      } catch (err) {
        // Ignore
      }
    }
    return tmpDir;
  }
};

// Storage engine configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const targetDir = getUploadDir('reports');
      cb(null, targetDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique, collision-free filename: report-timestamp-random.ext
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `report-${uniqueSuffix}${ext}`);
  }
});

// File filter: Allow only standard image MIME types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

// Multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 Megabytes max limit
  }
});

module.exports = upload;

