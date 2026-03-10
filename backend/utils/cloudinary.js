const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extract the Cloudinary public_id from a full Cloudinary URL.
 * e.g. https://res.cloudinary.com/demo/image/upload/v1234/folder/myimage.jpg -> folder/myimage
 */
const extractPublicId = (cloudinaryUrl) => {
  if (!cloudinaryUrl || !cloudinaryUrl.includes('cloudinary.com')) return null;
  const parts = cloudinaryUrl.split('/');
  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex === -1) return null;
  // Skip the version segment (vXXXXXXXXXX) if present
  const afterUpload = parts.slice(uploadIndex + 1);
  const startIdx = afterUpload[0]?.match(/^v\d+$/) ? 1 : 0;
  const pathWithExt = afterUpload.slice(startIdx).join('/');
  return pathWithExt.replace(/\.[^/.]+$/, ''); // strip file extension
};

/**
 * Delete an image from Cloudinary. Silently ignores non-Cloudinary paths (legacy local paths).
 */
const deleteCloudinaryImage = async (imageUrl) => {
  const publicId = extractPublicId(imageUrl);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Error deleting Cloudinary image:', publicId, err);
  }
};

module.exports = { cloudinary, deleteCloudinaryImage };
