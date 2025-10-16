import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { messages, currentCode, language } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    // Get the latest user message
    const userMessage = messages[messages.length - 1]?.content || "";

    // Create a context-aware prompt
    const systemPrompt = `You are an expert coding assistant helping developers write better code. 
You have access to the user's current code and can provide assistance.

Current Code Context:
Language: ${language}
Code:
\`\`\`${language}
${currentCode}
\`\`\`

Guidelines:
1. Provide clear, concise, and accurate coding help
2. Focus ONLY on coding-related questions and assistance
3. If asked about non-coding topics, politely redirect to coding topics
4. When suggesting code changes, be specific and explain why
5. You can offer to modify the code directly - if you want to make changes, include a JSON block at the end with this format:
   {
     "action": "code_change",
     "description": "Brief description of the change",
     "newCode": "The complete modified code"
   }
6. Only suggest code changes when explicitly asked or when it's clearly beneficial
7. Keep responses concise but informative
8. Use markdown formatting for better readability

User Question: ${userMessage}`;

    // Initialize the model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    // Generate response
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    let text = response.text();

    // Check if AI wants to modify code
    let codeChange = null;
    let newCode = null;
    
    // Look for JSON action block
    const jsonMatch = text.match(/\{[\s\S]*"action":\s*"code_change"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const actionData = JSON.parse(jsonMatch[0]);
        if (actionData.action === "code_change" && actionData.newCode) {
          codeChange = actionData.description || "AI suggested code modification";
          newCode = actionData.newCode;
          // Remove the JSON block from the displayed message
          text = text.replace(jsonMatch[0], '').trim();
        }
      } catch (e) {
        console.error('Error parsing action JSON:', e);
      }
    }

    return NextResponse.json({
      message: text,
      codeChange,
      newCode,
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    
    // Handle specific error cases
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { error: "Invalid API key. Please check your GEMINI_API_KEY." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process AI request. Please try again." },
      { status: 500 }
    );
  }
}

