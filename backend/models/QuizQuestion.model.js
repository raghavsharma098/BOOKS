const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['single', 'multiple', 'scale', 'text'],
    required: true,
  },
  options: [{
    text: String,
    value: String,
    weight: {
      genres: [String],
      moods: [String],
      pace: String,
      emotionalHeaviness: String,
      plotVsCharacter: String,
    },
  }],
  category: {
    type: String,
    enum: ['genre', 'mood', 'pace', 'preference', 'emotional'],
    required: true,
  },
  order: {
    type: Number,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

quizQuestionSchema.index({ order: 1 });
quizQuestionSchema.index({ isActive: 1 });

const QuizQuestion = mongoose.model('QuizQuestion', quizQuestionSchema);

module.exports = QuizQuestion;
