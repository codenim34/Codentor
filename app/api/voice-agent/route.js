import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connect } from '@/lib/mongodb/mongoose';
import Task from '@/lib/models/taskModel';
import Note from '@/lib/models/noteModel';

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
    const { command, transcript } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    // Process the voice command
    const result = await processVoiceCommand(transcript.toLowerCase(), userId);

    return NextResponse.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Error processing voice command:', error);
    return NextResponse.json(
      { error: 'Failed to process voice command' },
      { status: 500 }
    );
  }
}

async function processVoiceCommand(transcript, userId) {
  // Task scheduling patterns
  const taskPatterns = [
    /(?:schedule|add|create) (?:a )?task (?:to |called |named )?["']?([^"']+?)["']? (?:for|on|by) (?:today|tomorrow|(\d{1,2})(?:st|nd|rd|th)? (\w+)|(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?)/i,
    /(?:schedule|add|create) (?:a )?task ["']?([^"']+?)["']? (?:for|on|by) (?:today|tomorrow|(\d{1,2})(?:st|nd|rd|th)? (\w+)|(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?)/i,
    /(?:remind me to|i need to|don't forget to) ([^]+?) (?:for|on|by) (?:today|tomorrow|(\d{1,2})(?:st|nd|rd|th)? (\w+)|(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?)/i,
  ];

  // Note taking patterns
  const notePatterns = [
    /(?:take a note|create a note|save a note|note this|remember this):? ["']?([^"']+?)["']?$/i,
    /(?:make a note|new note) (?:that says |saying )?["']?([^"']+?)["']?$/i,
  ];

  // Check for task scheduling
  for (const pattern of taskPatterns) {
    const match = transcript.match(pattern);
    if (match) {
      const title = match[1].trim();
      const dueDate = parseDateFromMatch(match);
      
      try {
        const task = await Task.create({
          userId,
          title,
          description: '',
          dueDate,
          priority: 'medium',
          status: 'pending',
        });

        return {
          type: 'task',
          action: 'created',
          task,
          message: `Task "${title}" has been scheduled for ${dueDate.toLocaleDateString()}.`,
          response: `Got it! I've scheduled "${title}" for ${dueDate.toLocaleDateString()}.`
        };
      } catch (error) {
        console.error('Error creating task:', error);
        return {
          type: 'error',
          message: 'Failed to create task',
          response: 'Sorry, I encountered an error while creating the task.'
        };
      }
    }
  }

  // Check for note taking
  for (const pattern of notePatterns) {
    const match = transcript.match(pattern);
    if (match) {
      const content = match[1].trim();
      
      try {
        const note = await Note.create({
          userId,
          title: '',
          content,
          color: 'default',
          isPinned: false,
        });

        return {
          type: 'note',
          action: 'created',
          note,
          message: `Note saved: "${content}"`,
          response: `I've saved your note: "${content}"`
        };
      } catch (error) {
        console.error('Error creating note:', error);
        return {
          type: 'error',
          message: 'Failed to create note',
          response: 'Sorry, I encountered an error while saving the note.'
        };
      }
    }
  }

  // List tasks
  if (/(?:list|show|what are) (?:my )?(?:tasks|todos)/i.test(transcript)) {
    try {
      const tasks = await Task.find({ 
        userId, 
        status: { $ne: 'completed' } 
      }).sort({ dueDate: 1 }).limit(5);

      if (tasks.length === 0) {
        return {
          type: 'query',
          action: 'list_tasks',
          tasks: [],
          message: 'You have no pending tasks.',
          response: 'You have no pending tasks at the moment.'
        };
      }

      const taskList = tasks.map(t => `${t.title} - due ${new Date(t.dueDate).toLocaleDateString()}`).join(', ');
      return {
        type: 'query',
        action: 'list_tasks',
        tasks,
        message: `Your pending tasks: ${taskList}`,
        response: `You have ${tasks.length} pending task${tasks.length > 1 ? 's' : ''}: ${taskList}`
      };
    } catch (error) {
      console.error('Error listing tasks:', error);
      return {
        type: 'error',
        message: 'Failed to retrieve tasks',
        response: 'Sorry, I encountered an error while retrieving your tasks.'
      };
    }
  }

  // List notes
  if (/(?:list|show|what are) (?:my )?notes/i.test(transcript)) {
    try {
      const notes = await Note.find({ 
        userId, 
        isArchived: false 
      }).sort({ isPinned: -1, createdAt: -1 }).limit(5);

      if (notes.length === 0) {
        return {
          type: 'query',
          action: 'list_notes',
          notes: [],
          message: 'You have no notes.',
          response: 'You have no notes at the moment.'
        };
      }

      return {
        type: 'query',
        action: 'list_notes',
        notes,
        message: `You have ${notes.length} note${notes.length > 1 ? 's' : ''}.`,
        response: `You have ${notes.length} note${notes.length > 1 ? 's' : ''}. Would you like me to read them?`
      };
    } catch (error) {
      console.error('Error listing notes:', error);
      return {
        type: 'error',
        message: 'Failed to retrieve notes',
        response: 'Sorry, I encountered an error while retrieving your notes.'
      };
    }
  }

  // Default response
  return {
    type: 'unknown',
    message: 'Command not recognized',
    response: `I didn't quite catch that. You can say things like "schedule a task to finish the report for tomorrow" or "take a note: meeting at 3pm".`
  };
}

function parseDateFromMatch(match) {
  const fullMatch = match[0];
  
  // Check for "today"
  if (/today/i.test(fullMatch)) {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return today;
  }
  
  // Check for "tomorrow"
  if (/tomorrow/i.test(fullMatch)) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    return tomorrow;
  }
  
  // Check for "15th March" or "March 15th" pattern
  const monthDayMatch = fullMatch.match(/(\d{1,2})(?:st|nd|rd|th)? (\w+)/i);
  if (monthDayMatch) {
    const day = parseInt(monthDayMatch[1]);
    const monthName = monthDayMatch[2];
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 
                    'july', 'august', 'september', 'october', 'november', 'december'];
    const monthIndex = months.findIndex(m => m.startsWith(monthName.toLowerCase()));
    
    if (monthIndex !== -1) {
      const date = new Date();
      date.setMonth(monthIndex);
      date.setDate(day);
      date.setHours(23, 59, 59, 999);
      
      // If the date is in the past, assume next year
      if (date < new Date()) {
        date.setFullYear(date.getFullYear() + 1);
      }
      
      return date;
    }
  }
  
  // Check for "12/25" or "12/25/2024" pattern
  const dateMatch = fullMatch.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (dateMatch) {
    const month = parseInt(dateMatch[1]) - 1; // JavaScript months are 0-indexed
    const day = parseInt(dateMatch[2]);
    let year = dateMatch[3] ? parseInt(dateMatch[3]) : new Date().getFullYear();
    
    // Handle 2-digit years
    if (dateMatch[3] && dateMatch[3].length === 2) {
      year = 2000 + year;
    }
    
    const date = new Date(year, month, day, 23, 59, 59, 999);
    return date;
  }
  
  // Default to tomorrow if no date pattern matched
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999);
  return tomorrow;
}
