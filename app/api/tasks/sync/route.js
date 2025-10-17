import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connect } from '@/lib/mongodb/mongoose';
import Task from '@/lib/models/taskModel';
import {
  hasTokens,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getCalendarEvents,
} from '@/lib/utils/googleCalendar';

// POST - Sync a specific task with Google Calendar
export async function POST(request) {
  try {
    await connect();
    
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has connected Google Calendar
    const connected = await hasTokens(userId);
    if (!connected) {
      return NextResponse.json(
        { error: 'Google Calendar not connected' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { taskId, action } = body; // action: 'create', 'update', 'delete'

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

    let message = '';

    switch (action) {
      case 'create':
        if (task.googleCalendarEventId) {
          return NextResponse.json(
            { error: 'Task already synced with Google Calendar' },
            { status: 400 }
          );
        }
        const eventId = await createCalendarEvent(userId, task);
        task.googleCalendarEventId = eventId;
        await task.save();
        message = 'Task synced to Google Calendar';
        break;

      case 'update':
        if (!task.googleCalendarEventId) {
          return NextResponse.json(
            { error: 'Task not synced with Google Calendar' },
            { status: 400 }
          );
        }
        await updateCalendarEvent(userId, task.googleCalendarEventId, task);
        message = 'Google Calendar event updated';
        break;

      case 'delete':
        if (!task.googleCalendarEventId) {
          return NextResponse.json(
            { error: 'Task not synced with Google Calendar' },
            { status: 400 }
          );
        }
        await deleteCalendarEvent(userId, task.googleCalendarEventId);
        task.googleCalendarEventId = null;
        await task.save();
        message = 'Task removed from Google Calendar';
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message,
      task,
    });

  } catch (error) {
    console.error('Error syncing task:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync task' },
      { status: 500 }
    );
  }
}

// GET - Sync all tasks from Google Calendar to app
export async function GET() {
  try {
    await connect();
    
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has connected Google Calendar
    const connected = await hasTokens(userId);
    if (!connected) {
      return NextResponse.json(
        { error: 'Google Calendar not connected' },
        { status: 400 }
      );
    }

    // Get events from Google Calendar (next 30 days)
    const timeMin = new Date().toISOString();
    const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const events = await getCalendarEvents(userId, timeMin, timeMax);

    // Get existing tasks with Google Calendar event IDs
    const existingTasks = await Task.find({ 
      userId, 
      googleCalendarEventId: { $ne: null } 
    });
    
    const existingEventIds = new Set(
      existingTasks.map(t => t.googleCalendarEventId)
    );

    // Import new events as tasks
    let importedCount = 0;
    for (const event of events) {
      // Skip events that are already synced
      if (existingEventIds.has(event.id)) {
        continue;
      }

      // Skip all-day events or events without start time
      if (!event.start?.dateTime) {
        continue;
      }

      // Create task from event
      await Task.create({
        userId,
        title: event.summary || 'Untitled Event',
        description: event.description || '',
        dueDate: new Date(event.start.dateTime),
        status: 'pending',
        priority: 'medium',
        googleCalendarEventId: event.id,
      });

      importedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${importedCount} events from Google Calendar`,
      importedCount,
    });

  } catch (error) {
    console.error('Error syncing from Google Calendar:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync from Google Calendar' },
      { status: 500 }
    );
  }
}

