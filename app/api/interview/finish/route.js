import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { connect } from '@/lib/mongodb/mongoose';
import InterviewSession from '@/lib/models/interviewSessionModel';
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request) {
  try {
    await connect();
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await InterviewSession.findOne({ userId, status: 'active' });
    if (!session) return NextResponse.json({ error: 'No active session' }, { status: 404 });

    // Parse role info
    const [role, level] = session.role.split(':');

    // Build full conversation transcript for AI evaluation
    const transcript = session.messages.map(m => `${m.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${m.content}`).join('\n\n');

    // AI-powered evaluation using Groq
    const evaluationPrompt = `You are an expert technical hiring manager. Evaluate this ${level}-level ${role} interview transcript and provide a comprehensive assessment.

TRANSCRIPT:
${transcript}

Provide your evaluation in this EXACT JSON format (no markdown, no extra text):
{
  "score": <number 0-100>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}

Evaluate based on:
- Technical depth and accuracy
- Communication clarity
- Problem-solving approach
- Practical experience demonstrated
- Completeness of answers

Be honest but constructive. Score: 0-40 (weak), 41-60 (fair), 61-80 (good), 81-100 (excellent).`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'user', content: evaluationPrompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 800,
      response_format: { type: "json_object" },
    });

    const rawResponse = completion.choices[0]?.message?.content || '{}';
    let summary;
    try {
      summary = JSON.parse(rawResponse);
    } catch (e) {
      // Fallback if JSON parsing fails
      summary = {
        score: 65,
        strengths: ["Participated in the interview", "Provided responses"],
        weaknesses: ["Could provide more detail"],
        recommendations: ["Practice technical interviews", "Review core concepts"],
      };
    }

    session.aiSummary = summary;
    session.status = 'ended';
    session.endAt = new Date();
    await session.save();

    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error('POST /api/interview/finish error:', error);
    return NextResponse.json({ error: 'Failed to finish interview' }, { status: 500 });
  }
}

