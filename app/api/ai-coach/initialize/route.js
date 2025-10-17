import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connect } from "@/lib/mongodb/mongoose";
import InterviewSession from "@/lib/models/interviewSessionModel";
import User from "@/lib/models/userModel";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function GET() {
  try {
    console.log("AI Coach Initialize: Starting...");
    const { userId } = await auth();
    console.log("AI Coach Initialize: User ID:", userId);

    if (!userId) {
      console.log("AI Coach Initialize: No user ID found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("AI Coach Initialize: Connecting to database...");
    await connect();

    // Fetch user data
    console.log("AI Coach Initialize: Fetching user data...");
    const user = await User.findOne({ clerkId: userId });
    console.log("AI Coach Initialize: User found:", !!user);
    
    const interviews = await InterviewSession.find({ 
      userId: userId,
      status: 'ended'
    }).sort({ createdAt: -1 }).limit(5);
    console.log("AI Coach Initialize: Interviews found:", interviews.length);

    // Calculate stats
    const totalInterviews = interviews.length;
    const averageScore = totalInterviews > 0 
      ? Math.round(interviews.reduce((sum, int) => sum + (int.aiSummary?.score || 0), 0) / totalInterviews)
      : 0;

    // Generate personalized welcome message
    const contextPrompt = `You are an AI Learning Coach for a coding platform. Generate a warm, personalized welcome message for a user.

User Stats:
- Total Interviews: ${totalInterviews}
- Average Score: ${averageScore}%
- User Name: ${user?.name || 'there'}

Generate a friendly, encouraging welcome message (2-3 sentences) that:
1. Greets the user warmly
2. Mentions their current progress if they have any
3. Offers to help them improve

Keep it concise and motivational.`;

    console.log("AI Coach Initialize: Calling Groq API...");
    console.log("GROQ_API_KEY exists:", !!process.env.GROQ_API_KEY);
    
    let completion;
    try {
      completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an enthusiastic AI Learning Coach who helps developers improve their skills. Be encouraging, specific, and actionable."
          },
          {
            role: "user",
            content: contextPrompt
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 200,
      });
    } catch (modelError) {
      console.log("Primary model failed, trying fallback...");
      completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an enthusiastic AI Learning Coach who helps developers improve their skills. Be encouraging, specific, and actionable."
          },
          {
            role: "user",
            content: contextPrompt
          }
        ],
        model: "llama-3.1-70b-versatile",
        temperature: 0.7,
        max_tokens: 200,
      });
    }
    console.log("AI Coach Initialize: Groq response received");

    const welcomeMessage = completion.choices[0]?.message?.content || 
      `Hello ${user?.name || 'there'}! 👋 I'm your AI Learning Coach. I'm here to help you improve your coding skills based on your interview performance and learning progress. What would you like to work on today?`;

    console.log("AI Coach Initialize: Returning response");
    return NextResponse.json({
      success: true,
      welcomeMessage,
      stats: {
        totalInterviews,
        averageScore
      }
    });
  } catch (error) {
    console.error("Error initializing AI coach:", error);
    return NextResponse.json(
      { 
        success: true,
        welcomeMessage: "Hello! 👋 I'm your AI Learning Coach. I'm here to help you improve your coding skills and guide your learning journey. How can I assist you today?"
      },
      { status: 200 }
    );
  }
}

