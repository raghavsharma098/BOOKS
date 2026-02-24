const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User.model');

const createAdminUser = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@bookplatform.com',
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
      preferences: {
        genres: [],
        authors: [],
        mood: [],
        readingPace: 'moderate'
      },
      notificationSettings: {
        email: {
          newFollower: true,
          clubInvites: true,
          bookRecommendations: true,
          readingReminder: true,
          reviewLikes: true,
          clubActivity: true,
          events: true,
          giveaways: true
        },
        inApp: {
          newFollower: true,
          clubInvites: true,
          bookRecommendations: true,
          readingReminder: true,
          reviewLikes: true,
          clubActivity: true,
          events: true,
          giveaways: true,
          badges: true
        }
      },
      stats: {
        booksRead: 0,
        totalPages: 0,
        currentStreak: 0,
        longestStreak: 0
      }
    });

    await adminUser.save();
    
    console.log('✓ Admin user created successfully!');
    console.log('Email: admin@bookplatform.com');
    console.log('Password: Admin@123');
    console.log('\n⚠️  Please change this password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
