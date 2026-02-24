const mongoose = require('mongoose');
require('dotenv').config();

const QuizQuestion = require('../models/QuizQuestion.model');

const quizQuestions = [
  {
    order: 1,
    question: 'What genres do you enjoy reading?',
    type: 'multiple_choice',
    options: [
      { value: 'fiction', label: 'Fiction' },
      { value: 'non-fiction', label: 'Non-Fiction' },
      { value: 'mystery', label: 'Mystery & Thriller' },
      { value: 'romance', label: 'Romance' },
      { value: 'sci-fi', label: 'Science Fiction' },
      { value: 'fantasy', label: 'Fantasy' },
      { value: 'biography', label: 'Biography & Memoir' },
      { value: 'self-help', label: 'Self-Help' },
      { value: 'historical', label: 'Historical Fiction' },
      { value: 'horror', label: 'Horror' }
    ],
    isMultiSelect: true,
    isRequired: true,
    isActive: true
  },
  {
    order: 2,
    question: 'How would you describe your reading pace?',
    type: 'single_choice',
    options: [
      { value: 'slow', label: 'Slow & Steady (1-2 books/month)' },
      { value: 'moderate', label: 'Moderate (3-5 books/month)' },
      { value: 'fast', label: 'Fast Reader (6+ books/month)' }
    ],
    isMultiSelect: false,
    isRequired: true,
    isActive: true
  },
  {
    order: 3,
    question: 'What mood are you usually in when reading?',
    type: 'multiple_choice',
    options: [
      { value: 'relaxing', label: 'Relaxing & Light-hearted' },
      { value: 'thought-provoking', label: 'Thought-provoking & Deep' },
      { value: 'exciting', label: 'Exciting & Fast-paced' },
      { value: 'emotional', label: 'Emotional & Moving' },
      { value: 'inspiring', label: 'Inspiring & Motivational' },
      { value: 'dark', label: 'Dark & Mysterious' }
    ],
    isMultiSelect: true,
    isRequired: true,
    isActive: true
  },
  {
    order: 4,
    question: 'Do you have any favorite authors?',
    type: 'text',
    isRequired: false,
    isActive: true,
    placeholder: 'Enter author names separated by commas'
  },
  {
    order: 5,
    question: 'What book length do you prefer?',
    type: 'single_choice',
    options: [
      { value: 'short', label: 'Short (< 200 pages)' },
      { value: 'medium', label: 'Medium (200-400 pages)' },
      { value: 'long', label: 'Long (400+ pages)' },
      { value: 'any', label: 'No preference' }
    ],
    isMultiSelect: false,
    isRequired: true,
    isActive: true
  },
  {
    order: 6,
    question: 'Are you interested in joining book clubs?',
    type: 'single_choice',
    options: [
      { value: 'yes', label: 'Yes, I love discussing books!' },
      { value: 'maybe', label: 'Maybe, I\'ll see' },
      { value: 'no', label: 'No, I prefer reading alone' }
    ],
    isMultiSelect: false,
    isRequired: true,
    isActive: true
  }
];

const seedQuizQuestions = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Clear existing questions
    await QuizQuestion.deleteMany({});
    console.log('Cleared existing quiz questions');

    // Insert new questions
    await QuizQuestion.insertMany(quizQuestions);
    console.log(`✓ Successfully seeded ${quizQuestions.length} quiz questions`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding quiz questions:', error);
    process.exit(1);
  }
};

seedQuizQuestions();
