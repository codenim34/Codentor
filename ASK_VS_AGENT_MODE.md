# 🤔 Ask Mode vs 🤖 Agent Mode - User Guide

## 🎯 Quick Summary

Your AI Assistant now has **two distinct modes** like GitHub Copilot:

| Mode | Purpose | Behavior | When to Use |
|------|---------|----------|-------------|
| 🤔 **Ask Mode** | Questions & Learning | Explains and teaches | Learning concepts, understanding code |
| 🤖 **Agent Mode** | Autonomous Coding | Actively modifies code | Writing features, fixing bugs, refactoring |

---

## 🤔 Ask Mode (Default)

### What It Does:
- **Answers questions** about code and concepts
- **Explains** how things work
- **Teaches** best practices
- **Shows examples** without modifying your code
- **Educational** and conversational

### Perfect For:
- ✅ Learning new concepts
- ✅ Understanding existing code
- ✅ Getting explanations
- ✅ Code review and feedback
- ✅ Debugging help (without auto-fixing)
- ✅ Best practices advice

### Example Interactions:

```
You: "What is recursion?"
AI: "Recursion is when a function calls itself to solve a problem 
     by breaking it into smaller subproblems. Each call works on 
     a simpler version until reaching a base case that stops the 
     recursion. Common examples include factorial calculations and 
     tree traversals."
```

```
You: "How does async/await work?"
AI: "async/await is syntactic sugar for Promises in JavaScript...
     [detailed explanation with examples]"
```

```
You: "Is my authentication logic secure?"
AI: "Looking at your code, here are some security considerations:
     1. Password hashing looks good
     2. Consider adding rate limiting
     3. JWT secret should be in environment variables
     [detailed security analysis]"
```

### Key Features:
- 📚 Detailed explanations
- 💡 Code examples shown in chat (not applied)
- 🎓 Educational focus
- 🔍 Analysis without modification
- ❌ Does NOT auto-modify your code

---

## 🤖 Agent Mode (Like Copilot)

### What It Does:
- **Actively writes** and modifies code
- **Autonomously implements** features
- **Fixes bugs** automatically
- **Refactors** code for you
- **Generates** complete solutions
- **Proactive** problem-solving

### Perfect For:
- ✅ Writing new features
- ✅ Fixing bugs quickly
- ✅ Refactoring code
- ✅ Adding functionality
- ✅ Optimizing performance
- ✅ Implementing changes

### Example Interactions:

```
You: "Add error handling to this function"
AI: "I'll add try-catch blocks and proper error handling.

[Shows formatted code in chat]

┌─────────────────────────────────┐
│ Generated Code                  │
│ [Apply to Editor]               │
├─────────────────────────────────┤
│ function getData() {            │
│   try {                         │
│     // your code                │
│   } catch (error) {             │
│     console.error(error);       │
│     return null;                │
│   }                             │
│ }                               │
└─────────────────────────────────┘

[Click "Apply to Editor" to apply]
```

```
You: "Create a login form component"
AI: "I'll create a React login form with validation.

[Complete component code shown]
[Apply to Editor button]
```

```
You: "Optimize this loop"
AI: "I'll convert your loop to use map() for better performance.

[Optimized code shown]
[Apply to Editor button]
```

### Key Features:
- 🤖 Autonomous code generation
- ✨ Complete, working code
- 📦 Formatted code preview in chat
- 🔘 **"Apply to Editor"** button for each code block
- ⚡ Fast implementation
- 🎯 Action-oriented

---

## 🔄 How to Switch Modes

### Visual Indicator:
```
┌─────────────────────────────────┐
│ AI Assistant  🤔 Ask Mode       │  ← Blue badge (Ask Mode)
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ AI Assistant  🤖 Agent Mode     │  ← Green badge (Agent Mode)
└─────────────────────────────────┘
```

### Toggle Button:
Click the mode button in the header:
- **🤔 Ask** → Click to switch to Agent
- **🤖 Agent** → Click to switch to Ask

### Default:
- Starts in **Ask Mode** for safety
- Switch to Agent Mode when you need code changes

---

## 📋 Side-by-Side Comparison

### Scenario: "How do I sort an array?"

#### In Ask Mode 🤔:
```
User: "How do I sort an array in JavaScript?"

AI Response:
"JavaScript arrays have a built-in sort() method. Here's how it works:

Basic sorting:
const numbers = [3, 1, 4, 1, 5];
numbers.sort(); // modifies in place

For numbers, use a compare function:
numbers.sort((a, b) => a - b); // ascending
numbers.sort((a, b) => b - a); // descending

The compare function returns:
- Negative: a comes first
- Zero: order unchanged  
- Positive: b comes first"

[No code applied to editor]
```

#### In Agent Mode 🤖:
```
User: "Sort this array"

AI Response:
"I'll sort your array in ascending order.

┌─────────────────────────────────┐
│ Generated Code                  │
│ [Apply to Editor]               │
├─────────────────────────────────┤
│ const numbers = [3, 1, 4, 1, 5];│
│ const sorted = numbers.sort(    │
│   (a, b) => a - b               │
│ );                              │
│ console.log(sorted);            │
└─────────────────────────────────┘

[Click button to apply to your editor]
```

---

## 🎨 Code Display Features

### Formatted Code Block:
When Agent generates code, you'll see:

```
┌──────────────────────────────────────┐
│ 📟 Generated Code                    │
│           [Apply to Editor] ←----- Button
├──────────────────────────────────────┤
│ // Your complete, formatted code    │
│ function example() {                │
│   return "Hello World";             │
│ }                                   │
│                                     │
│ // With proper syntax highlighting │
│ // Ready to apply!                  │
└──────────────────────────────────────┘
```

