const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const BACKEND_ORIGIN = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5009}`;

// Save image buffer to local disk  (drop-in replacement for uploadToCloudinary)
exports.uploadToCloudinary = async (fileBuffer, folder = 'uploads') => {
  const dir = path.join(UPLOADS_DIR, folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filename = `${uuidv4()}.jpg`;
  const filepath = path.join(dir, filename);
  fs.writeFileSync(filepath, fileBuffer);

  // Build a full absolute URL so frontend <img> tags work without any prefix helper
  const url = `${BACKEND_ORIGIN}/uploads/${folder}/${filename}`;
  return { url, publicId: `${folder}/${filename}` };
};

// Delete image from local disk
exports.deleteFromCloudinary = async (publicId) => {
  try {
    const filepath = path.join(UPLOADS_DIR, publicId);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    return true;
  } catch (error) {
    console.error('Error deleting local image:', error);
    return false;
  }
};

// Extract relative public ID (folder/filename) from a stored URL
// Handles both full URLs: http://localhost:5000/uploads/folder/file.jpg
// and legacy relative paths: /uploads/folder/file.jpg
exports.extractPublicId = (url) => {
  if (!url) return null;
  // Strip protocol + host to get /uploads/folder/file.jpg
  const pathname = url.startsWith('http') ? new URL(url).pathname : url;
  // pathname is like /uploads/profile-pictures/uuid.jpg
  // publicId for delete should be profile-pictures/uuid.jpg
  const match = pathname.match(/\/uploads\/(.+)$/);
  return match ? match[1] : null;
};
