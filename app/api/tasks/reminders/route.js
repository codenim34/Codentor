import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connect } from '@/lib/mongodb/mongoose';
import Task from '@/lib/models/taskModel';
import User from '@/lib/models/userModel';
import Notification from '@/lib/models/notificationModel';
import PushSubscription from '@/lib/models/pushSubscriptionModel';
import { sendTaskReminderEmail } from '@/lib/utils/emailService';
import { sendTaskReminderPush } from '@/lib/utils/pushNotification';
import { pusher } from '@/lib/pusher';

// GET - Check and send reminders for due tasks (to be called by cron job)
export async function GET() {
  try {
    await connect();

    const now = new Date();
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    // Find tasks that need reminders (not completed and not already reminded)
    const tasksDueSoon = await Task.find({
      status: { $ne: 'completed' },
      reminderSent: false,
      dueDate: {
        $gte: now,
        $lte: oneDayFromNow,
      },
    });

    let remindersSent = 0;

    for (const task of tasksDueSoon) {
      // Get user details
      const user = await User.findOne({ clerkId: task.userId });
      if (!user) continue;

      // Determine reminder type
      const timeUntilDue = new Date(task.dueDate) - now;
      const reminderType = timeUntilDue <= 60 * 60 * 1000 ? 'due_soon' : 'reminder';

      // Send email notification
      await sendTaskReminderEmail(
        user.email,
        user.firstName,
        task,
        reminderType
      );

      // Send in-app notification (Pusher)
      const notification = await Notification.create({
        userId: task.userId,
        type: reminderType === 'due_soon' ? 'task_due_soon' : 'task_reminder',
        actorId: task.userId, // Self notification
        taskId: task._id,
      });

      await pusher.trigger(`user-${task.userId}`, 'notification', {
        notification: {
          ...notification.toObject(),
          task: {
            title: task.title,
            dueDate: task.dueDate,
          },
        },
      });

      // Send push notification
      const subscriptions = await PushSubscription.find({ userId: task.userId });
      for (const sub of subscriptions) {
        await sendTaskReminderPush(sub.subscription, task, reminderType);
      }

      // Mark reminder as sent
      task.reminderSent = true;
      await task.save();

      remindersSent++;
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${remindersSent} reminders`,
      remindersSent,
    });

  } catch (error) {
    console.error('Error sending reminders:', error);
    return NextResponse.json(
      { error: 'Failed to send reminders' },
      { status: 500 }
    );
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

