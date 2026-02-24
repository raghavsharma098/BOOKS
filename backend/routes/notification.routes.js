const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth');
const { validateObjectId, validate } = require('../middleware/validator');

// All routes are protected
router.use(protect);

router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', validateObjectId('id'), validate, markAsRead);
router.delete('/:id', validateObjectId('id'), validate, deleteNotification);

module.exports = router;
