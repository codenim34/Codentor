import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connect } from "@/lib/mongodb/mongoose";
import InterviewSession from "@/lib/models/interviewSessionModel";
const Groq = require("groq-sdk");

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function GET(request) {
  try {
    await connect();
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch user's recent interview sessions
    const interviewSessions = await InterviewSession.find({
      userId,
      status: "ended",
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // Fetch task statistics
    const tasksResponse = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/tasks/stats`
    );
    const tasksData = tasksResponse.ok
      ? await tasksResponse.json()
      : { total: 0, completed: 0 };

    // Build activity context for AI
    const interviewSummary = interviewSessions.map((s) => {
      const [role, level] = s.role.split(":");
      return {
        role,
        level,
        score: s.aiSummary?.score || 0,
        strengths: s.aiSummary?.strengths || [],
        weaknesses: s.aiSummary?.weaknesses || [],
      };
    });

    const averageScore =
      interviewSessions.length > 0
        ? Math.round(
            interviewSessions.reduce(
              (sum, s) => sum + (s.aiSummary?.score || 0),
              0
            ) / interviewSessions.length
          )
        : 0;

    const allWeaknesses = interviewSessions.flatMap(
      (s) => s.aiSummary?.weaknesses || []
    );
    const allStrengths = interviewSessions.flatMap(
      (s) => s.aiSummary?.strengths || []
    );

    // Generate AI suggestions
    const prompt = `You are a career development AI assistant analyzing a developer's learning progress.

USER ACTIVITY SUMMARY:
- Total Interviews Completed: ${interviewSessions.length}
- Average Interview Score: ${averageScore}/100
- Task Completion Rate: ${
      tasksData.total > 0
        ? Math.round((tasksData.completed / tasksData.total) * 100)
        : 0
    }% (${tasksData.completed}/${tasksData.total} tasks)
- Top Strengths: ${allStrengths.slice(0, 3).join(", ") || "Not enough data"}
- Areas for Improvement: ${
      allWeaknesses.slice(0, 3).join(", ") || "Not enough data"
    }

Recent Interview Performance:
${interviewSummary
  .map((s) => `- ${s.level} ${s.role}: Score ${s.score}/100`)
  .join("\n")}

Based on this data, provide personalized suggestions in this EXACT JSON format:
{
  "suggestions": [
    {
      "title": "Suggestion title",
      "description": "Brief actionable advice",
      "priority": "high|medium|low",
      "category": "technical|communication|preparation"
    }
  ],
  "nextSteps": ["Next step 1", "Next step 2", "Next step 3"],
  "motivationalMessage": "A brief encouraging message"
}

Provide 3-5 actionable suggestions. Be specific and encouraging.`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    });

    const rawResponse = completion.choices[0]?.message?.content || "{}";
    let aiSuggestions;
    try {
      aiSuggestions = JSON.parse(rawResponse);
    } catch (e) {
      aiSuggestions = {
        suggestions: [
          {
            title: "Keep Practicing",
            description: "Continue taking interviews to improve your skills.",
            priority: "medium",
            category: "preparation",
          },
        ],
        nextSteps: [
          "Take more interviews",
          "Review your weaknesses",
          "Practice technical concepts",
        ],
        motivationalMessage:
          "You're on the right track! Keep learning and growing.",
      };
    }

    return NextResponse.json({
      success: true,
      data: aiSuggestions,
      context: {
        totalInterviews: interviewSessions.length,
        averageScore,
      },
    });
  } catch (error) {
    console.error("GET /api/dashboard/ai-suggestions error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate AI suggestions",
        data: {
          suggestions: [
            {
              title: "Start Your Journey",
              description:
                "Take your first AI interview to get personalized feedback!",
              priority: "high",
              category: "preparation",
            },
          ],
          nextSteps: [
            "Take an AI interview",
            "Explore learning roadmaps",
            "Practice coding",
          ],
          motivationalMessage:
            "Every expert was once a beginner. Start your journey today!",
        },
      },
      { status: 200 }
    );
  }
}
