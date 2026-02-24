const express = require('express');
const router = express.Router();
const {
  getMyReadingList,
  addToReadingList,
  updateProgress,
  markAsFinished,
  markAsDNF,
  deleteReading,
} = require('../controllers/reading.controller');
const { protect } = require('../middleware/auth');
const { validateObjectId, validate } = require('../middleware/validator');

// All routes are protected
router.use(protect);

router.get('/', getMyReadingList);
router.post('/', addToReadingList);
router.put('/:id/progress', validateObjectId('id'), validate, updateProgress);
router.put('/:id/finish', validateObjectId('id'), validate, markAsFinished);
router.put('/:id/dnf', validateObjectId('id'), validate, markAsDNF);
router.delete('/:id', validateObjectId('id'), validate, deleteReading);

module.exports = router;
