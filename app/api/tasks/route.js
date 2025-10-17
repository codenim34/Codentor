import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connect } from '@/lib/mongodb/mongoose';
import Task from '@/lib/models/taskModel';

// GET all tasks for the authenticated user
export async function GET(request) {
  try {
    await connect();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter'); // 'today', 'remaining', 'completed', 'all'
    const status = searchParams.get('status'); // 'pending', 'in-progress', 'completed'

    let query = { userId };

    // Apply filters
    if (filter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.dueDate = { $gte: today, $lt: tomorrow };
    } else if (filter === 'remaining') {
      query.status = { $ne: 'completed' };
    } else if (filter === 'completed') {
      query.status = 'completed';
    }

    if (status) {
      query.status = status;
    }

    const tasks = await Task.find(query).sort({ dueDate: 1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      tasks,
      count: tasks.length
    });

  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST create a new task
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
    const { title, description, link, dueDate, priority, tags, status } = body;

    // Validation
    if (!title || !dueDate) {
      return NextResponse.json(
        { error: 'Title and due date are required' },
        { status: 400 }
      );
    }

    const task = await Task.create({
      userId,
      title,
      description: description || '',
      link: link || '',
      dueDate: new Date(dueDate),
      priority: priority || 'medium',
      tags: tags || [],
      status: status || 'pending',
    });

    return NextResponse.json({
      success: true,
      task,
      message: 'Task created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

// PATCH update a task
export async function PATCH(request) {
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
    const { taskId, ...updates } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Find task and verify ownership
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'link', 'dueDate', 'status', 'priority', 'tags'];
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        task[key] = updates[key];
      }
    });

    // If dueDate changed, reset reminder flags so future reminders fire again
    if (updates.dueDate) {
      task.reminder24hSent = false;
      task.reminder1hSent = false;
      task.reminder5mSent = false;
      task.reminderSent = false;
    }

    await task.save();

    return NextResponse.json({
      success: true,
      task,
      message: 'Task updated successfully'
    });

  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}

// DELETE a task
export async function DELETE(request) {
  try {
    await connect();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Find and delete task (verify ownership)
    const task = await Task.findOneAndDelete({ _id: taskId, userId });
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Failed to delete task' },
      { status: 500 }
    );
  }
}

