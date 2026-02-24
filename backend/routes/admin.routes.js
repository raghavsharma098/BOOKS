/**
 * Admin Dashboard Routes  /api/admin
 * Access: admin | editorial_admin
 */
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDashboardStats,
  getUsers,
  updateUser,
} = require('../controllers/admin.controller');
const {
  getAllBooksAdmin,
  getAdminBook,
  approveBook,
  rejectBook,
  adminUpdateBook,
  adminCreateBook,
} = require('../controllers/adminBook.controller');
const { uploadSingle, handleUploadError } = require('../middleware/upload');
const {
  getAllEventsAdmin,
  createEventAdmin,
  updateEventAdmin,
  deleteEventAdmin,
} = require('../controllers/adminEvent.controller');
const {
  getAllClubsAdmin,
  createClubAdmin,
  updateClubAdmin,
  approveClubAdmin,
  rejectClubAdmin,
  suspendClubAdmin,
  restoreClubAdmin,
  deleteClubAdmin,
} = require('../controllers/adminClub.controller');

const isAdmin = [protect, authorize('admin', 'editorial_admin')];
const adminOnly = [protect, authorize('admin')];

// ── Dashboard & Users ────────────────────────────────────────────────────────
router.get('/stats', ...isAdmin, getDashboardStats);
router.get('/users', ...isAdmin, getUsers);
router.put('/users/:id', ...adminOnly, updateUser);

// ── Book Management ──────────────────────────────────────────────────────────
// List all books with optional ?status=pending|approved|rejected filter
router.get('/books', ...isAdmin, getAllBooksAdmin);

// Admin create a book (full metadata, goes live immediately)
router.post(
  '/books',
  ...isAdmin,
  uploadSingle('coverImage'),
  handleUploadError,
  adminCreateBook
);

// Single book detail (with audit log)
router.get('/books/:id', ...isAdmin, getAdminBook);

// Edit any book field (pre-approval enrichment or regular edits)
router.put(
  '/books/:id',
  ...isAdmin,
  uploadSingle('coverImage'),
  handleUploadError,
  adminUpdateBook
);

// Approve pending book
router.post('/books/:id/approve', ...isAdmin, uploadSingle('coverImage'), handleUploadError, approveBook);

// Reject pending book
router.post('/books/:id/reject', ...isAdmin, rejectBook);

// ── Event Management ─────────────────────────────────────────────────────────
router.get('/events', ...isAdmin, getAllEventsAdmin);
router.post('/events', ...isAdmin, uploadSingle('coverImage'), handleUploadError, createEventAdmin);
router.put('/events/:id', ...isAdmin, uploadSingle('coverImage'), handleUploadError, updateEventAdmin);
router.delete('/events/:id', ...isAdmin, deleteEventAdmin);

// ── Book Club Management ────────────────────────────────────────────────
// Create (admin-authored, immediately approved)
router.post('/clubs', ...isAdmin, uploadSingle('coverImage'), handleUploadError, createClubAdmin);
// List all clubs (all statuses, with counts)
router.get('/clubs', ...isAdmin, getAllClubsAdmin);
// Edit any field
router.put('/clubs/:id', ...isAdmin, uploadSingle('coverImage'), handleUploadError, updateClubAdmin);
// Status transitions
router.patch('/clubs/:id/approve',  ...isAdmin, approveClubAdmin);
router.patch('/clubs/:id/reject',   ...isAdmin, rejectClubAdmin);
router.patch('/clubs/:id/suspend',  ...isAdmin, suspendClubAdmin);
router.patch('/clubs/:id/restore',  ...isAdmin, restoreClubAdmin);
// Hard soft-delete
router.delete('/clubs/:id', ...adminOnly, deleteClubAdmin);

module.exports = router;
