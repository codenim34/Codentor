"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const ROLES = [
  { id: "backend", name: "Backend Developer" },
  { id: "frontend", name: "Frontend Developer" },
  { id: "fullstack", name: "Full-Stack Developer" },
  { id: "devops", name: "DevOps Engineer" },
];

const LEVELS = [
  { id: "junior", name: "Junior" },
  { id: "mid", name: "Mid" },
  { id: "senior", name: "Senior" },
];

export default function InterviewLobby() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState("backend");
  const [level, setLevel] = useState("mid");
  const [mode, setMode] = useState("text"); // text | voice (browser)
  const [duration, setDuration] = useState(45); // minutes (default A)
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isLoaded && !user) router.push("/sign-in");
  }, [isLoaded, user, router]);

  const startInterview = async () => {
    setStarting(true);
    setError("");
    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, level, mode, durationMin: duration }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to start session");
      router.push("/interview/session");
    } catch (e) {
      setError(e.message);
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-gray-900/50 border border-emerald-800/30 rounded-xl p-8 hover:border-emerald-500/50 hover:shadow-green-glow transition-all duration-300">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent mb-3">AI Interview</h1>
        <p className="text-gray-300 mb-6">Select a role and preferences. The AI interviewer will conduct a {mode === 'voice' ? 'voice' : 'text'} interview.</p>

        {error && <div className="mb-4 text-red-400">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Role</label>
            <select value={role} onChange={e=>setRole(e.target.value)} className="w-full px-4 py-3 bg-black/40 border border-emerald-800/30 rounded-lg text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all">
              {ROLES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Level</label>
            <select value={level} onChange={e=>setLevel(e.target.value)} className="w-full px-4 py-3 bg-black/40 border border-emerald-800/30 rounded-lg text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all">
              {LEVELS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Mode</label>
            <select value={mode} onChange={e=>setMode(e.target.value)} className="w-full px-4 py-3 bg-black/40 border border-emerald-800/30 rounded-lg text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all">
              <option value="text">Text (chat)</option>
              <option value="voice">Voice (browser APIs)</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Duration (minutes)</label>
            <input type="number" min={15} max={120} value={duration} onChange={e=>setDuration(parseInt(e.target.value||"45",10))} className="w-full px-4 py-3 bg-black/40 border border-emerald-800/30 rounded-lg text-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all" />
          </div>
        </div>

        <div className="text-right">
          <button onClick={startInterview} disabled={starting} className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-lg font-medium disabled:opacity-50 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300">
            {starting ? 'Starting...' : 'Start Interview'}
          </button>
        </div>
      </div>
    </div>
  );
}


