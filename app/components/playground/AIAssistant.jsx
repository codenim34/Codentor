"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  X,
  Minimize2,
  Maximize2,
  Loader2,
  Code,
  User,
  Bot
} from "lucide-react";
import toast from "react-hot-toast";

// Minimal markdown → HTML renderer: supports **bold**, `inline code`, and ```fenced code```
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderMarkdown(md) {
  if (!md) return "";
  // Escape first to avoid HTML injection
  let html = escapeHtml(md);
  // Fenced code blocks ```lang\ncode\n```
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (m, lang, code) => {
    const language = lang ? `language-${lang}` : "";
    return `<pre class=\"ai-pre\"><code class=\"${language}\">${code.replace(/\n/g, "<br/>")}</code></pre>`;
  });
  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, (m, code) => `<code class=\"ai-inline\">${code}</code>`);
  // Bold **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, (m, text) => `<strong>${text}</strong>`);
  // Newlines to <br/>
  html = html.replace(/\n/g, "<br/>");
  return html;
}

export default function AIAssistant({ code, language, onCodeUpdate, isSidebar = false, sidebarWidth = 320 }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hi! I'm your AI Assistant. I can help you with code, answer questions, explain concepts, and show you code examples. What would you like help with?",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false); // Speaker off by default
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthesisRef = useRef(null);
  const chatContainerRef = useRef(null);
  const draggableRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          toast.error('Voice recognition failed. Please try again.');
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  // Sidebar mode renders always; floating mode uses isOpen
  useEffect(() => {
    if (isSidebar) {
      // ensure no floating-specific state interferes
      setIsMinimized(false);
    }
  }, [isSidebar]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Dragging functionality
  const handleMouseDown = (e) => {
    if (e.target.closest('.drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      toast.error('Voice recognition not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.success('Listening... Speak now!');
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast.error('Failed to start voice recognition');
      }
    }
  };

  const speakText = (text) => {
    if (!voiceEnabled || typeof window === 'undefined') return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Clean text for better speech
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'code block')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          currentCode: code,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      const assistantMessage = {
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        codeChange: data.codeChange,
        newCode: data.newCode,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Code is now displayed directly in the chat with Apply button
      // No need for separate toast notification

      // Speak the response if voice is enabled
      if (voiceEnabled && data.message) {
        speakText(data.message);
      }

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isSidebar) {
    if (!isOpen) {
      return (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white p-4 rounded-full shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-110 z-50 group"
          title="AI Assistant"
        >
          <Sparkles className="w-6 h-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </button>
      );
    }
  }

  if (isSidebar) {
    return (
      <div className="h-full flex flex-col bg-gray-800">
        {/* Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800"
        >
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div
                className={`flex items-start space-x-2 max-w-[85%] ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-3 h-3" />
                  ) : (
                    <Bot className="w-3 h-3" />
                  )}
                </div>
                       <div
                         className={`rounded-lg px-3 py-2 ${
                           message.role === 'user'
                             ? 'bg-blue-500/20 text-white'
                             : 'bg-gray-700 text-gray-100'
                         }`}
                       >
                         <div
                           className={`${isSidebar ? 'text-xs' : 'text-sm'} break-words leading-relaxed ai-markdown`}
                           dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
                         />
                         {message.newCode && (
                           <div className="mt-2 border border-emerald-500/30 rounded-lg overflow-hidden">
                             <div className="bg-emerald-500/10 px-2 py-1 flex items-center justify-between">
                               <span className={`text-emerald-400 font-semibold flex items-center space-x-1 ${
                                 isSidebar ? 'text-xs' : 'text-sm'
                               }`}>
                                 <Code className={isSidebar ? "w-3 h-3" : "w-4 h-4"} />
                                 <span>Generated Code</span>
                               </span>
                               {onCodeUpdate && (
                                 <button
                                   onClick={() => {
                                     onCodeUpdate(message.newCode);
                                     toast.success('Code applied to editor!');
                                   }}
                                   className={`bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded transition-colors ${
                                     isSidebar ? 'text-xs' : 'text-sm'
                                   }`}
                                 >
                                   Apply
                                 </button>
                               )}
                             </div>
                             <pre className={`bg-gray-900 p-2 overflow-x-auto ${
                               isSidebar ? 'text-xs' : 'text-sm'
                             }`}>
                               <code className="text-gray-300">{message.newCode}</code>
                             </pre>
                           </div>
                         )}
                  <div className="text-xs text-gray-500 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-700 rounded-lg px-3 py-2">
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-emerald-900/30 bg-gray-900/50">
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
                     <textarea
                       value={input}
                       onChange={(e) => setInput(e.target.value)}
                       onKeyPress={handleKeyPress}
                       placeholder="Ask me anything about your code..."
                       rows={1}
                       className={`w-full bg-gray-700 text-white rounded-lg px-3 py-2 pr-10 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder-gray-500 max-h-24 ${
                         isSidebar ? 'text-xs' : 'text-sm'
                       }`}
                       style={{ minHeight: '32px' }}
                     />
              <button
                onClick={toggleVoiceRecognition}
                className={`absolute right-2 bottom-2 p-1 rounded transition-colors ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'hover:bg-gray-600 text-gray-400'
                }`}
                title={isListening ? "Stop listening" : "Voice input"}
              >
                {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
              </button>
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
                 <div className={`mt-1 text-gray-500 flex items-center justify-between ${
                   isSidebar ? 'text-xs' : 'text-sm'
                 }`}>
                   <span>Press Enter to send</span>
                   {isSpeaking && (
                     <button
                       onClick={stopSpeaking}
                       className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                     >
                       <VolumeX className={isSidebar ? "w-3 h-3" : "w-4 h-4"} />
                       <span>Stop</span>
                     </button>
                   )}
                 </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={draggableRef}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      className={`fixed ${isMinimized ? 'bottom-6 right-6 w-80' : 'bottom-6 right-6 w-96 h-[600px]'} bg-gray-800 rounded-2xl shadow-2xl border border-emerald-500/30 flex flex-col z-50 transition-all duration-300`}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b border-emerald-900/30 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-t-2xl drag-handle cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            {isLoading && (
              <Loader2 className="w-3 h-3 text-emerald-400 absolute -top-1 -right-1 animate-spin" />
            )}
          </div>
          <span className="font-semibold text-white">AI Assistant</span>
          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
            Ready to Help
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
            title={voiceEnabled ? "Disable voice" : "Enable voice"}
          >
            {voiceEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-500" />
            )}
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4 text-gray-400" />
            ) : (
              <Minimize2 className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800"
          >
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[85%] ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-blue-500/20 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </div>
                    {message.newCode && (
                      <div className="mt-3 border border-emerald-500/30 rounded-lg overflow-hidden">
                        <div className="bg-emerald-500/10 px-3 py-1.5 flex items-center justify-between">
                          <span className="text-xs text-emerald-400 font-semibold flex items-center space-x-1">
                            <Code className="w-3 h-3" />
                            <span>Generated Code</span>
                          </span>
                          {onCodeUpdate && (
                            <button
                              onClick={() => {
                                onCodeUpdate(message.newCode);
                                toast.success('Code applied to editor!');
                              }}
                              className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded transition-colors"
                            >
                              Apply to Editor
                            </button>
                          )}
                        </div>
                        <pre className="bg-gray-900 p-3 text-xs overflow-x-auto">
                          <code className="text-gray-300">{message.newCode}</code>
                        </pre>
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 rounded-2xl px-4 py-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-emerald-900/30 bg-gray-900/50">
            <div className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything about your code..."
                  rows={1}
                  className="w-full bg-gray-700 text-white rounded-xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder-gray-500 text-sm max-h-32"
                  style={{ minHeight: '44px' }}
                />
                <button
                  onClick={toggleVoiceRecognition}
                  className={`absolute right-3 bottom-3 p-1.5 rounded-lg transition-colors ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'hover:bg-gray-600 text-gray-400'
                  }`}
                  title={isListening ? "Stop listening" : "Voice input"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 disabled:from-gray-600 disabled:to-gray-700 text-white p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
              <span>Press Enter to send, Shift+Enter for new line</span>
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                >
                  <VolumeX className="w-3 h-3" />
                  <span>Stop speaking</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {isMinimized && (
        <div className="p-4 text-center text-gray-400 text-sm">
          Click to expand
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thumb-gray-700::-webkit-scrollbar-thumb {
          background-color: #374151;
          border-radius: 3px;
        }
        .scrollbar-track-gray-800::-webkit-scrollbar-track {
          background-color: #1f2937;
        }
        /* Markdown styling */
        .ai-markdown strong { color: #e5e7eb; font-weight: 700; }
        .ai-markdown code.ai-inline { background: #111827; color: #d1d5db; padding: 2px 6px; border-radius: 4px; }
        .ai-pre { background: #111827; padding: 12px; border-radius: 8px; overflow-x: auto; border: 1px solid rgba(16,185,129,0.2); }
        .ai-pre code { color: #d1d5db; }
      `}</style>
    </div>
  );
}

