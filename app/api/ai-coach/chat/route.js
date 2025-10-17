import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connect } from "@/lib/mongodb/mongoose";
import InterviewSession from "@/lib/models/interviewSessionModel";
import User from "@/lib/models/userModel";
import Groq from "groq-sdk";
import { getUserRoadmaps } from "@/lib/actions/roadmap";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request) {
  try {
    console.log("AI Coach Chat: Starting...");
    const { userId } = await auth();
    console.log("AI Coach Chat: User ID:", userId);

    if (!userId) {
      console.log("AI Coach Chat: No user ID found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, conversationHistory } = await request.json();
    console.log("AI Coach Chat: Message received:", message?.substring(0, 50) + "...");

    console.log("AI Coach Chat: Connecting to database...");
    await connect();

    // Fetch comprehensive user data
    console.log("AI Coach Chat: Fetching user data...");
    const user = await User.findOne({ clerkId: userId });
    console.log("AI Coach Chat: User found:", !!user);
    
    const interviews = await InterviewSession.find({ 
      userId: userId,
      status: 'ended'
    }).sort({ createdAt: -1 }).limit(10);
    console.log("AI Coach Chat: Interviews found:", interviews.length);

    const roadmaps = await getUserRoadmaps(userId);
    console.log("AI Coach Chat: Roadmaps found:", roadmaps?.length || 0);

    // Calculate detailed stats
    const totalInterviews = interviews.length;
    const averageScore = totalInterviews > 0 
      ? Math.round(interviews.reduce((sum, int) => sum + (int.aiSummary?.score || 0), 0) / totalInterviews)
      : 0;

    // Collect all strengths and weaknesses
    const allStrengths = [];
    const allWeaknesses = [];
    interviews.forEach(interview => {
      if (interview.aiSummary?.strengths) {
        allStrengths.push(...interview.aiSummary.strengths);
      }
      if (interview.aiSummary?.weaknesses) {
        allWeaknesses.push(...interview.aiSummary.weaknesses);
      }
    });

    // Get recent interview details
    const recentInterviews = interviews.slice(0, 3).map(int => {
      const [role, level] = int.role.split(':');
      return {
        role: role || int.role,
        level: level || 'mid',
        score: int.aiSummary?.score || 0,
        date: int.createdAt
      };
    });

    // Calculate roadmap progress
    const totalRoadmaps = roadmaps?.length || 0;
    let averageRoadmapProgress = 0;
    if (totalRoadmaps > 0) {
      let totalProgress = 0;
      roadmaps.forEach(roadmap => {
        // For server-side, we can't access localStorage, so we'll use a default progress
        if (roadmap.content?.steps?.length) {
          totalProgress += 50; // Default 50% progress for roadmaps
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

    console.log("AI Coach Chat: Calling Groq API...");
    console.log("GROQ_API_KEY exists:", !!process.env.GROQ_API_KEY);
    
    let completion;
    try {
      completion = await groq.chat.completions.create({
        messages: messages,
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 800,
      });
    } catch (modelError) {
      console.log("Primary model failed, trying fallback...");
      completion = await groq.chat.completions.create({
        messages: messages,
        model: "llama-3.1-70b-versatile",
        temperature: 0.7,
        max_tokens: 800,
      });
    }
    console.log("AI Coach Chat: Groq response received");

    const response = completion.choices[0]?.message?.content || 
      "I apologize, but I'm having trouble generating a response right now. Please try rephrasing your question.";

    console.log("AI Coach Chat: Returning response");
    return NextResponse.json({
      success: true,
      response: response
    });
  } catch (error) {
    console.error("Error in AI coach chat:", error);
    
    // Provide a more helpful fallback response
    const fallbackResponse = `I apologize, but I'm having trouble processing your request right now. This could be due to a temporary issue with the AI service. 

Here are some things you can try:
- Check your internet connection
- Try asking a simpler question
- Wait a moment and try again

If the problem persists, please let me know what you were trying to ask about, and I'll do my best to help!`;

    return NextResponse.json(
      { 
        success: true,
        response: fallbackResponse
      },
      { status: 200 }
    );
  }
}

