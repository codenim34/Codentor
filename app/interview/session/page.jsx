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

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950 pt-24 px-6 text-gray-400">Loading...</div>;

  if (summary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gray-900/50 border border-emerald-800/30 rounded-xl p-8 hover:border-emerald-500/50 hover:shadow-green-glow transition-all duration-300">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent mb-6">Interview Summary</h2>
          <div className="space-y-6">
            <div className="bg-black/30 p-6 rounded-lg border border-emerald-800/20">
              <h3 className="text-emerald-400 font-semibold mb-3">Score</h3>
              <p className="text-4xl font-bold text-white">{summary.score}/100</p>
            </div>
            <div className="bg-black/30 p-6 rounded-lg border border-emerald-800/20">
              <h3 className="text-white font-semibold mb-3">Strengths</h3>
              <ul className="list-disc pl-6 text-gray-300 space-y-1">
                {summary.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="bg-black/30 p-6 rounded-lg border border-emerald-800/20">
              <h3 className="text-yellow-400 font-semibold mb-3">Areas for Improvement</h3>
              <ul className="list-disc pl-6 text-gray-300 space-y-1">
                {summary.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
            <div className="bg-black/30 p-6 rounded-lg border border-emerald-800/20">
              <h3 className="text-white font-semibold mb-3">Recommendations</h3>
              <ul className="list-disc pl-6 text-gray-300 space-y-1">
                {summary.recommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
            <div className="text-right">
              <button onClick={() => router.push('/interview')} className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg font-medium shadow-lg shadow-emerald-500/30 transition-all">Start New Interview</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-gray-900/50 border border-emerald-800/30 rounded-xl p-6 hover:border-emerald-500/50 hover:shadow-green-glow transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="text-white font-bold text-xl bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">Interview Session</div>
          <div className="flex gap-3">
            {mode === 'voice' && (
              <button onClick={recording ? stopRecording : startRecording} className={`px-4 py-2 rounded-lg ${recording ? 'bg-red-600 hover:bg-red-700' : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'} text-white text-sm font-medium shadow-lg transition-all`}>
                {recording ? '🔴 Stop Mic' : '🎤 Start Mic'}
              </button>
            )}
            <button onClick={finishInterview} disabled={finishing} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 shadow-lg transition-all">
              {finishing ? 'Finishing...' : 'Finish Interview'}
            </button>
          </div>
        </div>

        <div className="h-[420px] overflow-y-auto bg-black/40 border border-emerald-800/20 rounded-lg p-6 mb-6 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`${m.role === 'ai' ? 'flex justify-start' : 'flex justify-end'}`}>
              <div className={`max-w-3xl px-5 py-3 rounded-xl ${m.role === 'ai' ? 'bg-gray-800/90 border border-emerald-800/20 text-emerald-300' : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/20'}`}>
                <span className="font-semibold block mb-1">{m.role === 'ai' ? 'AI Interviewer' : 'You'}</span>
                <span className={m.role === 'ai' ? 'text-gray-200' : 'text-white'}>{m.content}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <input 
            value={input} 
            onChange={e=>setInput(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Type your answer..." 
            className="flex-1 px-4 py-3 bg-black/40 border border-emerald-800/30 rounded-lg text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder-gray-500" 
          />
          <button onClick={sendMessage} disabled={sending} className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-lg text-white font-medium disabled:opacity-50 shadow-lg shadow-emerald-500/30 transition-all">
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}


