"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { 
  ArrowLeft, 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Target,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  MessageSquare
} from "lucide-react";

export default function InterviewDetails() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const [interview, setInterview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && params.id) {
      fetchInterviewDetails();
    }
  }, [user, params.id]);

  const fetchInterviewDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/interview/details/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setInterview(data.interview);
      } else {
        console.error("Failed to fetch interview details");
      }
    } catch (error) {
      console.error("Error fetching interview details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="h-10 w-48 bg-emerald-900/30 rounded-lg animate-pulse"></div>
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-gray-900/50 rounded-xl animate-pulse"></div>
            <div className="h-96 bg-gray-900/50 rounded-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Interview Not Found</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:shadow-green-glow transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-orange-500/20 border-orange-500/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent mb-2">
            Interview Details
          </h1>
          <div className="flex items-center gap-4 text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(interview.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{new Date(interview.createdAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Score Card */}
          <Card className={`p-6 border ${getScoreBgColor(interview.evaluation?.overallScore || 0)} hover:shadow-green-glow transition-all`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Overall Score</p>
                <h3 className={`text-4xl font-bold ${getScoreColor(interview.evaluation?.overallScore || 0)} mt-2`}>
                  {interview.evaluation?.overallScore || 0}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Out of 100</p>
              </div>
              <div style={{ width: 80, height: 80 }}>
                <CircularProgressbar
                  value={interview.evaluation?.overallScore || 0}
                  text={`${interview.evaluation?.overallScore || 0}%`}
                  styles={{
                    path: { 
                      stroke: interview.evaluation?.overallScore >= 80 ? '#10b981' :
                             interview.evaluation?.overallScore >= 60 ? '#fbbf24' : '#fb923c',
                      transition: 'stroke-dashoffset 0.5s ease' 
                    },
                    text: { fill: '#10b981', fontSize: '20px', fontWeight: 'bold' },
                    trail: { stroke: '#1a1a1a' },
                  }}
                />
              </div>
            </div>
          </Card>

          {/* Role Card */}
          <Card className="p-6 bg-gray-900/50 border border-emerald-800/30 hover:border-emerald-500/50 hover:shadow-green-glow transition-all">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 p-3 rounded-full">
                <Target className="text-2xl text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Position</p>
                <h3 className="text-xl font-bold text-white capitalize">
                  {interview.level} {interview.role}
                </h3>
                <p className="text-xs text-emerald-400 capitalize">{interview.role} Developer</p>
              </div>
            </div>
          </Card>

          {/* Duration Card */}
          <Card className="p-6 bg-gray-900/50 border border-emerald-800/30 hover:border-emerald-500/50 hover:shadow-green-glow transition-all">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500/20 p-3 rounded-full">
                <MessageSquare className="text-2xl text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Responses</p>
                <h3 className="text-xl font-bold text-white">
                  {interview.messages?.length || 0} messages
                </h3>
                <p className="text-xs text-gray-500">Interview conversation</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Strengths Section */}
        {interview.evaluation?.strengths && interview.evaluation.strengths.length > 0 && (
          <Card className="bg-gray-900/50 border border-emerald-800/30 p-6 mb-6 hover:border-emerald-500/50 hover:shadow-green-glow transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <TrendingUp className="text-green-400 w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Strengths</h2>
            </div>
            <div className="space-y-3">
              {interview.evaluation.strengths.map((strength, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-green-500/5 border border-green-500/20 rounded-lg hover:border-green-500/40 transition-all"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">{strength}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Weaknesses Section */}
        {interview.evaluation?.weaknesses && interview.evaluation.weaknesses.length > 0 && (
          <Card className="bg-gray-900/50 border border-emerald-800/30 p-6 mb-6 hover:border-emerald-500/50 hover:shadow-green-glow transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-500/20 p-2 rounded-lg">
                <TrendingDown className="text-orange-400 w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Areas for Improvement</h2>
            </div>
            <div className="space-y-3">
              {interview.evaluation.weaknesses.map((weakness, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg hover:border-orange-500/40 transition-all"
                >
                  <XCircle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">{weakness}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recommendations Section */}
        {interview.evaluation?.recommendations && interview.evaluation.recommendations.length > 0 && (
          <Card className="bg-gradient-to-br from-emerald-900/30 to-gray-900/50 border border-emerald-500/30 p-6 mb-6 hover:border-emerald-500/50 hover:shadow-green-glow-lg transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-emerald-500/20 p-2 rounded-lg">
                <Award className="text-emerald-400 w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white">Recommendations</h2>
            </div>
            <div className="space-y-3">
              {interview.evaluation.recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-black/30 border border-emerald-500/20 rounded-lg hover:border-emerald-500/40 transition-all"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-300">{recommendation}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Interview Transcript */}
        <Card className="bg-gray-900/50 border border-emerald-800/30 p-6 hover:border-emerald-500/50 hover:shadow-green-glow transition-all">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="text-emerald-400" />
            Interview Transcript
          </h2>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {interview.messages?.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
                      : 'bg-gray-800/90 border border-emerald-800/20 text-gray-200'
                  }`}
                >
                  <p className="text-sm font-semibold mb-1">
                    {message.role === 'user' ? 'You' : 'AI Interviewer'}
                  </p>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <button
            onClick={() => router.push('/interview')}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:shadow-green-glow transition-all font-semibold"
          >
            Take Another Interview
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-gray-800/50 border border-emerald-800/30 text-emerald-400 rounded-lg hover:bg-gray-800/70 hover:border-emerald-500/50 transition-all font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

