const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

// Configure multer for thumbnail uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/thumbnails/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'thumbnail-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit for thumbnails
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for thumbnails'));
    }
  }
});

// Configure multer for general media uploads (for social media posts, etc.)
const mediaStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'media-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const mediaUpload = multer({
  storage: mediaStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for media files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|avi/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image\/(jpeg|jpg|png|gif|webp)|video\/(mp4|quicktime|x-msvideo)/.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// Upload thumbnail
router.post('/thumbnail', auth, role('admin'), upload.single('thumbnail'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No thumbnail file provided' });
    }

    res.json({
      message: 'Thumbnail uploaded successfully',
      filename: req.file.filename,
      path: `/uploads/thumbnails/${req.file.filename}`,
      size: req.file.size
    });
  } catch (error) {
    console.error('Error uploading thumbnail:', error);
    res.status(500).json({ message: 'Failed to upload thumbnail', error: error.message });
  }
});

// Upload general media (images/videos for social media posts, etc.)
router.post('/media', auth, mediaUpload.single('media'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No media file provided' 
      });
    }

    res.json({
      success: true,
      message: 'Media uploaded successfully',
      data: {
        filename: req.file.filename,
        url: `/uploads/${req.file.filename}`,
        type: req.file.mimetype.startsWith('image/') ? 'image' : 'video',
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to upload media', 
      error: error.message 
    });
  }
});

module.exports = router;