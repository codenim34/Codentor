import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check email configuration
    const config = {
      configured: false,
      missing: [],
      hasHost: !!process.env.SMTP_HOST,
      hasUser: !!process.env.SMTP_USER,
      hasPass: !!process.env.SMTP_PASS,
      hasEmailFrom: !!process.env.EMAIL_FROM,
      host: process.env.SMTP_HOST || 'NOT SET',
      port: process.env.SMTP_PORT || 'NOT SET',
      user: process.env.SMTP_USER || 'NOT SET',
      emailFrom: process.env.EMAIL_FROM || 'NOT SET',
    };

    if (!process.env.SMTP_HOST) config.missing.push('SMTP_HOST');
    if (!process.env.SMTP_USER) config.missing.push('SMTP_USER');
    if (!process.env.SMTP_PASS) config.missing.push('SMTP_PASS');
    if (!process.env.EMAIL_FROM) config.missing.push('EMAIL_FROM');

    config.configured = config.missing.length === 0;

    return NextResponse.json({
      success: true,
      config,
      message: config.configured 
        ? 'Email is configured!' 
        : `Missing: ${config.missing.join(', ')}`,
    });

  } catch (error) {
    console.error('Error checking email status:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

