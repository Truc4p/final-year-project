const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../../utils/cloudinary');
const auth = require('../../middleware/auth');
const role = require('../../middleware/role');

// Configure multer to upload thumbnails directly to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'wrencos/thumbnails',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Configure multer for general media uploads (images/videos for social media posts, etc.)
const mediaStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'wrencos/media',
    resource_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi'],
  }),
});
const mediaUpload = multer({ storage: mediaStorage, limits: { fileSize: 10 * 1024 * 1024 } });

// Upload thumbnail
router.post('/thumbnail', auth, role('admin'), upload.single('thumbnail'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No thumbnail file provided' });
    }

    res.json({
      message: 'Thumbnail uploaded successfully',
      filename: req.file.filename,
      path: req.file.path, // Cloudinary URL
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
        url: req.file.path, // Cloudinary URL
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