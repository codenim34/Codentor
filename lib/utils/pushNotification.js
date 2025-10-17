import webpush from 'web-push';

// Configure web push with VAPID keys
// Generate VAPID keys with: npx web-push generate-vapid-keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:' + (process.env.EMAIL_FROM || 'noreply@codentor.com'),
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

/**
 * Send push notification to a subscription
 */
export async function sendPushNotification(subscription, payload) {
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.warn('VAPID keys not configured. Push notifications disabled.');
    return { success: false, message: 'Push notifications not configured' };
  }

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return { success: true, message: 'Push notification sent' };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Send task reminder push notification
 */
export async function sendTaskReminderPush(subscription, task, reminderType) {
  const payload = {
    title: reminderType === 'due_soon' ? '⏰ Task Due Soon!' : '📋 Task Reminder',
    body: task.title,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      url: '/tasks',
      taskId: task._id,
    },
    actions: [
      {
        action: 'view',
        title: 'View Task',
      },
      {
        action: 'close',
        title: 'Dismiss',
      },
    ],
  };

  return await sendPushNotification(subscription, payload);
}

/**
 * Generate VAPID keys (for setup)
 */
export function generateVapidKeys() {
  return webpush.generateVAPIDKeys();
}

