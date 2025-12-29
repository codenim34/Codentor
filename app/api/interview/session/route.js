import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connect } from "@/lib/mongodb/mongoose";
import InterviewSession from "@/lib/models/interviewSessionModel";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await connect();
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const session = await InterviewSession.findOne({
      userId,
      status: "active",
    }).lean();
    if (!session) return NextResponse.json({ success: true, session: null });
    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error("GET /api/interview/session error:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
