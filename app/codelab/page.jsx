"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Code2, Users, Sparkles, Play, ArrowRight, Zap, ArrowLeft } from "lucide-react";
import { nanoid } from "nanoid";

export default function CodeLabPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [roomCode, setRoomCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Redirect to sign-in if not authenticated
  if (isLoaded && !user) {
    router.push('/sign-in');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Redirecting to sign in...</div>
      </div>
    );
  }

  const generateRoomCode = () => {
    return nanoid(8).toUpperCase();
  };

  const handleCreateSession = async () => {
    if (!isLoaded || !user) {
      router.push('/sign-in');
      return;
    }

    setIsCreating(true);
    const newRoomCode = generateRoomCode();
    
    // Navigate to the new session
    setTimeout(() => {
      router.push(`/codelab/${newRoomCode}`);
    }, 500);
  };

  const handleJoinSession = () => {
    if (!isLoaded || !user) {
      router.push('/sign-in');
      return;
    }

    if (!roomCode.trim()) {
      alert("Please enter a room code");
      return;
    }

    if (roomCode.trim().length !== 8) {
      alert("Please enter a valid 8-character room code");
      return;
    }

    router.push(`/codelab/${roomCode.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-40">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 bg-gray-800/90 backdrop-blur-sm border border-emerald-500/30 rounded-lg px-3 py-2 text-emerald-400 hover:bg-gray-700/90 transition-all duration-200 shadow-lg"
          title="Go Back"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute w-96 h-96 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
       

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* Create Session Card */}
          <div className="group relative bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-lg rounded-2xl p-8 border border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-green-500/0 group-hover:from-emerald-500/10 group-hover:to-green-500/10 rounded-2xl transition-all duration-300" />
            
            <div className="relative">
              <div className="flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-xl mb-6 group-hover:bg-emerald-500/30 transition-colors">
                <Play className="w-8 h-8 text-emerald-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-3">
                Start New Session
              </h2>
              <p className="text-gray-400 mb-6">
                Create a collaborative coding environment and invite mentors or learners to join you.
              </p>
              
              <button
                onClick={handleCreateSession}
                disabled={isCreating}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Session
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Join Session Card */}
          <div className="group relative bg-gradient-to-br from-emerald-500/10 to-green-500/10 backdrop-blur-lg rounded-2xl p-8 border border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-green-500/0 group-hover:from-emerald-500/10 group-hover:to-green-500/10 rounded-2xl transition-all duration-300" />
            
            <div className="relative">
              <div className="flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-xl mb-6 group-hover:bg-emerald-500/30 transition-colors">
                <Users className="w-8 h-8 text-emerald-400" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-3">
                Join Session
              </h2>
              <p className="text-gray-400 mb-6">
                Enter a room code to join an existing collaborative coding session.
              </p>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Enter 8-digit room code"
                  maxLength={8}
                  className="w-full bg-gray-900/50 border border-emerald-900/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
                
                <button
                  onClick={handleJoinSession}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-emerald-500/50"
                >
                  Join Session
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

