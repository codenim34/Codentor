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

    const systemPrompt = `You are an AI coding assistant that helps developers with code.

📝 CURRENT CODE CONTEXT:
Language: ${language}
Code:
\`\`\`${language}
${currentCode || "// No code yet"}
\`\`\`

INSTRUCTIONS:
- Answer questions clearly and helpfully
- Explain concepts with examples when needed
- When showing code examples, use markdown code blocks
- Be conversational and educational
- If user asks for code changes, provide complete working code
- Always explain what you're doing

User Request: ${userMessage}

Remember: Be helpful, clear, and provide complete code examples when relevant.`;


    // Initialize the model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
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

    // Extract code from markdown code blocks
    let newCode = null;
    let codeChange = null;
    
    // Look for code blocks in the response (```language ... ```)
    const codeBlockRegex = new RegExp(`\`\`\`(?:${language}|javascript|typescript|python|java|cpp|c|go|rust|php|ruby)?\\s*([\\s\\S]*?)\`\`\``, 'gi');
    const codeMatches = text.match(codeBlockRegex);
    
    if (codeMatches && codeMatches.length > 0) {
      // Get the last code block (most likely the complete code)
      const lastCodeBlock = codeMatches[codeMatches.length - 1];
      // Extract code content
      newCode = lastCodeBlock.replace(/```[\w]*\s*/, '').replace(/```\s*$/, '').trim();
      
      if (newCode) {
        codeChange = "AI generated code example";
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

