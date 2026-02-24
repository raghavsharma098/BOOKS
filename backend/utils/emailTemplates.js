exports.getEmailVerificationTemplate = (name, verificationUrl) => {
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
        .footer {
          margin-top: 40px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Welcome to BookPlatform, ${name}!</h2>
        <p>Thank you for signing up. Please verify your email address to get started.</p>
        <a href="${verificationUrl}" class="button">Verify Email</a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <div class="footer">
          <p>If you didn't create an account, please ignore this email.</p>
          <p>&copy; ${new Date().getFullYear()} BookPlatform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

exports.getPasswordResetTemplate = (name, resetUrl) => {
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
        .footer {
          margin-top: 40px;
          font-size: 12px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <a href="${resetUrl}" class="button">Reset Password</a>
        <p>Or copy and paste this link in your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <div class="footer">
          <p>If you didn't request a password reset, please ignore this email.</p>
          <p>&copy; ${new Date().getFullYear()} BookPlatform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

exports.getReadingReminderTemplate = (name, bookTitle) => {
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
      </style>
    </head>
    <body>
      <div class="container">
        <h2>📚 Reading Reminder</h2>
        <p>Hi ${name},</p>
        <p>Don't forget to continue reading <strong>${bookTitle}</strong>!</p>
        <p>Log your reading progress and share your thoughts with the community.</p>
        <p>Happy reading! 📖</p>
      </div>
    </body>
    </html>
  `;
};

exports.getGiveawayWinnerTemplate = (name, bookTitle, giveawayTitle) => {
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
        .congratulations {
          color: #4F46E5;
          font-size: 24px;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <p class="congratulations">🎉 Congratulations ${name}!</p>
        <p>You've won the giveaway: <strong>${giveawayTitle}</strong></p>
        <p>You'll receive <strong>${bookTitle}</strong> soon!</p>
        <p>We'll be in touch with more details shortly.</p>
        <p>Happy reading! 📚</p>
      </div>
    </body>
    </html>
  `;
};

exports.getClubInvitationTemplate = (name, clubName, inviterName, invitationUrl) => {
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
        <h2>📚 Book Club Invitation</h2>
        <p>Hi ${name},</p>
        <p><strong>${inviterName}</strong> has invited you to join <strong>${clubName}</strong>!</p>
        <a href="${invitationUrl}" class="button">View Invitation</a>
        <p>Join the club and start discussing your favorite books!</p>
      </div>
    </body>
    </html>
  `;
};
