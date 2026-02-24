/**
 * Blog / Editorial CMS Controller
 * Admin and editorial_admin can create, edit, publish, feature blog posts.
 * Public can only read published/featured posts.
 */
const mongoose = require('mongoose');
const BlogPost = require('../models/BlogPost.model');
const { uploadToCloudinary } = require('../utils/imageUpload');

// ─── Helpers ─────────────────────────────────────────────────────────────────
const buildFilter = (req) => {
  const filter = { isDeleted: { $ne: true } };
  if (req.query.visibility) filter.visibility = req.query.visibility;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.tag) filter.tags = req.query.tag.toLowerCase();
  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { excerpt: { $regex: req.query.search, $options: 'i' } },
      { tags: { $regex: req.query.search, $options: 'i' } },
    ];
  }
  return filter;
};

// @desc    Get all blog posts (admin sees all; public only published/featured)
// @route   GET /api/blogs
// @access  Public (filtered) | Admin (all)
exports.getBlogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const isAdmin =
      req.user && (req.user.role === 'admin' || req.user.role === 'editorial_admin');

    const filter = buildFilter(req);

    // Non-admins can only see published and featured posts
    if (!isAdmin) {
      filter.visibility = { $in: ['published', 'featured'] };
    }

    const [blogs, total] = await Promise.all([
      BlogPost.find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name profilePicture')
        .populate('relatedBook', 'title coverImage')
        .populate('relatedAuthor', 'name profileImage'),
      BlogPost.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: blogs,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single blog post by id or slug
// @route   GET /api/blogs/:idOrSlug
// @access  Public
exports.getBlog = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const isAdmin =
      req.user && (req.user.role === 'admin' || req.user.role === 'editorial_admin');

    const q = mongoose.Types.ObjectId.isValid(idOrSlug)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };

    const blog = await BlogPost.findOne({ ...q, isDeleted: { $ne: true } })
      .populate('author', 'name profilePicture')
      .populate('relatedBook', 'title coverImage author genres')
      .populate('relatedAuthor', 'name profileImage bio');

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    if (!isAdmin && blog.visibility === 'draft') {
      return res.status(403).json({ success: false, message: 'This post is not yet published' });
    }

    // Increment view counter async (don't await – non-blocking)
    BlogPost.findByIdAndUpdate(blog._id, { $inc: { views: 1 } }).exec();

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

// @desc    Create blog post
// @route   POST /api/blogs
// @access  Private/Admin|Editorial
exports.createBlog = async (req, res, next) => {
  try {
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'blog-covers');
      req.body.coverImage = result.url;
    }

    // Auto-calculate read time (~200 words per minute)
    if (req.body.body) {
      const wordCount = req.body.body.replace(/<[^>]+>/g, '').split(/\s+/).length;
      req.body.readTime = Math.max(1, Math.round(wordCount / 200));
    }

    const blog = await BlogPost.create({ ...req.body, author: req.user._id });

    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

// @desc    Update blog post
// @route   PUT /api/blogs/:id
// @access  Private/Admin|Editorial
exports.updateBlog = async (req, res, next) => {
  try {
    const blog = await BlogPost.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'blog-covers');
      req.body.coverImage = result.url;
    }

    if (req.body.body) {
      const wordCount = req.body.body.replace(/<[^>]+>/g, '').split(/\s+/).length;
      req.body.readTime = Math.max(1, Math.round(wordCount / 200));
    }

    // Protect slug — don't allow overwrite from body
    delete req.body.slug;

    Object.assign(blog, req.body);
    await blog.save();

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

// @desc    Change blog visibility (draft | published | featured)
// @route   PATCH /api/blogs/:id/visibility
// @access  Private/Admin|Editorial
exports.setBlogVisibility = async (req, res, next) => {
  try {
    const { visibility } = req.body;
    if (!['draft', 'published', 'featured'].includes(visibility)) {
      return res.status(400).json({ success: false, message: 'Invalid visibility value' });
    }

    const blog = await BlogPost.findOneAndUpdate(
      { _id: req.params.id, isDeleted: { $ne: true } },
      { visibility },
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft-delete blog post
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
exports.deleteBlog = async (req, res, next) => {
  try {
    const blog = await BlogPost.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog post not found' });
    }

    blog.isDeleted = true;
    await blog.save();

    res.status(200).json({ success: true, message: 'Blog post deleted' });
  } catch (error) {
    next(error);
  }
};

// Need mongoose for ObjectId check in getBlog — imported at top of file
