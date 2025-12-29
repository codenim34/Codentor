import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connect } from "@/lib/mongodb/mongoose";
import Task from "@/lib/models/taskModel";

// Force dynamic rendering for this route
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connect();

    const tasks = await Task.find({ userId });
    const total = tasks.length;
    const completed = tasks.filter(
      (task) => task.status === "completed"
    ).length;

    return NextResponse.json({
      success: true,
      total,
      completed,
      pending: total - completed,
    });
  } catch (error) {
    console.error("Error fetching task stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch task statistics" },
      { status: 500 }
    );
  }
}
