import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import dbConnect from "@/lib/mongodb/mongoose";
import InterviewSession from "@/lib/models/interviewSessionModel";
import User from "@/lib/models/userModel";
import Groq from "groq-sdk";
import { getUserRoadmaps } from "@/lib/actions/roadmap";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, conversationHistory } = await request.json();

    await dbConnect();

    // Fetch comprehensive user data
    const user = await User.findOne({ clerkId: userId });
    const interviews = await InterviewSession.find({ 
      userId: userId,
      status: 'ended'
    }).sort({ createdAt: -1 }).limit(10);

    const roadmaps = await getUserRoadmaps(userId);

    // Calculate detailed stats
    const totalInterviews = interviews.length;
    const averageScore = totalInterviews > 0 
      ? Math.round(interviews.reduce((sum, int) => sum + (int.evaluation?.overallScore || 0), 0) / totalInterviews)
      : 0;

    // Collect all strengths and weaknesses
    const allStrengths = [];
    const allWeaknesses = [];
    interviews.forEach(interview => {
      if (interview.evaluation?.strengths) {
        allStrengths.push(...interview.evaluation.strengths);
      }
      if (interview.evaluation?.weaknesses) {
        allWeaknesses.push(...interview.evaluation.weaknesses);
      }
    });

    // Get recent interview details
    const recentInterviews = interviews.slice(0, 3).map(int => ({
      role: int.role,
      level: int.level,
      score: int.evaluation?.overallScore || 0,
      date: int.createdAt
    }));

    // Calculate roadmap progress
    const totalRoadmaps = roadmaps?.length || 0;
    let averageRoadmapProgress = 0;
    if (totalRoadmaps > 0) {
      let totalProgress = 0;
      roadmaps.forEach(roadmap => {
        const saved = typeof window !== 'undefined' 
          ? localStorage.getItem(`roadmap-${roadmap._id}-progress`)
          : null;
        if (saved && roadmap.content?.steps?.length) {
          const completedSteps = new Set(JSON.parse(saved));
          totalProgress += (completedSteps.size / roadmap.content.steps.length) * 100;
        }
      });
      averageRoadmapProgress = Math.round(totalProgress / totalRoadmaps);
    }

    // Build context for AI
    const userContext = `
User Profile:
- Name: ${user?.name || 'User'}
- Total Interviews Completed: ${totalInterviews}
- Average Interview Score: ${averageScore}%
- Active Learning Paths: ${totalRoadmaps}
- Roadmap Progress: ${averageRoadmapProgress}%

Recent Interview Performance:
${recentInterviews.map((int, i) => 
  `${i + 1}. ${int.level} ${int.role} - Score: ${int.score}% (${new Date(int.date).toLocaleDateString()})`
).join('\n')}

Common Strengths Identified:
${allStrengths.slice(0, 5).map((s, i) => `${i + 1}. ${s}`).join('\n') || 'No data yet'}

Areas for Improvement:
${allWeaknesses.slice(0, 5).map((w, i) => `${i + 1}. ${w}`).join('\n') || 'No data yet'}

User's Question: ${message}

Instructions:
- Provide specific, actionable advice based on the user's actual data
- If asking about improvement, reference their weaknesses and suggest concrete steps
- If asking what to learn next, consider their strengths, weaknesses, and current progress
- Be encouraging but realistic
- Keep responses concise (3-5 paragraphs max)
- Use the user's actual performance data to give personalized recommendations
- If they don't have much data yet, encourage them to take more interviews or complete roadmaps
`;

    // Build conversation history for context
    const messages = [
      {
        role: "system",
        content: "You are an expert AI Learning Coach for a coding education platform. Your role is to provide personalized guidance based on user's interview performance, learning progress, and skill development. Be encouraging, specific, and actionable. Use emojis sparingly for emphasis."
      },
      ...conversationHistory.slice(-6).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      {
        role: "user",
        content: userContext
      }
    ];

    const completion = await groq.chat.completions.create({
      messages: messages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 800,
    });

    const response = completion.choices[0]?.message?.content || 
      "I apologize, but I'm having trouble generating a response right now. Please try rephrasing your question.";

    return NextResponse.json({
      success: true,
      response: response
    });
  } catch (error) {
    console.error("Error in AI coach chat:", error);
    return NextResponse.json(
      { 
        success: false,
        response: "I'm sorry, but I encountered an error processing your request. Please try again in a moment."
      },
      { status: 200 }
    );
  }
}

