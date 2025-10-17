import nodemailer from 'nodemailer';

// Create transporter based on environment variables
function createTransporter() {
  // Check if SMTP credentials are provided
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  // Fallback to console logging if no email service configured
  console.warn('Email service not configured. Emails will be logged to console.');
  return null;
}

/**
 * Send task reminder email
 */
export async function sendTaskReminderEmail(userEmail, userName, task, reminderType) {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('Email would be sent to:', userEmail);
    console.log('Task:', task.title);
    console.log('Reminder type:', reminderType);
    return { success: false, message: 'Email service not configured' };
  }

  const subject = reminderType === 'due_soon' 
    ? `⏰ Task Due Soon: ${task.title}`
    : `📋 Task Reminder: ${task.title}`;

  const dueDate = new Date(task.dueDate);
  const formattedDate = dueDate.toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .task-card { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981; border-radius: 5px; }
          .task-title { font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
          .task-detail { margin: 10px 0; color: #6b7280; }
          .due-date { font-size: 18px; color: #ef4444; font-weight: bold; margin: 15px 0; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #9ca3af; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Task Reminder</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>${reminderType === 'due_soon' 
              ? 'This is a reminder that your task is due soon!' 
              : 'Don\'t forget about your scheduled task!'}</p>
            
            <div class="task-card">
              <div class="task-title">${task.title}</div>
              ${task.description ? `<div class="task-detail">${task.description}</div>` : ''}
              <div class="due-date">⏰ Due: ${formattedDate}</div>
              ${task.priority ? `<div class="task-detail">Priority: <strong>${task.priority.toUpperCase()}</strong></div>` : ''}
              ${task.link ? `<div class="task-detail">🔗 <a href="${task.link}" style="color: #10b981;">Related Link</a></div>` : ''}
            </div>

            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/tasks" class="button">
              View in Codentor
            </a>

            <p>Stay productive! 💪</p>
          </div>
          <div class="footer">
            <p>You're receiving this email because you have task reminders enabled.</p>
            <p>© ${new Date().getFullYear()} Codentor. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: userEmail,
      subject,
      html,
    });

    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Send test email
 */
export async function sendTestEmail(userEmail, userName) {
  const transporter = createTransporter();
  
  if (!transporter) {
    return { success: false, message: 'Email service not configured' };
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: userEmail,
      subject: 'Test Email from Codentor',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Hello ${userName}!</h2>
          <p>This is a test email from Codentor's task management system.</p>
          <p>Your email notifications are working correctly! ✅</p>
        </div>
      `,
    });

    return { success: true, message: 'Test email sent successfully' };
  } catch (error) {
    console.error('Error sending test email:', error);
    return { success: false, message: error.message };
  }
}

