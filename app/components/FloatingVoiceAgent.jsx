"use client";

import { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { 
  Mic, 
  MicOff, 
  X, 
  Bot, 
  Loader2,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  CheckCircle2,
  Calendar,
  StickyNote
} from "lucide-react";
import toast from "react-hot-toast";

export default function FloatingVoiceAgent() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize Speech Recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event) => {
          const current = event.resultIndex;
          const transcriptText = event.results[current][0].transcript;
          setTranscript(transcriptText);

          if (event.results[current].isFinal) {
            handleVoiceCommand(transcriptText);
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            toast.error('Microphone access denied. Please enable it in your browser settings.');
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }

      // Initialize Speech Synthesis
      if (window.speechSynthesis) {
        synthRef.current = window.speechSynthesis;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;
        
        const maxX = window.innerWidth - 384;
        const maxY = window.innerHeight - 500;
        
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

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
      toast.success('Listening... Speak now!');
    }
  };

  const speak = (text) => {
    if (!synthRef.current || !speechEnabled) return;

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const handleVoiceCommand = async (command) => {
    if (!command.trim()) return;

    setIsProcessing(true);
    
    const userMessage = {
      role: 'user',
      content: command,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setTranscript("");

    try {
      const response = await fetch('/api/voice-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: command })
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: data.response || data.message,
          timestamp: new Date().toISOString(),
          type: data.type,
          action: data.action,
          data: data.task || data.note || data.tasks || data.notes
        };

        setMessages(prev => [...prev, assistantMessage]);
        
        if (speechEnabled) {
          speak(data.response || data.message);
        }

        // Show appropriate toast based on action
        if (data.type === 'task' && data.action === 'created') {
          toast.success('✅ Task scheduled successfully!');
        } else if (data.type === 'note' && data.action === 'created') {
          toast.success('📝 Note saved successfully!');
        }
      } else {
        throw new Error(data.error || 'Failed to process command');
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date().toISOString(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to process command');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMouseDown = (e) => {
    if (e.target.closest('.drag-handle')) {
      setIsDragging(true);
      const rect = e.currentTarget.getBoundingClientRect();
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const getMessageIcon = (message) => {
    if (message.type === 'task') return <Calendar className="h-4 w-4" />;
    if (message.type === 'note') return <StickyNote className="h-4 w-4" />;
    if (message.role === 'assistant') return <Bot className="h-4 w-4" />;
    return null;
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
        >
          <Mic className="h-6 w-6 group-hover:animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
          </span>
        </button>
      )}

      {/* Voice Agent Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            zIndex: 50,
          }}
          onMouseDown={handleMouseDown}
          className={`transition-all duration-300 ${isMinimized ? 'w-80' : 'w-96'}`}
        >
          <Card className="shadow-2xl border-2 border-purple-500/20 bg-gradient-to-br from-white to-purple-50 dark:from-gray-900 dark:to-purple-950">
            {/* Header */}
            <div className="drag-handle cursor-move bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bot className="h-6 w-6" />
                  {isListening && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold">Voice Assistant</h3>
                  <p className="text-xs opacity-90">
                    {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Ready to help'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSpeechEnabled(!speechEnabled)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    if (recognitionRef.current) recognitionRef.current.stop();
                    if (synthRef.current) synthRef.current.cancel();
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            {!isMinimized && (
              <div className="p-4">
                {/* Messages */}
                <div className="h-64 overflow-y-auto mb-4 space-y-3 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      <Bot className="h-12 w-12 mx-auto mb-3 text-purple-400" />
                      <p className="text-sm font-medium mb-2">Hi! I'm your voice assistant</p>
                      <p className="text-xs">Try saying:</p>
                      <div className="mt-2 space-y-1 text-xs">
                        <p className="italic">"Schedule a task to finish the report for tomorrow"</p>
                        <p className="italic">"Take a note: meeting at 3pm"</p>
                        <p className="italic">"List my tasks"</p>
                      </div>
                    </div>
                  )}
                  
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-purple-600 text-white'
                            : message.type === 'error'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {message.role === 'assistant' && getMessageIcon(message)}
                          <div className="flex-1">
                            <p className="text-sm">{message.content}</p>
                            {message.type === 'task' && message.data && (
                              <div className="mt-2 pt-2 border-t border-white/20">
                                <p className="text-xs opacity-80">✓ Task: {message.data.title}</p>
                              </div>
                            )}
                            {message.type === 'note' && message.data && (
                              <div className="mt-2 pt-2 border-t border-white/20">
                                <p className="text-xs opacity-80">✓ Note saved</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isProcessing && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                        <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Transcript Display */}
                {transcript && (
                  <div className="mb-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <p className="text-sm text-purple-900 dark:text-purple-200">
                      <span className="font-medium">You said:</span> {transcript}
                    </p>
                  </div>
                )}

                {/* Controls */}
                <div className="flex gap-2">
                  <button
                    onClick={toggleListening}
                    disabled={isProcessing || isSpeaking}
                    className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      isListening
                        ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isListening ? (
                      <>
                        <MicOff className="h-5 w-5" />
                        Stop Listening
                      </>
                    ) : (
                      <>
                        <Mic className="h-5 w-5" />
                        Start Speaking
                      </>
                    )}
                  </button>
                </div>

                {/* Help Text */}
                <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                  {isListening ? (
                    <p className="text-red-600 dark:text-red-400 font-medium">🎤 Listening... Speak now!</p>
                  ) : (
                    <p>Click the microphone to start voice commands</p>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
