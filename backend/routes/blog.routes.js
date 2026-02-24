/**
 * Blog Routes  /api/blogs
 * Public: GET (published/featured only)
 * Admin/Editorial: full CRUD
 */
const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  setBlogVisibility,
  deleteBlog,
} = require('../controllers/blog.controller');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { uploadSingle, handleUploadError } = require('../middleware/upload');
const { validateObjectId, validate } = require('../middleware/validator');

const isEditor = [protect, authorize('admin', 'editorial_admin')];

// Public
router.get('/', optionalAuth, getBlogs);
router.get('/:idOrSlug', optionalAuth, getBlog);

// Admin / editorial only
router.post(
  '/',
  ...isEditor,
  uploadSingle('coverImage'),
  handleUploadError,
  createBlog
);
router.put(
  '/:id',
  ...isEditor,
  validateObjectId('id'),
  validate,
  uploadSingle('coverImage'),
  handleUploadError,
  updateBlog
);
router.patch('/:id/visibility', ...isEditor, validateObjectId('id'), validate, setBlogVisibility);
router.delete('/:id', protect, authorize('admin'), validateObjectId('id'), validate, deleteBlog);

module.exports = router;
