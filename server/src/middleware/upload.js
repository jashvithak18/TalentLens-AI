const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Multer Storage Configuration
// Memory storage is ideal if we're uploading directly to Cloudinary or parsing inline
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/msword', // DOC
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOCX, JPG, PNG, and WebP are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Helper function to upload local file to Cloudinary (if configured)
const uploadToCloudinary = async (filePath, folder = 'talentlens', mimetype = null) => {
  if (!isCloudinaryConfigured()) {
    try {
      // Determine mimetype if not provided
      let resolvedMimetype = mimetype;
      if (!resolvedMimetype) {
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.pdf') resolvedMimetype = 'application/pdf';
        else if (ext === '.docx') resolvedMimetype = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        else if (ext === '.doc') resolvedMimetype = 'application/msword';
        else if (ext === '.jpg' || ext === '.jpeg') resolvedMimetype = 'image/jpeg';
        else if (ext === '.png') resolvedMimetype = 'image/png';
        else if (ext === '.webp') resolvedMimetype = 'image/webp';
        else resolvedMimetype = 'application/octet-stream';
      }

      // Ephemeral disk fallback: convert local file to a Base64 Data URL to persist in MongoDB
      const fileBuffer = fs.readFileSync(filePath);
      const base64Data = fileBuffer.toString('base64');
      const dataUrl = `data:${resolvedMimetype};base64,${base64Data}`;
      
      // Clean up local file immediately to free disk space
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      return {
        url: dataUrl,
        public_id: path.basename(filePath)
      };
    } catch (err) {
      console.error('Error creating base64 data URL:', err);
      const relativePath = filePath.split(path.sep).join('/').split('/public')[1] || filePath;
      return {
        url: relativePath,
        public_id: path.basename(filePath)
      };
    }
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto'
    });
    // Clean up local file after uploading to Cloudinary
    fs.unlinkSync(filePath);
    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('Cloudinary upload error, keeping local file:', error);
    const relativePath = filePath.split(path.sep).join('/').split('/public')[1] || filePath;
    return {
      url: relativePath,
      public_id: path.basename(filePath)
    };
  }
};

module.exports = { upload, uploadToCloudinary };
