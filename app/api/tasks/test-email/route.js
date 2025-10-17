import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connect } from '@/lib/mongodb/mongoose';
import User from '@/lib/models/userModel';
const { sendTestEmail } = require('@/lib/utils/emailService');

export async function POST() {
  try {
    await connect();
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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
    const result = await sendTestEmail(user.email, user.firstName);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent to ${user.email}`,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message,
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send test email' },
      { status: 500 }
    );
  }
}

