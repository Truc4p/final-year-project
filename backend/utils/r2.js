const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload a buffer to Cloudflare R2.
 * @param {Buffer} buffer - File content
 * @param {string} key - Object key (path within the bucket), e.g. "livestreams/video-123.webm"
 * @param {string} contentType - MIME type
 * @returns {string} Public URL of the uploaded object
 */
const uploadToR2 = async (buffer, key, contentType) => {
  await r2Client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  }));
  return `${process.env.R2_PUBLIC_URL}/${key}`;
};

/**
 * Delete an object from Cloudflare R2 by its public URL.
 * Silently ignores URLs that don't belong to R2.
 */
const deleteFromR2 = async (url) => {
  if (!url || !process.env.R2_PUBLIC_URL || !url.startsWith(process.env.R2_PUBLIC_URL)) return;
  const key = url.slice(process.env.R2_PUBLIC_URL.length + 1); // strip leading slash
  try {
    await r2Client.send(new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    }));
  } catch (err) {
    console.error('Error deleting from R2:', key, err.message);
  }
};

module.exports = { uploadToR2, deleteFromR2 };
