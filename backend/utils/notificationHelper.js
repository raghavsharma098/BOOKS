const Notification = require('../models/Notification.model');
const { sendEmail } = require('../config/email');
const User = require('../models/User.model');

// Create and send notification
exports.createNotification = async (notificationData) => {
  try {
    const notification = await Notification.create(notificationData);
    
    // Check if email notification should be sent
    if (notificationData.sendEmail) {
      await this.sendEmailNotification(notification);
    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Send email notification
exports.sendEmailNotification = async (notification) => {
  try {
    const user = await User.findById(notification.user);
    
    if (!user) return;
    
    // Check user's email notification preferences
    const notificationType = notification.type.replace(/_/g, '');
    const emailPref = user.notificationSettings?.email;
    
    if (!emailPref || emailPref[notificationType] === false) {
      return; // User has disabled email for this type
    }
    
    // Send email
    await sendEmail({
      to: user.email,
      subject: notification.title,
      html: this.getEmailTemplate(notification),
    });
    
    // Mark email as sent
    notification.emailSent = true;
    notification.emailSentAt = new Date();
    await notification.save();
    
  } catch (error) {
    console.error('Error sending email notification:', error);
  }
};

// Get email template based on notification type
exports.getEmailTemplate = (notification) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #4F46E5;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>${notification.title}</h2>
        <p>${notification.message}</p>
        ${notification.actionUrl ? `<a href="${notification.actionUrl}" class="button">View Details</a>` : ''}
      </div>
    </body>
    </html>
  `;
};

// Bulk create notifications
exports.bulkCreateNotifications = async (notifications) => {
  try {
    return await Notification.insertMany(notifications);
  } catch (error) {
    console.error('Error bulk creating notifications:', error);
    throw error;
  }
};

// Mark notification as read
exports.markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId,
    });
    
    if (notification) {
      notification.markAsRead();
      await notification.save();
    }
    
    return notification;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all as read
exports.markAllAsRead = async (userId) => {
  try {
    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Get unread count
exports.getUnreadCount = async (userId) => {
  try {
    return await Notification.countDocuments({
      user: userId,
      isRead: false,
    });
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};
