# 🚀 Quick Start Guide - Get Your AI Agent Running

## ⚡ 3-Minute Setup

### Step 1: Get Your API Key (2 minutes)

1. Go to **https://aistudio.google.com/app/apikey**
2. Sign in with Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy the key (starts with `AIza...`)

### Step 2: Create Environment File (30 seconds)

Create a file named `.env.local` in your project root:

**Location**: `E:\Projects\Codentor\.env.local`

**Contents**:
```env
GEMINI_API_KEY=AIza...your_actual_key_here
```

### Step 3: Restart Development Server (30 seconds)

```bash
# Stop current server (Ctrl + C if running)

# Start server
npm run dev
```

### Step 4: Test Your AI Agent! ✨

1. Open **http://localhost:3000**
2. Go to **Codelab** page
3. Click the **AI Agent** button (floating sparkle icon)
4. Try asking: "Write a hello world function in JavaScript"

---

## ✅ Verification Checklist

### 1. Check 404 Errors Fixed
- [ ] Can access homepage (/)
- [ ] Can access dashboard (/dashboard)
- [ ] Can access codelab (/codelab)
- [ ] Can access learn (/learn)

### 2. Check AI Agent Features
- [ ] Agent opens when clicking sparkle button
- [ ] Default mode shows "Concise" badge
- [ ] Speaker icon is off (muted) by default
- [ ] Can drag agent window around screen
- [ ] Agent responds to questions

### 3. Check Agent Capabilities
- [ ] Gets concise answers (2-3 sentences)
- [ ] Can toggle to Detailed mode (📝 → 📚)
- [ ] Can enable voice output (click speaker)
- [ ] Shows code change notifications with Apply button

---

## 🎮 Try These Commands

### Test Concise Mode (Default)
```
You: "What is recursion?"
Agent: "Recursion is when a function calls itself to solve 
smaller instances of a problem until reaching a base case."
```

### Test Detailed Mode
```
[Click 📝 button to switch to 📚]
You: "What is recursion?"
Agent: [Long detailed explanation with examples, use cases, 
pros/cons, and best practices]
```

### Test Code Modification
```
You: "Write a function to reverse a string"
Agent: [Provides code]

You: "Add error handling to it"
Agent: [Shows toast notification]
       "AI wants to update your code"
       [Apply] button appears
       
[Click Apply]
Agent: "Applied! Added null/undefined checks."
```

### Test Dragging
```
1. Hover over "AI Agent" header
2. Cursor changes to grab hand (👋)
3. Click and drag anywhere
4. Release to drop
```

---

## 🔧 Troubleshooting

### Problem: Still getting 404 errors
**Solution**: 
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

### Problem: "GEMINI_API_KEY is not configured"
**Solution**:
1. Verify `.env.local` exists in project root
2. Check key starts with `AIza`
3. Restart dev server after creating file
4. Check for typos in filename (must be `.env.local`, not `.env.txt`)

### Problem: Agent not responding
**Check**:
1. Browser console for errors (F12)
2. Terminal for API errors
3. API key is valid (not expired)
4. Internet connection (API needs to reach Google)

### Problem: Can't drag the agent
**Check**:
1. Clicking on the header (top bar with "AI Agent")
2. Not clicking buttons (they have their own actions)
3. Browser supports drag (works in Chrome, Firefox, Edge)

### Problem: Voice not working
**For Output (Speaking)**:
1. Click speaker icon to enable (should show 🔊)
2. Check browser allows autoplay
3. System volume is up

**For Input (Listening)**:
1. Click microphone icon
2. Browser will ask for mic permission
3. Speak clearly
4. Click again to stop

---

## 📁 Project Structure

```
Codentor/
├── .env.local          ← CREATE THIS! (API keys)
├── app/
│   ├── components/
│   │   └── playground/
│   │       └── AIAssistant.jsx   ← Frontend (UI)
│   └── api/
│       └── ai-assistant/
│           └── route.js          ← Backend (AI logic)
├── middleware.js        ← Auth & routing
└── package.json
```

