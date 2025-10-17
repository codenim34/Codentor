import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connect } from '@/lib/mongodb/mongoose';
import InterviewSession from '@/lib/models/interviewSessionModel';

export async function GET(request) {
  try {
    await connect();
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch all user's interview sessions
    const sessions = await InterviewSession.find({ userId }).sort({ createdAt: -1 });

    // Calculate statistics
    const completedSessions = sessions.filter(s => s.status === 'ended');
    const totalInterviews = completedSessions.length;
    
    const averageScore = totalInterviews > 0 
      ? Math.round(completedSessions.reduce((sum, s) => sum + (s.aiSummary?.score || 0), 0) / totalInterviews)
      : 0;

    const recentInterviews = completedSessions.slice(0, 5).map(session => {
      const [role, level] = session.role.split(':');
      return {
        id: session._id,
        role,
        level,
        score: session.aiSummary?.score || 0,
        date: session.endAt || session.createdAt,
        strengths: session.aiSummary?.strengths || [],
        weaknesses: session.aiSummary?.weaknesses || [],
        recommendations: session.aiSummary?.recommendations || [],
      };
    });

    // Get all interviews for history page
    const allInterviews = completedSessions.map(session => {
      const [role, level] = session.role.split(':');
      return {
        id: session._id,
        role,
        level,
        score: session.aiSummary?.score || 0,
        date: session.endAt || session.createdAt,
        strengths: session.aiSummary?.strengths || [],
        weaknesses: session.aiSummary?.weaknesses || [],
        recommendations: session.aiSummary?.recommendations || [],
      };
    });

    // Calculate score distribution
    const scoreRanges = {
      excellent: completedSessions.filter(s => (s.aiSummary?.score || 0) >= 81).length,
      good: completedSessions.filter(s => {
        const score = s.aiSummary?.score || 0;
        return score >= 61 && score < 81;
      }).length,
      fair: completedSessions.filter(s => {
        const score = s.aiSummary?.score || 0;
        return score >= 41 && score < 61;
      }).length,
      weak: completedSessions.filter(s => (s.aiSummary?.score || 0) < 41).length,
    };

    // Get most recent strengths and weaknesses
    const allStrengths = completedSessions.flatMap(s => s.aiSummary?.strengths || []);
    const allWeaknesses = completedSessions.flatMap(s => s.aiSummary?.weaknesses || []);

    return NextResponse.json({
      success: true,
      stats: {
        totalInterviews,
        averageScore,
        recentInterviews,
        allInterviews,
        scoreRanges,
        topStrengths: allStrengths.slice(0, 5),
        topWeaknesses: allWeaknesses.slice(0, 5),
      }
    });
  } catch (error) {
    console.error('GET /api/interview/stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch interview stats' }, { status: 500 });
  }
}

