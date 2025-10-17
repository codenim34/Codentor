import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connect } from '@/lib/mongodb/mongoose';
import InterviewSession from '@/lib/models/interviewSessionModel';

export async function POST(request) {
  try {
    await connect();
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const role = body.role || 'backend';
    const level = body.level || 'mid';
    const mode = body.mode || 'text';
    const durationMin = body.durationMin || 45;

    // Close any active sessions
    await InterviewSession.updateMany({ userId, status: 'active' }, { status: 'ended', endAt: new Date() });

    const session = await InterviewSession.create({
      userId,
      role: `${role}:${level}:${mode}`,
      durationMin,
      startAt: new Date(),
      status: 'active',
      currentIndex: 0,
      questions: [],
    });

    return NextResponse.json({ success: true, sessionId: session._id });
  } catch (error) {
    console.error('POST /api/interview/start error:', error);
    return NextResponse.json({ error: 'Failed to start interview' }, { status: 500 });
  }
}