---

## 🎯 What You Can Ask Your Agent

### Code Generation
- "Write a function to sort an array"
- "Create a React component for a login form"
- "Generate a REST API endpoint for user registration"

### Code Explanation
- "What does this code do?"
- "Explain how async/await works"
- "What's the difference between let and const?"

### Code Improvement
- "Optimize this function"
- "Refactor this to use modern JavaScript"
- "Add error handling"
- "Make this more readable"

### Debugging
- "Why am I getting this error?"
- "How do I fix this bug?"
- "What's wrong with my logic?"

### Best Practices
- "Is this approach good?"
- "What's the best way to do X?"
- "How can I improve code quality?"

---

## 🌟 Pro Tips

### 1. Use Concise for Speed
Default concise mode is perfect for:
- Quick questions
- Rapid iteration
- Familiar concepts
- Small changes

### 2. Switch to Detailed for Learning
Use detailed mode when:
- Learning new concepts
- Complex debugging
- Understanding architecture
- Best practices explanation

### 3. Voice for Multitasking
Enable voice when:
- Typing in another window
- Need hands-free coding
- Want to listen while reading code

### 4. Drag to Optimal Position
- Side-by-side with code editor
- Bottom corner when minimized
- Top for quick access
- Out of the way when not in use

### 5. Let Agent Modify Code
Trust the agent to:
- Fix syntax errors
- Add error handling
- Optimize algorithms
- Refactor for readability

BUT always review changes before applying!

---

## 📊 Feature Comparison

### Before vs After

| Feature | Before | After |
|---------|--------|-------|
| **Response Length** | Variable | Concise by default |
| **Voice Output** | Always on | Off by default |
| **Positioning** | Fixed | Draggable |
| **Code Changes** | Suggest only | Can apply directly |
| **Mode Toggle** | None | Concise/Detailed |
| **Name** | AI Assistant | AI Agent |

---

## 🎓 Learning Path

1. **Start Here**: Use concise mode, ask simple questions
2. **Experiment**: Try code generation, modification
3. **Learn**: Switch to detailed mode, understand concepts
4. **Master**: Let agent handle complex tasks autonomously
5. **Extend**: Read `AI_AGENT_GUIDE.md` to build your own

---

## 📞 Need Help?

### Resources:
1. **Full Guide**: `AI_AGENT_GUIDE.md` (comprehensive documentation)
2. **Summary**: `AI_AGENT_IMPLEMENTATION_SUMMARY.md` (what was changed)
3. **This File**: `QUICK_START.md` (you are here!)

### Common Issues:
- **404 Errors**: Fixed in middleware.js (restart server)
- **No API Key**: Create .env.local with GEMINI_API_KEY
- **Not Responding**: Check browser console (F12)
- **Can't Drag**: Click header, not buttons

### Test Everything:
```bash
# 1. Server running
npm run dev

# 2. No errors in terminal
# 3. No errors in browser console (F12)
# 4. API key in .env.local
# 5. AI Agent button visible in Codelab
```

---

## ✨ You're Ready!

Your AI Agent is now:
- ✅ Configured for concise responses by default
- ✅ Speaker off by default
- ✅ Draggable anywhere on screen
- ✅ Capable of autonomous code modifications
- ✅ Context-aware with full code access
- ✅ Ready to help you code faster!

**Next**: Just add your GEMINI_API_KEY and start coding! 🚀

---

## 🎉 Enjoy Your AI Agent!

Ask it anything, let it modify your code, drag it around, toggle modes, enable voice - it's your autonomous coding partner!

**Pro tip**: Ask the agent itself if you have questions about how it works! 😉

```
You: "How do I use you effectively?"
Agent: [Explains its own capabilities and best practices]
```

Happy Coding! 💻✨

