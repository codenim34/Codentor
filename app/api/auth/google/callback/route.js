import { NextResponse } from 'next/server';
import { getTokensFromCode, saveTokens } from '@/lib/utils/googleCalendar';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // This is the userId
    const error = searchParams.get('error');

    // Check if user denied access
    if (error) {
      return NextResponse.redirect(
        new URL('/tasks?error=access_denied', request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/tasks?error=invalid_callback', request.url)
      );
    }

    const userId = state;

    // Exchange authorization code for tokens
    const tokens = await getTokensFromCode(code);

    // Save tokens to database
    await saveTokens(userId, tokens);

    // Redirect back to tasks page with success message
    return NextResponse.redirect(
      new URL('/tasks?connected=true', request.url)
    );

  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    return NextResponse.redirect(
      new URL('/tasks?error=callback_failed', request.url)
    );
  }
}

