import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const { userProblem } = await req.json();

    if (!userProblem) {
      return NextResponse.json(
        { error: 'Problem description is required' },
        { status: 400 }
      );
    }

    // Use Groq to extract search keywords from the user's problem
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a helpful coding assistant. Extract the most relevant search keywords from the user's coding problem. 
          Focus on: programming language, framework, library, error type, or specific technology mentioned.
          Return only 3-5 search keywords separated by spaces, optimized for finding YouTube tutorials.
          Be concise and specific. Example: "react hooks useEffect" or "python pandas dataframe error"`,
        },
        {
          role: 'user',
          content: userProblem,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.3,
      max_tokens: 50,
    });

    const searchKeywords = completion.choices[0]?.message?.content?.trim() || userProblem;

    return NextResponse.json({
      success: true,
      searchKeywords,
      originalProblem: userProblem,
    });
  } catch (error) {
    console.error('Error processing AI search:', error);
    return NextResponse.json(
      { error: 'Failed to process your request' },
      { status: 500 }
    );
  }
}
