# AI Assistant Setup Guide

## Overview
The AI Assistant is a powerful Gemini-powered coding companion integrated into the CodeLab feature. It provides real-time coding help with voice support and agentic code modification capabilities.

## Features

### 1. **Intelligent Code Assistance**
- Context-aware help based on your current code
- Answers coding questions
- Provides debugging assistance
- Suggests best practices and optimizations

### 2. **Voice Support**
- **Speech-to-Text**: Click the microphone button to speak your questions
- **Text-to-Speech**: AI responses can be read aloud (toggle with speaker icon)
- Automatic voice recognition with visual feedback

### 3. **Agentic Code Modification**
- AI can autonomously suggest code changes
- Review and approve AI modifications with one click
- Changes are automatically synced with all collaborators
- Safe approval workflow before applying changes

### 4. **Real-time Collaboration**
- AI-generated code updates are broadcast to all session participants
- Seamless integration with existing collaboration features

## Environment Setup

### Required Environment Variable

Add the following to your `.env.local` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### Getting Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the generated API key
5. Add it to your `.env.local` file

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```
   This will install the `@google/generative-ai` package automatically.

2. **Set Up Environment Variable**
   Create or update `.env.local`:
   ```env
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## Usage Guide

### Opening the AI Assistant

1. Navigate to any CodeLab session (`/codelab/[roomCode]`)
2. Look for the green floating button in the bottom-right corner
3. Click the button to open the AI Assistant panel

### Chat Interface

- **Text Input**: Type your question in the text area
- **Voice Input**: Click the microphone icon and speak
- **Send**: Press Enter or click the send button
- **Voice Output**: Toggle the speaker icon to enable/disable voice responses

### Example Prompts

#### Basic Help
```
"How do I iterate through an array in Python?"
"What's wrong with my for loop?"
"Explain this code to me"
```

#### Code Improvements
```
"Can you optimize this function?"
"Make this code more readable"
"Add error handling to my code"
```

#### Agentic Modifications
```
"Fix the bug in my code"
"Refactor this to use async/await"
"Convert this to use ES6 syntax"
```

### Approving Code Changes

When the AI suggests code modifications:

1. A toast notification appears with the suggested change
2. Review the AI's explanation
3. Click **"Apply"** to accept the changes
4. Click **"Dismiss"** to ignore the suggestion
5. Applied changes are immediately reflected in the editor

### Voice Commands

1. Click the microphone button
2. Wait for the "Listening..." toast
3. Speak your question clearly
4. The AI will process and respond

### Interface Controls

- **Minimize/Maximize**: Click the window icons in the header
- **Close**: Click the X button to hide the assistant
- **Voice Toggle**: Enable/disable text-to-speech responses
- **Stop Speaking**: Click to interrupt ongoing voice playback

## Technical Details

### Architecture

```
User Input (Text/Voice)
    ↓
AI Assistant Component (React)
    ↓
API Route (/api/ai-assistant)
    ↓
Google Gemini AI (gemini-1.5-flash)
    ↓
Response Processing
    ↓
Code Update (if applicable) + Voice Output
```

### Code Context

The AI automatically receives:
- Current code in the editor
- Programming language being used
- Full conversation history
- Previous responses for context

### Safety Features

1. **Code Change Approval**: All AI code modifications require user approval
2. **Coding-Only Focus**: AI redirects non-coding questions
3. **Error Handling**: Graceful fallbacks for API failures
4. **Sync Safety**: Code changes are validated before broadcasting

### Browser Compatibility

- **Voice Input**: Requires Chrome/Edge (Web Speech API)
- **Voice Output**: Supported on all modern browsers
- **Fallback**: Text input works everywhere

## Troubleshooting

### "GEMINI_API_KEY is not configured"
**Solution**: Ensure your `.env.local` file contains the API key and restart the dev server.

### Voice Recognition Not Working
**Solution**: 
- Use Chrome or Edge browser
- Grant microphone permissions when prompted
- Check browser security settings

### AI Responses Are Slow
**Solution**: 
- This is normal for complex code analysis
- Consider breaking down large code blocks
- Check your internet connection

### Code Changes Not Applying
**Solution**:
- Ensure you clicked "Apply" on the toast notification
- Check browser console for errors
- Verify the editor is not in read-only mode

### Voice Output Not Working
**Solution**:
- Check that voice is enabled (speaker icon should be green)
- Verify browser audio settings
- Try clicking "Stop speaking" and asking again

## API Configuration

### Model Settings (Customizable in route.js)

```javascript
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash-latest",
  generationConfig: {
    temperature: 0.7,      // Creativity level (0-1)
    topP: 0.95,            // Nucleus sampling
    topK: 40,              // Token selection diversity
    maxOutputTokens: 2048, // Response length limit
  },
});
```

### Available Gemini Models

Current models you can use (as of 2025):
- **`gemini-1.5-flash-latest`** ⚡ (Currently used - Fast, efficient, great for coding)
- **`gemini-1.5-pro-latest`** 🚀 (More powerful, slower, better for complex tasks)
- **`gemini-2.0-flash-exp`** 🆕 (Experimental, cutting-edge features)

### Customization Options

You can modify these settings in `app/api/ai-assistant/route.js`:

- **Temperature**: Higher = more creative, lower = more focused
- **Max Tokens**: Increase for longer responses
- **Model**: Switch between the models above based on your needs
  - Flash models: Faster responses, lower cost
  - Pro models: Better reasoning, more detailed answers

## Best Practices

1. **Be Specific**: Include context in your questions
   - ❌ "Fix this"
   - ✅ "Fix the undefined variable error in the loop"

2. **Use Code Context**: The AI can see your code, reference it
   - "Why is this function throwing an error?"
   - "How can I make this more efficient?"

3. **Review AI Changes**: Always review suggested code before applying
   
4. **Iterate**: Have a conversation with the AI for complex problems

5. **Save Important Code**: Download or commit important versions before major AI modifications

## Security Considerations

- API key is server-side only (never exposed to client)
- Code is sent to Google's Gemini API (review Google's privacy policy)
- Local code is not permanently stored by the AI
- Consider sensitive code before using AI assistance

## Future Enhancements

Potential upcoming features:
- Multi-language voice support
- Code snippet library
- Learning from your coding style
- Integration with debugging tools
- Code explanation videos

## Support

For issues or questions:
1. Check this documentation
2. Review browser console for errors
3. Verify API key configuration
4. Test with simple prompts first

---

**Note**: This feature requires an active internet connection and valid Gemini API key. Keep your API key secure and never commit it to version control.

