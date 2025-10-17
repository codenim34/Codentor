import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connect } from "@/lib/mongodb/mongoose";
import InterviewSession from "@/lib/models/interviewSessionModel";

export async function GET(request, { params }) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connect();

    const interview = await InterviewSession.findOne({
      _id: params.id,
      userId: userId,
    });

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    // Format the interview data to match expected structure
    const formattedInterview = {
      _id: interview._id,
      userId: interview.userId,
      role: interview.role.split(':')[0] || interview.role,
      level: interview.role.split(':')[1] || 'mid',
      mode: interview.mode,
      status: interview.status,
      createdAt: interview.createdAt,
      endAt: interview.endAt,
      messages: interview.messages,
      evaluation: {
        overallScore: interview.aiSummary?.score || 0,
        strengths: interview.aiSummary?.strengths || [],
        weaknesses: interview.aiSummary?.weaknesses || [],
        recommendations: interview.aiSummary?.recommendations || []
      }
    };

    return NextResponse.json({
      success: true,
      interview: formattedInterview,
    });
  } catch (error) {
    console.error("Error fetching interview details:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview details" },
      { status: 500 }
    );
  }
}

