import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { hasTokens, disconnectCalendar } from '@/lib/utils/googleCalendar';

// GET - Check if user has connected Google Calendar
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const connected = await hasTokens(userId);

    return NextResponse.json({
      connected,
    });

  } catch (error) {
    console.error('Error checking Google Calendar status:', error);
    return NextResponse.json(
      { error: 'Failed to check Google Calendar status' },
      { status: 500 }
    );
  }
}

// DELETE - Disconnect Google Calendar
export async function DELETE() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await disconnectCalendar(userId);

    return NextResponse.json({
      success: true,
      message: 'Google Calendar disconnected successfully',
    });

  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect Google Calendar' },
      { status: 500 }
    );
  }
}

