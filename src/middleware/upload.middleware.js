const multer = require('multer');
const path   = require('path');
const fs     = require('fs');

const uploadDir = 'uploads/profiles';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => {
    const ext      = path.extname(file.originalname);
    const filename = `user_${req.user.userId}_${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
};

const multerUpload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });

// Wrapper that returns proper JSON errors instead of crashing
const upload = {
  single: (fieldName) => (req, res, next) => {
    multerUpload.single(fieldName)(req, res, (err) => {
      if (!err) return next();

      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum allowed size is 2MB.',
        });
      }

      return res.status(400).json({
        success: false,
        message: err.message || 'File upload failed.',
      });
    });
  },
};

module.exports = upload;