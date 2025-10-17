"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { History, TrendingUp } from "lucide-react";

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
  const [interviewHistory, setInterviewHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (isLoaded && !user) router.push("/sign-in");
    if (user) {
      fetchInterviewHistory();
    }
  }, [isLoaded, user, router]);

  const fetchInterviewHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch('/api/interview/stats');
      if (response.ok) {
        const data = await response.json();
        setInterviewHistory(data.stats?.allInterviews || []);
      }
    } catch (error) {
      console.error("Error fetching interview history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

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
      <div className="max-w-6xl mx-auto">
        {/* Start New Interview Section */}
        <div className="bg-gray-900/50 border border-emerald-800/30 rounded-xl p-8 hover:border-emerald-500/50 hover:shadow-green-glow transition-all duration-300 mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent mb-3">Start New Interview</h1>
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

        {/* Interview History Section */}
        <Card className="bg-gray-900/50 border border-emerald-800/30 p-6 hover:border-emerald-500/50 hover:shadow-green-glow transition-all duration-300">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <History className="text-emerald-400" />
            Interview History
          </h2>
          
          {loadingHistory ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="h-24 bg-emerald-900/20 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : interviewHistory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No interviews yet. Start your first interview to see it here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {interviewHistory.map((interview) => (
                <div
                  key={interview.id}
                  className="p-4 bg-black/30 rounded-lg border border-emerald-800/20 hover:border-emerald-500/40 transition-all cursor-pointer"
                  onClick={() => router.push(`/interview/details/${interview.id}`)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        interview.score >= 80 ? 'bg-green-500/20' :
                        interview.score >= 60 ? 'bg-yellow-500/20' : 'bg-orange-500/20'
                      }`}>
                        <span className={`text-lg font-bold ${
                          interview.score >= 80 ? 'text-green-400' :
                          interview.score >= 60 ? 'text-yellow-400' : 'text-orange-400'
                        }`}>
                          {interview.score}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-white capitalize">
                          {interview.level} {interview.role}
                        </h4>
                        <p className="text-xs text-gray-400">
                          {new Date(interview.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  {interview.strengths && interview.strengths.length > 0 && (
                    <div className="mt-2 text-xs">
                      <span className="text-emerald-400 font-semibold">Strengths: </span>
                      <span className="text-gray-300">{interview.strengths.slice(0, 2).join(', ')}</span>
                    </div>
                  )}
                  {interview.weaknesses && interview.weaknesses.length > 0 && (
                    <div className="mt-1 text-xs">
                      <span className="text-orange-400 font-semibold">Areas to Improve: </span>
                      <span className="text-gray-300">{interview.weaknesses.slice(0, 2).join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}


