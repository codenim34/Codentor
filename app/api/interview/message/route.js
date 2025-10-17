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

    const body = await request.json();
    const userMessage = body.message || '';

    const session = await InterviewSession.findOne({ userId, status: 'active' });
    if (!session) return NextResponse.json({ error: 'No active session' }, { status: 404 });

    // Save user message
    session.messages.push({ role: 'user', content: userMessage });

    // Parse role info
    const [role, level, mode] = session.role.split(':');
    const questionCount = session.messages.filter(m => m.role === 'ai').length;

    // Build conversation history for context
    const conversationHistory = session.messages.slice(-10).map(m => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.content,
    }));

    // AI-generated response using Groq
    const systemPrompt = `You are an expert technical interviewer conducting a ${level}-level ${role} interview. 
Your role:
- Ask probing, role-specific technical questions
- Evaluate answers critically but fairly
- Follow up on vague or incomplete responses
- Progress from fundamentals to advanced topics naturally
- Keep questions concise and focused
- After ${questionCount > 8 ? 'about 5-6 questions' : 'several questions'}, you may conclude

Current progress: Question ${questionCount + 1}. ${questionCount > 6 ? 'Consider wrapping up soon.' : 'Continue with technical depth.'}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 300,
      top_p: 0.9,
    });

    const aiResponse = completion.choices[0]?.message?.content || "Could you elaborate on that?";
    session.messages.push({ role: 'ai', content: aiResponse });
    session.currentIndex++;
    await session.save();

    return NextResponse.json({ success: true, aiResponse });
  } catch (error) {
    console.error('POST /api/interview/message error:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}

