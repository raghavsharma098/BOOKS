const cron = require('cron');
const Reading = require('../models/Reading.model');
const Giveaway = require('../models/Giveaway.model');
const Event = require('../models/Event.model');
const User = require('../models/User.model');
const notificationHelper = require('../utils/notificationHelper');
const { sendEmail } = require('../config/email');
const { getReadingReminderTemplate } = require('../utils/emailTemplates');

// Send reading reminders daily at 8 PM
const readingReminderJob = new cron.CronJob(
  '0 20 * * *', // Every day at 8 PM
  async () => {
    try {
      console.log('Running reading reminder job...');

      // Get all currently reading books
      const readings = await Reading.find({
        status: 'currently_reading',
      })
        .populate('user', 'name email notificationSettings')
        .populate('book', 'title');

      for (const reading of readings) {
        // Check if user wants reading reminders
        if (reading.user.notificationSettings?.email?.readingReminder) {
          // Send notification
          await notificationHelper.createNotification({
            user: reading.user._id,
            type: 'reading_reminder',
            title: 'Reading Reminder',
            message: `Don't forget to continue reading "${reading.book.title}"`,
            relatedBook: reading.book._id,
            actionUrl: `/books/${reading.book._id}`,
            sendEmail: true,
          });
        }
      }

      console.log(`Sent ${readings.length} reading reminders`);
    } catch (error) {
      console.error('Error in reading reminder job:', error);
    }
  },
  null,
  false,
  'America/New_York'
);

// Check and update giveaway statuses every hour
const giveawayStatusJob = new cron.CronJob(
  '0 * * * *', // Every hour
  async () => {
    try {
      console.log('Checking giveaway statuses...');

      // Find active giveaways that have ended
      const endedGiveaways = await Giveaway.find({
        status: 'active',
        endDate: { $lt: new Date() },
      });

      for (const giveaway of endedGiveaways) {
        giveaway.status = 'ended';
        await giveaway.save();

        // Notify all participants
        for (const entry of giveaway.entries) {
          await notificationHelper.createNotification({
            user: entry.user,
            type: 'giveaway_result',
            title: 'Giveaway Ended',
            message: `The giveaway "${giveaway.title}" has ended. Winners will be announced soon!`,
            relatedGiveaway: giveaway._id,
            actionUrl: `/giveaways/${giveaway._id}`,
            sendEmail: false,
          });
        }
      }

      console.log(`Updated ${endedGiveaways.length} giveaways to ended status`);
    } catch (error) {
      console.error('Error in giveaway status job:', error);
    }
  },
  null,
  false,
  'America/New_York'
);

// Send event reminders 24 hours before
const eventReminderJob = new cron.CronJob(
  '0 9 * * *', // Every day at 9 AM
  async () => {
    try {
      console.log('Checking for upcoming events...');

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      // Find events happening tomorrow
      const upcomingEvents = await Event.find({
        status: 'approved',
        startDate: {
          $gte: tomorrow,
          $lt: dayAfterTomorrow,
        },
      }).populate('rsvps.user', 'name email notificationSettings');

      for (const event of upcomingEvents) {
        // Notify all RSVPs
        for (const rsvp of event.rsvps) {
          if (rsvp.status === 'going' && rsvp.user.notificationSettings?.email?.events) {
            await notificationHelper.createNotification({
              user: rsvp.user._id,
              type: 'event_reminder',
              title: 'Event Tomorrow',
              message: `Reminder: "${event.title}" is tomorrow!`,
              relatedEvent: event._id,
              actionUrl: `/events/${event._id}`,
              sendEmail: true,
            });
          }
        }
      }

      console.log(`Sent reminders for ${upcomingEvents.length} events`);
    } catch (error) {
      console.error('Error in event reminder job:', error);
    }
  },
  null,
  false,
  'America/New_York'
);

// Cleanup old notifications (older than 90 days)
const cleanupNotificationsJob = new cron.CronJob(
  '0 2 * * 0', // Every Sunday at 2 AM
  async () => {
    try {
      console.log('Cleaning up old notifications...');

      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const Notification = require('../models/Notification.model');
      const result = await Notification.deleteMany({
        createdAt: { $lt: ninetyDaysAgo },
        isRead: true,
      });

      console.log(`Deleted ${result.deletedCount} old notifications`);
    } catch (error) {
      console.error('Error in notification cleanup job:', error);
    }
  },
  null,
  false,
  'America/New_York'
);

// Start all jobs
const startScheduledJobs = () => {
  console.log('Starting scheduled jobs...');
  
  readingReminderJob.start();
  giveawayStatusJob.start();
  eventReminderJob.start();
  cleanupNotificationsJob.start();
  
  console.log('All scheduled jobs started successfully');
};

// Stop all jobs
const stopScheduledJobs = () => {
  readingReminderJob.stop();
  giveawayStatusJob.stop();
  eventReminderJob.stop();
  cleanupNotificationsJob.stop();
  
  console.log('All scheduled jobs stopped');
};

module.exports = {
  startScheduledJobs,
  stopScheduledJobs,
};
