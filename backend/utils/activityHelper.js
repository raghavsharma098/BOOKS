const Activity = require('../models/Activity.model');

// Create activity
exports.createActivity = async (userId, type, description, relatedEntities = {}) => {
  try {
    const activity = await Activity.create({
      user: userId,
      type,
      description,
      ...relatedEntities,
    });
    
    return activity;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
};

// Activity types helper functions
exports.logBookFinished = async (userId, bookId, bookTitle) => {
  return this.createActivity(
    userId,
    'finished_book',
    `Finished reading "${bookTitle}"`,
    { relatedBook: bookId }
  );
};

exports.logBookStarted = async (userId, bookId, bookTitle) => {
  return this.createActivity(
    userId,
    'started_book',
    `Started reading "${bookTitle}"`,
    { relatedBook: bookId }
  );
};

exports.logAddedToTBR = async (userId, bookId, bookTitle) => {
  return this.createActivity(
    userId,
    'added_to_tbr',
    `Added "${bookTitle}" to their TBR`,
    { relatedBook: bookId }
  );
};

exports.logReviewCreated = async (userId, bookId, reviewId, bookTitle) => {
  return this.createActivity(
    userId,
    'reviewed_book',
    `Reviewed "${bookTitle}"`,
    { relatedBook: bookId, relatedReview: reviewId }
  );
};

exports.logClubJoined = async (userId, clubId, clubName) => {
  return this.createActivity(
    userId,
    'joined_club',
    `Joined "${clubName}" club`,
    { relatedClub: clubId }
  );
};

exports.logClubCreated = async (userId, clubId, clubName) => {
  return this.createActivity(
    userId,
    'created_club',
    `Created "${clubName}" club`,
    { relatedClub: clubId }
  );
};

exports.logUserFollowed = async (followerId, followedUserId, followedUsername) => {
  return this.createActivity(
    followerId,
    'followed_user',
    `Started following ${followedUsername}`,
    { relatedUser: followedUserId }
  );
};

// Get activity feed for user (including their followed users)
exports.getActivityFeed = async (userId, followingIds, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    
    const activities = await Activity.find({
      user: { $in: [userId, ...followingIds] },
      isPrivate: false,
    })
      .populate('user', 'name username profilePicture')
      .populate('relatedBook', 'title coverImage')
      .populate('relatedUser', 'name username profilePicture')
      .populate('relatedClub', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    return activities;
  } catch (error) {
    console.error('Error getting activity feed:', error);
    throw error;
  }
};
