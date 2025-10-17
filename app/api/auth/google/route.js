import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAuthUrl } from '@/lib/utils/googleCalendar';

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate OAuth URL with userId in state
    const authUrl = getAuthUrl(userId);

    // Redirect to Google OAuth consent screen
    return NextResponse.redirect(authUrl);
    
  } catch (error) {
    console.error('Error initiating Google OAuth:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google authentication' },
      { status: 500 }
    );
  }
}

