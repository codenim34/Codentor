"use server";

import Roadmap from "../models/roadmapModel";
import User from "../models/userModel";
import { connect } from "../mongodb/mongoose";
const Groq = require("groq-sdk");
const axios = require('axios');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Function to get a random API key
const getRandomApiKey = () => {
  const apiKeys = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY.split(',');
  const randomIndex = Math.floor(Math.random() * apiKeys.length);
  return apiKeys[randomIndex];
};

// Try an API request with multiple keys until success or all keys exhausted
const tryWithMultipleKeys = async (apiCall) => {
  const apiKeys = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY.split(',');
  const errors = [];

  // Try each API key
  for (const key of apiKeys) {
    try {
      const result = await apiCall(key);
      return result; // Return on first success
    } catch (error) {
      errors.push(`Key ${key.slice(0, 8)}...: ${error.message}`);
      continue; // Try next key if available
    }
  }
  
  // If we get here, all keys failed
  console.error('All API keys failed:', errors);
  return null;
};

const searchYouTubeVideo = async (topic) => {
  try {
    // First, search for videos with retry logic
    const searchResponse = await tryWithMultipleKeys(async (key) => {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
        params: {
          part: "id",
          maxResults: 2, // Reduced to 2: one primary option and one backup
          order: "relevance",
          q: topic,
          type: "video",
          videoDuration: "long",
          key: key,
        },
      });
      return response;
    });

    if (!searchResponse?.data?.items?.length) return null;

    // Get all video IDs
    const videoIds = searchResponse.data.items.map(item => item.id.videoId);

    // Get details for all videos with retry logic
    const detailsResponse = await tryWithMultipleKeys(async (key) => {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
        params: {
          part: "contentDetails,snippet",
          id: videoIds.join(','),
          key: key,
        },
      });
      return response;
    });

    if (!detailsResponse?.data?.items?.length) return null;

    // Find the first video that meets our duration criteria
    for (const video of detailsResponse.data.items) {
      const duration = video.contentDetails.duration;
      const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
      const hours = (match[1] ? parseInt(match[1]) : 0);
      const minutes = (match[2] ? parseInt(match[2]) : 0);
      const seconds = (match[3] ? parseInt(match[3]) : 0);
      
      const totalMinutes = hours * 60 + minutes + seconds / 60;

      if (totalMinutes >= 10) {
        return {
          videoId: video.id,
          duration: duration,
          title: video.snippet.title,
          description: video.snippet.description
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error searching YouTube video:", error);
    return null;
  }
};

const generateRoadmap = async (prompt) => {
  try {
    // Check if the prompt is related to CS/IT
    const validationResponse = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a validator that checks if a query is related to computer science, programming, or IT. Respond with only 'true' if it is related, or 'false' if it's not. Be strict in validation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      max_tokens: 10,
    });

    const isValidTopic = validationResponse.choices[0].message.content.toLowerCase().includes('true');
    
    if (!isValidTopic) {
      throw new Error("INVALID_TOPIC");
    }

    console.log("Generating roadmap...");
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a JSON-only response generator. Create a detailed computer science/IT learning roadmap in VALID JSON format. 
          
CRITICAL RULES:
1. Return ONLY valid JSON, no markdown, no explanations, no code blocks
2. Use double quotes for all strings, never single quotes
3. No trailing commas
4. Break down the learning path into at least 5 steps
5. Each step must have: step (number), topic (string), description (string), documentation (string - a real URL)

Required JSON structure:
{
  "steps": [
    {
      "step": 1,
      "topic": "Topic name",
      "description": "What to learn",
      "documentation": "https://example.com/docs"
    }
  ]
}`
        },
        {
          role: "user",
          content: `Generate a learning roadmap for: ${prompt}`
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.5,
      max_tokens: 2048,
      top_p: 1,
      stream: false,
      stop: null
    });

    let roadmapContent = chatCompletion.choices[0].message.content;
    console.log("Raw response:", roadmapContent);
    
    // Parse the content with multiple cleanup strategies
    let parsedContent;
    
    // Strategy 1: Try direct parsing first
    try {
        parsedContent = JSON.parse(roadmapContent);
    } catch (firstError) {
        console.log("Direct parsing failed, trying cleanup...");
        
        // Strategy 2: Clean up markdown and common issues
        let cleanedContent = roadmapContent
            // Remove markdown code blocks
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/g, '')
            // Trim whitespace
            .trim();
        
        // Strategy 3: Extract JSON object if wrapped in text
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            cleanedContent = jsonMatch[0];
        }
        
        try {
            parsedContent = JSON.parse(cleanedContent);
        } catch (secondError) {
            console.log("Cleanup parsing failed, trying quote replacement...");
            
            // Strategy 4: Try replacing single quotes (carefully)
            // Only replace single quotes that are not inside double quotes or part of contractions
            let finalContent = cleanedContent
                // Remove trailing commas
                .replace(/,(\s*[}\]])/g, '$1')
                // Replace single quotes around keys and values (but not in content)
                .replace(/'([^']*?)':/g, '"$1":')
                .replace(/:\s*'([^']*?)'/g, ': "$1"');
            
            try {
                parsedContent = JSON.parse(finalContent);
            } catch (thirdError) {
                console.error("All parsing strategies failed");
                console.error("Original error:", firstError.message);
                console.error("Cleaned content:", cleanedContent);
                console.error("Final content:", finalContent);
                
                // Return a fallback structure
                throw new Error(`Failed to parse roadmap: ${firstError.message}. Please try again.`);
            }
        }
    }
    
    // Validate the parsed content has the expected structure
    if (!parsedContent.steps || !Array.isArray(parsedContent.steps) || parsedContent.steps.length === 0) {
        console.error("Invalid roadmap structure:", parsedContent);
        throw new Error("Generated roadmap has invalid structure. Please try again.");
    }
    
    // Add video IDs and durations for each step
    for (const step of parsedContent.steps) {
      const searchQuery = `${step.topic} programming tutorial`;
      const videoInfo = await searchYouTubeVideo(searchQuery);
      if (videoInfo) {
        step.videoId = videoInfo.videoId;
        step.videoDuration = videoInfo.duration;
        step.videoTitle = videoInfo.title;
        step.videoDescription = videoInfo.description;
      }
    }
    
    console.log("Roadmap Generated Successfully with videos");
    return parsedContent;
  } catch (error) {
    console.error("Error generating roadmap:", error);
    throw error;
  }
};

export const createRoadmap = async (title, prompt, author) => {
  try {
    await connect();
    const user = await User.findOne({ clerkId: author });
    if (!user) throw new Error("User not found");

    const content = await generateRoadmap(prompt);
    
    const roadmap = await Roadmap.create({
      title,
      prompt,
      content,
      author: user.userName,
    });

    return roadmap.toObject();
  } catch (error) {
    console.error("Error creating roadmap:", error);
    // Preserve the original error message
    if (error.message === "INVALID_TOPIC") {
      throw new Error("INVALID_TOPIC");
    }
    throw error;
  }
};

export const getUserRoadmaps = async (author) => {
  try {
    await connect();
    const user = await User.findOne({ clerkId: author });
    if (!user) throw new Error("User not found");

    const roadmaps = await Roadmap.find({ author: user.userName }).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(roadmaps)); // Convert to plain object
  } catch (error) {
    console.error("Error fetching roadmaps:", error);
    throw error;
  }
};

export const getRoadmapById = async (id) => {
  try {
    await connect();
    const roadmap = await Roadmap.findById(id);
    if (!roadmap) return null;
    return JSON.parse(JSON.stringify(roadmap)); // Convert to plain object
  } catch (error) {
    console.error("Error getting roadmap:", error);
    throw error;
  }
};
