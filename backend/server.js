const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const path = require('path');
const app = express();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const quizRoutes = require('./routes/quiz.routes');
const bookRoutes = require('./routes/book.routes');
const authorRoutes = require('./routes/author.routes');
const readingRoutes = require('./routes/reading.routes');
const reviewRoutes = require('./routes/review.routes');
const communityRoutes = require('./routes/community.routes');
const clubRoutes = require('./routes/club.routes');
const recommendationRoutes = require('./routes/recommendation.routes');
const eventRoutes = require('./routes/event.routes');
const giveawayRoutes = require('./routes/giveaway.routes');
const badgeRoutes = require('./routes/badge.routes');
const notificationRoutes = require('./routes/notification.routes');
const adminRoutes = require('./routes/admin.routes');
const blogRoutes = require('./routes/blog.routes');
const moderationRoutes = require('./routes/moderation.routes');
const pollRoutes = require('./routes/poll.routes');

// Import error handler
const errorHandler = require('./middleware/errorHandler');

// Import scheduled tasks
const { startScheduledJobs } = require('./services/scheduledTasks');

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve locally uploaded images
// Cross-Origin-Resource-Policy must be 'cross-origin' so the Next.js frontend
// (localhost:3000) can load images served from this server (localhost:5000).
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Rate limiting – disabled in development, generous in production
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // 1000 requests per window per IP
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/', limiter);
}

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected successfully');
  // Start scheduled jobs after database connection
  startScheduledJobs();
})
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/reading', readingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/clubs', clubRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/giveaways', giveawayRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/moderation', moderationRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/polls', pollRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start scheduled background jobs
  startScheduledJobs();
});

module.exports = app;
