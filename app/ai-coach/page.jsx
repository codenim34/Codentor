"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  Send, 
  Loader2, 
  Bot, 
  User, 
  Sparkles,
  TrendingUp,
  MessageCircle
} from "lucide-react";

export default function AICoach() {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      initializeChat();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = async () => {
    setIsInitializing(true);
    try {
      const response = await fetch('/api/ai-coach/initialize');
      if (response.ok) {
        const data = await response.json();
        setMessages([
          {
            role: 'assistant',
            content: data.welcomeMessage,
            timestamp: new Date().toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
      setMessages([
        {
          role: 'assistant',
          content: "Hello! I'm your AI Learning Coach. I'm here to help you improve your skills based on your progress in interviews, roadmaps, and learning activities. Ask me anything about your learning journey!",
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-coach/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversationHistory: messages
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString()
        }]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I apologize, but I'm having trouble processing your request right now. Please try again.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    {
      label: "How can I improve my interview scores?",
      icon: <TrendingUp className="w-4 h-4" />
    },
    {
      label: "What should I focus on next?",
      icon: <Sparkles className="w-4 h-4" />
    },
    {
      label: "Suggest a learning path for me",
      icon: <MessageCircle className="w-4 h-4" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-3 rounded-xl">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
              AI Learning Coach
            </h1>
          </div>
          <p className="text-gray-400 ml-14">
            Get personalized guidance based on your learning progress and interview performance
          </p>
        </div>

        {/* Chat Container */}
        <Card className="bg-gray-900/50 border border-emerald-800/30 p-6 mb-6 hover:border-emerald-500/50 hover:shadow-green-glow transition-all">
          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto mb-6 pr-2 space-y-4">
            {isInitializing ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex gap-3 max-w-[85%] ${
                        message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        message.role === 'user'
                          ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                          : 'bg-gradient-to-r from-emerald-900/50 to-gray-800/50 border border-emerald-500/30'
                      }`}>
                        {message.role === 'user' ? (
                          <User className="w-5 h-5 text-white" />
                        ) : (
                          <Bot className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div
                        className={`p-4 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                            : 'bg-gray-800/90 border border-emerald-800/30 text-gray-200'
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-2 ${
                          message.role === 'user' ? 'text-emerald-100' : 'text-gray-500'
                        }`}>
                          {new Date(message.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-3 max-w-[85%]">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-emerald-900/50 to-gray-800/50 border border-emerald-500/30 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="p-4 rounded-lg bg-gray-800/90 border border-emerald-800/30">
                        <div className="flex gap-2">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && !isLoading && (
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setInput(action.label);
                    }}
                    className="px-4 py-2 bg-black/40 border border-emerald-800/30 rounded-lg hover:border-emerald-500/50 hover:bg-emerald-950/30 transition-all text-sm text-gray-300 flex items-center gap-2"
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="flex gap-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your learning journey..."
              className="flex-1 bg-black/40 border-emerald-800/30 focus:border-emerald-500/50 text-white placeholder-gray-500 min-h-[50px] max-h-[150px]"
              rows={2}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:shadow-green-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="bg-gradient-to-br from-emerald-900/20 to-gray-900/30 border border-emerald-500/20 p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-400 mt-0.5" />
            <div>
              <p className="text-sm text-gray-300">
                <strong className="text-emerald-400">Tip:</strong> I have access to your interview scores, 
                roadmap progress, and learning history. Ask me specific questions about improving in areas 
                where you're struggling, or for recommendations on what to learn next!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