### Features:
- ✅ **Syntax highlighted** (in actual UI)
- ✅ **Scrollable** for long code
- ✅ **Copyable** (can copy if not applying)
- ✅ **One-click apply** with button
- ✅ **Complete code** (not snippets)

---

## 🎯 Best Practices

### Use Ask Mode When:
1. 🎓 **Learning**: "Explain how closures work"
2. 🔍 **Reviewing**: "Is this code efficient?"
3. 🤔 **Deciding**: "Should I use Redux or Context?"
4. 📖 **Understanding**: "What does this error mean?"
5. 💡 **Exploring**: "What are alternatives to this approach?"

### Use Agent Mode When:
1. ✍️ **Writing**: "Create a user authentication function"
2. 🔧 **Fixing**: "Fix this bug with the login form"
3. 🎨 **Refactoring**: "Refactor this to use async/await"
4. ⚡ **Optimizing**: "Make this code more efficient"
5. ➕ **Adding**: "Add validation to this form"

### Pro Tips:
1. **Start in Ask Mode** to understand, then **switch to Agent Mode** to implement
2. **Review code** before clicking "Apply to Editor"
3. **Use descriptive prompts** in Agent Mode for better code
4. **Ask follow-ups** in Ask Mode to learn why the Agent did something

---

## 🔥 Example Workflows

### Workflow 1: Learning → Implementing

```
Step 1: [Ask Mode 🤔]
You: "How do I implement debouncing in React?"
AI: [Explains concept with examples]

Step 2: [Switch to Agent Mode 🤖]
You: "Implement debouncing for my search input"
AI: [Generates complete debounced search component]
You: [Click Apply to Editor]
```

### Workflow 2: Debug → Fix

```
Step 1: [Ask Mode 🤔]
You: "Why is my useEffect running infinitely?"
AI: [Analyzes and explains the dependency issue]

Step 2: [Switch to Agent Mode 🤖]
You: "Fix the useEffect dependency issue"
AI: [Shows corrected code with proper dependencies]
You: [Click Apply to Editor]
```

### Workflow 3: Review → Improve

```
Step 1: [Ask Mode 🤔]
You: "Can you review this authentication code?"
AI: [Provides detailed security review]

Step 2: [Agent Mode 🤖]
You: "Implement the security improvements you suggested"
AI: [Generates improved, secure code]
You: [Click Apply to Editor]
```

---

## ⚙️ Technical Details

### How It Works:

#### Ask Mode:
```javascript
// Backend prompt
"You are in QUESTION-ANSWERING mode:
- Explain concepts clearly
- Provide examples
- DO NOT modify code automatically
- Focus on teaching"

// Result: Educational response, no code modification
```

#### Agent Mode:
```javascript
// Backend prompt  
"You are in AUTONOMOUS mode (like GitHub Copilot):
- ACTIVELY modify and generate code
- Provide COMPLETE, working code
- Format in markdown code blocks
- Be proactive with changes"

// Result: Complete code in formatted block with Apply button
```

### Code Extraction:
```javascript
// AI returns markdown code blocks:
```language
[your code here]
```

// Backend extracts code from markdown
// Frontend displays in formatted box
// Apply button updates editor with extracted code
```

---

## 🚀 Quick Reference Card

```
┌─────────────────────────────────────────────┐
│         🤔 ASK MODE                         │
├─────────────────────────────────────────────┤
│ Purpose:    Learn & Understand              │
│ Output:     Explanations + Examples         │
│ Action:     None (passive)                  │
│ Use For:    Questions, learning, reviews    │
│ Badge:      Blue                            │
│ Button:     🤔 Ask                          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│         🤖 AGENT MODE                       │
├─────────────────────────────────────────────┤
│ Purpose:    Build & Modify                  │
│ Output:     Complete working code           │
│ Action:     Autonomous (active)             │
│ Use For:    Implementation, fixes, features │
│ Badge:      Green                           │
│ Button:     🤖 Agent                        │
└─────────────────────────────────────────────┘
```

---

## 🎓 FAQ

### Q: Which mode should I start with?
**A:** Always start with **Ask Mode** (default). It's safer and helps you understand before making changes.

### Q: Can I switch modes mid-conversation?
**A:** Yes! Switch anytime. Your conversation history is preserved.

### Q: Will Ask Mode ever modify my code?
**A:** No. Ask Mode only explains and shows examples. It never touches your editor code.

### Q: Will Agent Mode always modify code?
**A:** Only when you ask it to write, fix, or change something. If you ask a question in Agent Mode, it will still answer like Ask Mode.

### Q: How do I see the code before applying it?
**A:** The code is displayed in a formatted block in the chat. Review it, then click "Apply to Editor" if you want to use it.

### Q: Can I copy code without applying?
**A:** Yes! Just select and copy from the code block. The "Apply to Editor" button is optional.

### Q: What if I accidentally apply wrong code?
**A:** Use **Ctrl+Z** (Cmd+Z on Mac) to undo in the editor.

---

## ✨ Summary

- **🤔 Ask Mode** = Your Teacher (explains, doesn't modify)
- **🤖 Agent Mode** = Your Pair Programmer (writes code for you)

Both modes work together to help you code faster and learn better!

**Default**: Ask Mode for safety
**Switch**: Click the mode button anytime
**Apply**: Review code, then click "Apply to Editor"

Happy Coding! 🚀

