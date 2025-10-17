"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function InterviewSessionPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]); // {role: 'ai'|'user', content}
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("text");
  const [recording, setRecording] = useState(false);
  const [sending, setSending] = useState(false);
  const [summary, setSummary] = useState(null);
  const [finishing, setFinishing] = useState(false);
  const mediaRef = useRef(null);
  const recognitionRef = useRef(null);

  const fetchSession = async () => {
    const res = await fetch("/api/interview/session");
    const data = await res.json();
    if (data.success) {
      setSession(data.session);
      if (!data.session) {
        setMessages([{ role: 'ai', content: 'No active interview. Please start a new one.' }]);
      } else {
        const parts = (data.session.role || '').split(':');
        const m = parts[2] || 'text';
        setMode(m);
        // Load existing messages or show welcome
        if (data.session.messages && data.session.messages.length > 0) {
          setMessages(data.session.messages);
        } else {
          const welcome = `Welcome! This is a ${parts[0]} (${parts[1]}) interview. You may answer in ${m === 'voice' ? 'voice or text' : 'text'}. Please introduce yourself briefly.`;
          setMessages([{ role: 'ai', content: welcome }]);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isLoaded && !user) router.push('/sign-in');
  }, [isLoaded, user, router]);

  useEffect(() => {
    fetchSession();
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const msg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setSending(true);
    try {
      const res = await fetch('/api/interview/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      if (data.success && data.aiResponse) {
        setMessages(prev => [...prev, { role: 'ai', content: data.aiResponse }]);
        // TTS for voice mode
        if (mode === 'voice' && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(data.aiResponse);
          window.speechSynthesis.speak(utterance);
        }
      }
    } catch (e) {
      console.error('Send message error:', e);
    } finally {
      setSending(false);
    }
  };

  const startRecording = async () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Browser speech recognition not supported');
      return;
    }
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + ' ' + transcript);
      };
      
      recognition.onerror = () => {
        setRecording(false);
      };
      
      recognition.onend = () => {
        setRecording(false);
      };
      
      recognitionRef.current = recognition;
      recognition.start();
      setRecording(true);
    } catch (e) {
      console.error('Speech recognition error:', e);
    }
  };
  
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setRecording(false);
  };

  const finishInterview = async () => {
    setFinishing(true);
    try {
      const res = await fetch('/api/interview/finish', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (e) {
      console.error('Finish error:', e);
    } finally {
      setFinishing(false);
    }
  };

  if (loading) return <div className="pt-24 px-6 text-gray-400">Loading...</div>;

  if (summary) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gray-900/50 border border-emerald-500/20 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Interview Summary</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-emerald-400 font-semibold mb-2">Score: {summary.score}/100</h3>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Strengths</h3>
              <ul className="list-disc pl-6 text-gray-300">
                {summary.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Areas for Improvement</h3>
              <ul className="list-disc pl-6 text-gray-300">
                {summary.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">Recommendations</h3>
              <ul className="list-disc pl-6 text-gray-300">
                {summary.recommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
            <div className="text-right">
              <button onClick={() => router.push('/interview')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">Start New Interview</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-gray-900/50 border border-emerald-500/20 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-white font-semibold">Interview Session</div>
          <div className="flex gap-2">
            {mode === 'voice' && (
              <button onClick={recording ? stopRecording : startRecording} className={`px-3 py-1 rounded ${recording ? 'bg-red-600' : 'bg-emerald-600'} text-white text-sm`}>
                {recording ? '🔴 Stop Mic' : '🎤 Start Mic'}
              </button>
            )}
            <button onClick={finishInterview} disabled={finishing} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm disabled:opacity-50">
              {finishing ? 'Finishing...' : 'Finish Interview'}
            </button>
          </div>
        </div>

        <div className="h-[420px] overflow-y-auto bg-gray-800/40 border border-emerald-500/10 rounded p-4 mb-4 space-y-2">
          {messages.map((m, i) => (
            <div key={i} className={`${m.role === 'ai' ? 'text-emerald-300' : 'text-gray-200'}`}>
              <span className="font-semibold">{m.role === 'ai' ? 'AI Interviewer: ' : 'You: '}</span>
              {m.content}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input 
            value={input} 
            onChange={e=>setInput(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type your answer..." 
            className="flex-1 px-3 py-2 bg-gray-800 border border-emerald-500/20 rounded-lg text-gray-200" 
          />
          <button onClick={sendMessage} disabled={sending} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white disabled:opacity-50">
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}


