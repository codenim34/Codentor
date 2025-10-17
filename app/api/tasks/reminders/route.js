import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connect } from '@/lib/mongodb/mongoose';
import Task from '@/lib/models/taskModel';
import User from '@/lib/models/userModel';
import Notification from '@/lib/models/notificationModel';
import PushSubscription from '@/lib/models/pushSubscriptionModel';
const { sendTaskReminderEmail } = require('@/lib/utils/emailService');
import { sendTaskReminderPush } from '@/lib/utils/pushNotification';
import { pusher } from '@/lib/pusher';

// GET - Check and send reminders for due tasks (to be called by cron job)
export async function GET() {
  try {
    await connect();

    const now = new Date();

    // fetch upcoming tasks with any pending reminder
    const tasks = await Task.find({
      status: { $ne: 'completed' },
      dueDate: { $gte: now },
      $or: [
        { reminder24hSent: false },
        { reminder1hSent: false },
        { reminder5mSent: false },
      ],
    });

    let sent24h = 0, sent1h = 0, sent5m = 0;

    for (const task of tasks) {
      const msUntilDue = new Date(task.dueDate) - now;
      const minutesUntilDue = Math.floor(msUntilDue / (60 * 1000));

      // 5-minute window: 0..5
      if (!task.reminder5mSent && minutesUntilDue >= 0 && minutesUntilDue <= 5) {
        await sendReminderFor(task, '5m');
        task.reminder5mSent = true;
        await task.save();
        sent5m++;
        continue;
      }

      // 1-hour window: 6..60
      if (!task.reminder1hSent && minutesUntilDue > 5 && minutesUntilDue <= 60) {
        await sendReminderFor(task, '1h');
        task.reminder1hSent = true;
        await task.save();
        sent1h++;
        continue;
      }

      // 24-hour window: 61..1440
      if (!task.reminder24hSent && minutesUntilDue > 60 && minutesUntilDue <= 1440) {
        await sendReminderFor(task, '24h');
        task.reminder24hSent = true;
        await task.save();
        sent24h++;
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      sent24h,
      sent1h,
      sent5m,
      message: `Sent 24h:${sent24h}, 1h:${sent1h}, 5m:${sent5m}`,
    });

  } catch (error) {
    console.error('Error sending reminders:', error);
    return NextResponse.json(
      { error: 'Failed to send reminders' },
      { status: 500 }
    );
  }
}

async function sendReminderFor(task, windowType) {
  const user = await User.findOne({ clerkId: task.userId });
  if (!user) return;

  const reminderType = windowType === '24h' ? 'reminder' : 'due_soon';

  // email
  await sendTaskReminderEmail(user.email, user.firstName, task, reminderType);

  // in-app notification
  const notification = await Notification.create({
    userId: task.userId,
    type: reminderType === 'reminder' ? 'task_reminder' : 'task_due_soon',
    actorId: task.userId,
    taskId: task._id,
  });

  await pusher.trigger(`user-${task.userId}`, 'notification', {
    notification: {
      ...notification.toObject(),
      task: { title: task.title, dueDate: task.dueDate },
      windowType,
    },
  });

  // push notifications
  const subscriptions = await PushSubscription.find({ userId: task.userId });
  for (const sub of subscriptions) {
    await sendTaskReminderPush(sub.subscription, task, reminderType);
  }
}

// POST - Send test reminder for a specific task
export async function POST(request) {
  try {
    await connect();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Send test email
    await sendTaskReminderEmail(user.email, user.firstName, task, 'reminder');

    // Send test in-app notification
    const notification = await Notification.create({
      userId,
      type: 'task_reminder',
      actorId: userId,
      taskId: task._id,
    });

    await pusher.trigger(`user-${userId}`, 'notification', {
      notification: {
        ...notification.toObject(),
        task: {
          title: task.title,
          dueDate: task.dueDate,
        },
      },
    });

    // Send test push notification
    const subscriptions = await PushSubscription.find({ userId });
    for (const sub of subscriptions) {
      await sendTaskReminderPush(sub.subscription, task, 'reminder');
    }

    return NextResponse.json({
      success: true,
      message: 'Test reminder sent successfully',
    });

  } catch (error) {
    console.error('Error sending test reminder:', error);
    return NextResponse.json(
      { error: 'Failed to send test reminder' },
      { status: 500 }
    );
  }
}

