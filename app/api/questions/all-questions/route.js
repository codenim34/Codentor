// app/api/questions/all-questions/route.js

import Question from "@/lib/models/questionModel";
import User from "@/lib/models/userModel";
import { connect } from "@/lib/mongodb/mongoose";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connect();
    const { userId } = auth();

    let ownedQuestions = [];
    let otherQuestions = [];

    if (userId) {
      // Fetch the user to get the userName
      const user = await User.findOne({ clerkId: userId });
      
      if (user) {
        const userName = user.userName;

        // Fetch questions authored by the user
        ownedQuestions = await Question.find({ author: userName })
          .lean()
          .sort({ createdAt: -1 });

        // Fetch questions not authored by the user
        otherQuestions = await Question.find({ author: { $ne: userName } })
          .lean()
          .sort({ createdAt: -1 });
      } else {
        // User authenticated but not in DB yet - return all questions as others
        otherQuestions = await Question.find({})
          .lean()
          .sort({ createdAt: -1 });
      }
    } else {
      // Unauthenticated users - return all questions as others
      otherQuestions = await Question.find({})
        .lean()
        .sort({ createdAt: -1 });
    }

    return NextResponse.json({
      owned: ownedQuestions,
      others: otherQuestions,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
