"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageCircle, 
  Send, 
  Loader2, 
  Bot, 
  User, 
  Brain,
  Lightbulb,
  TrendingUp,
  Target
} from "lucide-react";
import { FaBrain, FaLightbulb, FaChartLine } from "react-icons/fa";

export default function AICoachSection({ user, interviewStats, aiSuggestions, loadingAI }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isExpanded && messages.length === 0) {
      initializeChat();
    }
  }, [isExpanded]);

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
        content: "I apologize, but I'm having trouble processing your request right now. This could be due to a temporary issue with the AI service. Please try again in a moment, or try asking a simpler question.",
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

  return (
    <Card className="bg-gray-900/50 border border-emerald-800/30 hover:border-emerald-500/50 hover:shadow-green-glow transition-all duration-300">
      {/* Header */}
      <div className="p-6 border-b border-emerald-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 p-3 rounded-full">
              <Brain className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">AI Learning Coach</h2>
              <p className="text-sm text-gray-400">Get personalized guidance for your learning journey</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-all border border-emerald-500/30 flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            {isExpanded ? 'Minimize' : 'Chat with Coach'}
          </button>
        </div>
      </div>

      {/* AI Suggestions Preview */}
      {!isExpanded && (
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaLightbulb className="text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">AI Suggestions</h3>
          </div>
          {aiSuggestions && Array.isArray(aiSuggestions) && aiSuggestions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiSuggestions.slice(0, 4).map((suggestion, index) => (
                <div
                  key={index}
                  className="p-4 bg-black/30 border border-emerald-800/20 rounded-lg hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      suggestion.priority === 'high' ? 'bg-red-500/20' :
                      suggestion.priority === 'medium' ? 'bg-yellow-500/20' : 'bg-green-500/20'
                    }`}>
                      {suggestion.priority === 'high' ? <Target className="w-4 h-4 text-red-400" /> :
                       suggestion.priority === 'medium' ? <TrendingUp className="w-4 h-4 text-yellow-400" /> :
                       <FaChartLine className="w-4 h-4 text-green-400" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white text-sm">{suggestion.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">{suggestion.description}</p>
                      <span className={`text-xs mt-2 inline-block px-2 py-1 rounded-full ${
                        suggestion.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                        suggestion.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'
                      }`}>
                        {suggestion.priority} priority
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : loadingAI ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-400">Loading AI suggestions...</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm text-gray-400 mb-2">No AI suggestions available yet</p>
              <p className="text-xs text-gray-500">Complete some interviews or activities to get personalized suggestions</p>
            </div>
          )}
        </div>
      )}

      {/* Chat Interface */}
      {isExpanded && (
        <div className="h-[400px] flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {isInitializing ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Initializing AI Coach...</p>
                </div>
              </div>
            ) : (
              <>
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <Bot className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 mb-2">Welcome! I'm your AI Learning Coach.</p>
                    <p className="text-xs text-gray-500">Ask me anything about your learning journey!</p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex gap-2 max-w-[85%] ${
                          message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        {/* Avatar */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === 'user'
                            ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                            : 'bg-gradient-to-r from-emerald-900/50 to-gray-800/50 border border-emerald-500/30'
                        }`}>
                          {message.role === 'user' ? (
                            <User className="w-4 h-4 text-white" />
                          ) : (
                            <Bot className="w-4 h-4 text-emerald-400" />
                          )}
                        </div>

                        {/* Message Content */}
                        <div
                          className={`p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                              : 'bg-gray-800/90 border border-emerald-800/30 text-gray-200'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          <p className={`text-xs mt-1 ${
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
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 max-w-[85%]">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-emerald-900/50 to-gray-800/50 border border-emerald-500/30 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="p-3 rounded-lg bg-gray-800/90 border border-emerald-800/30">
                        <div className="flex gap-1">
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

          {/* Input Area */}
          <div className="p-4 border-t border-emerald-800/30">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your learning journey..."
                className="flex-1 bg-black/40 border-emerald-800/30 focus:border-emerald-500/50 text-white placeholder-gray-500 text-sm min-h-[40px] max-h-[100px] resize-none"
                rows={1}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:shadow-green-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[40px]"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
