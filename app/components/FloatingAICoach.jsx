"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageCircle, 
  X, 
  Send, 
  Loader2, 
  Bot, 
  User, 
  Minimize2,
  Maximize2,
  Move
} from "lucide-react";

export default function FloatingAICoach() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);
  const dragRef = useRef(null);

  useEffect(() => {
    if (user && isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [user, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        // Keep within viewport bounds
        const maxX = window.innerWidth - 384; // chat width
        const maxY = window.innerHeight - 500; // chat height
        
        setPosition({
          x: Math.max(0, Math.min(newX, maxX)),
          y: Math.max(0, Math.min(newY, maxY))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

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

  const handleMouseDown = (e) => {
    if (dragRef.current && dragRef.current.contains(e.target)) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };


  if (!user) return null;

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-500 to-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-green-glow transition-all duration-300 hover:scale-105"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatRef}
          className={`fixed z-50 transition-all duration-300 ${
            isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
          }`}
          style={{
            left: position.x || 'auto',
            right: position.x ? 'auto' : '24px',
            bottom: position.y || '24px',
            top: position.y ? 'auto' : 'auto'
          }}
        >
          <Card className="h-full bg-gray-900/95 backdrop-blur-md border border-emerald-800/30 shadow-2xl">
            {/* Header */}
            <div 
              ref={dragRef}
              className="flex items-center justify-between p-4 border-b border-emerald-800/30 cursor-move select-none"
              onMouseDown={handleMouseDown}
            >
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500/20 p-2 rounded-full">
                  <Bot className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">AI Learning Coach</h3>
                  <p className="text-xs text-gray-400">Always here to help</p>
                </div>
                <Move className="w-4 h-4 text-gray-500 ml-2" />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-gray-400 hover:text-emerald-400 transition-colors p-1"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-red-400 transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 h-[350px] scrollbar-thin scrollbar-thumb-emerald-500/30 scrollbar-track-transparent">
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
              </>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
