"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  CircularProgressbar,
  CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { getUserRoadmaps } from "@/lib/actions/roadmap";
import { 
  FaYoutube, 
  FaTrophy, 
  FaRoad, 
  FaBook, 
  FaClock, 
  FaCalendarAlt,
  FaChartLine,
  FaBrain,
  FaLightbulb,
  FaStar,
  FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";
import { IoTrendingUp, IoSparkles } from "react-icons/io5";
import { MessageSquare, Target, Award, TrendingUp, AlertCircle, CheckCircle2, Zap } from "lucide-react";

export default function Dashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    activeQuests: 0,
    completedQuests: 0,
    roadmapProgress: 0,
    learningStreak: 0,
  });
  const [roadmaps, setRoadmaps] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [interviewStats, setInterviewStats] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [loadingAI, setLoadingAI] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchInterviewStats();
      fetchAISuggestions();
    }
  }, [user]);

  const fetchInterviewStats = async () => {
    try {
      const response = await fetch('/api/interview/stats');
      if (response.ok) {
        const data = await response.json();
        setInterviewStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching interview stats:", error);
    }
  };

  const fetchAISuggestions = async () => {
    setLoadingAI(true);
    try {
      const response = await fetch('/api/dashboard/ai-suggestions');
      if (response.ok) {
        const data = await response.json();
        setAiSuggestions(data.data);
      }
    } catch (error) {
      console.error("Error fetching AI suggestions:", error);
    } finally {
      setLoadingAI(false);
    }
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const userRoadmaps = await getUserRoadmaps(user.id);
      setRoadmaps(userRoadmaps);

      const questsResponse = await fetch('/api/quests/user');
      const questsData = await questsResponse.json();

      setStats({
        activeQuests: questsData?.active?.length || 0,
        completedQuests: questsData?.completed?.length || 0,
        roadmapProgress: calculateRoadmapProgress(userRoadmaps),
        learningStreak: calculateStreak(questsData?.history),
      });

      const roadmapActivities = userRoadmaps?.slice(0, 2).map(roadmap => ({
        title: roadmap.title,
        type: 'Roadmap',
        date: roadmap.createdAt || roadmap.updatedAt || null
      })) || [];

      const allActivities = [
        ...(questsData?.recent || []),
        ...roadmapActivities
      ]
      .sort((a, b) => {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return new Date(b.date) - new Date(a.date);
      })
      .slice(0, 3);

      setRecentActivity(allActivities);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRoadmapProgress = (roadmaps) => {
    if (!roadmaps?.length) return 0;
    
    let totalProgress = 0;
    let validRoadmaps = 0;
    
    roadmaps.forEach(roadmap => {
      const saved = localStorage.getItem(`roadmap-${roadmap._id}-progress`);
      if (saved && roadmap.content?.steps?.length) {
        const completedSteps = new Set(JSON.parse(saved));
        const progress = Math.round((completedSteps.size / roadmap.content.steps.length) * 100);
        totalProgress += progress;
        validRoadmaps++;
      }
    });
    
    return validRoadmaps > 0 ? Math.round(totalProgress / validRoadmaps) : 0;
  };

  const calculateStreak = (history) => {
    if (!history?.length) return 1;
    
    const sortedDates = history
      .map(entry => new Date(entry.date))
      .sort((a, b) => b - a);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastActivity = sortedDates[0] ? new Date(sortedDates[0]) : today;
    lastActivity.setHours(0, 0, 0, 0);
    
    if (lastActivity.getTime() === today.getTime()) {
      return Math.max(1, sortedDates.length);
    }
    
    const timeDiff = today - lastActivity;
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) return 1;
    
    let streak = 1;
    let currentDate = lastActivity;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const nextDate = new Date(sortedDates[i]);
      nextDate.setHours(0, 0, 0, 0);
      
      const diffTime = currentDate - nextDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
        currentDate = nextDate;
      } else {
        break;
      }
    }
    
    return Math.max(1, streak);
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getPriorityIcon = (priority) => {
    switch(priority) {
      case 'high': return <AlertCircle className="w-4 h-4" />;
      case 'medium': return <Target className="w-4 h-4" />;
      case 'low': return <CheckCircle2 className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 space-y-4">
            <div className="h-12 w-3/4 bg-emerald-900/30 rounded-lg animate-pulse"></div>
            <div className="h-6 w-1/2 bg-emerald-900/30 rounded-lg animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-gray-900/50 border border-emerald-800/30 p-6 rounded-xl">
                <div className="flex justify-between items-center">
                  <div className="space-y-3">
                    <div className="h-4 w-20 bg-emerald-900/30 rounded animate-pulse"></div>
                    <div className="h-8 w-16 bg-emerald-900/40 rounded animate-pulse"></div>
                    <div className="h-4 w-24 bg-emerald-900/30 rounded animate-pulse"></div>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-emerald-900/30 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
            Welcome back, <span className="text-emerald-500">{user?.firstName}</span>!
          </h1>
          <p className="text-gray-300">Here's an overview of your learning journey</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gray-900/50 border border-emerald-800/30 hover:border-emerald-500/50 hover:shadow-green-glow transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Challenges</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stats.activeQuests}</h3>
                <p className="text-xs text-gray-500 mt-1">Ongoing challenges</p>
              </div>
              <div className="bg-emerald-500/20 p-3 rounded-full">
                <FaTrophy className="text-2xl text-emerald-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gray-900/50 border border-emerald-800/30 hover:border-emerald-500/50 hover:shadow-green-glow transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Completed Challenges</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stats.completedQuests}</h3>
                <p className="text-xs text-gray-500 mt-1">Successfully finished</p>
              </div>
              <div className="bg-emerald-500/20 p-3 rounded-full">
                <FaBook className="text-2xl text-emerald-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gray-900/50 border border-emerald-800/30 hover:border-emerald-500/50 hover:shadow-green-glow transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Learning Path Progress</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stats.roadmapProgress}%</h3>
                <p className="text-xs text-gray-500 mt-1">Overall completion</p>
              </div>
              <div style={{ width: 60, height: 60 }}>
                <CircularProgressbar
                  value={stats.roadmapProgress}
                  text={`${stats.roadmapProgress}%`}
                  styles={{
                    path: { stroke: '#10b981', transition: 'stroke-dashoffset 0.5s ease' },
                    text: { fill: '#10b981', fontSize: '24px', fontWeight: 'bold' },
                    trail: { stroke: '#1a1a1a' },
                  }}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gray-900/50 border border-emerald-800/30 hover:border-emerald-500/50 hover:shadow-green-glow transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Learning Streak</p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {stats.learningStreak} {stats.learningStreak === 1 ? 'day' : 'days'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Keep it up!</p>
              </div>
              <div className="bg-emerald-500/20 p-3 rounded-full">
                <IoTrendingUp className="text-2xl text-emerald-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Interview Performance Section */}
        {interviewStats && interviewStats.totalInterviews > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Award className="text-emerald-400" />
                Interview Performance
              </h2>
              <button 
                onClick={() => router.push('/interview')}
                className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-all border border-emerald-500/30"
              >
                Take Interview
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card className="p-6 bg-gray-900/50 border border-emerald-800/30 hover:border-emerald-500/50 hover:shadow-green-glow transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Total Interviews</p>
                    <h3 className="text-3xl font-bold text-white mt-2">{interviewStats.totalInterviews}</h3>
                    <p className="text-xs text-emerald-400 mt-1">Completed</p>
                  </div>
                  <div className="bg-emerald-500/20 p-4 rounded-full">
                    <FaChartLine className="text-3xl text-emerald-400" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gray-900/50 border border-emerald-800/30 hover:border-emerald-500/50 hover:shadow-green-glow transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-400">Average Score</p>
                    <h3 className="text-3xl font-bold text-white mt-2">{interviewStats.averageScore}%</h3>
                    <p className={`text-xs mt-1 ${
                      interviewStats.averageScore >= 80 ? 'text-green-400' :
                      interviewStats.averageScore >= 60 ? 'text-yellow-400' : 'text-orange-400'
                    }`}>
                      {interviewStats.averageScore >= 80 ? 'Excellent' :
                       interviewStats.averageScore >= 60 ? 'Good' : 'Improving'}
                    </p>
                  </div>
                  <div style={{ width: 70, height: 70 }}>
                    <CircularProgressbar
                      value={interviewStats.averageScore}
                      text={`${interviewStats.averageScore}%`}
                      styles={{
                        path: { 
                          stroke: interviewStats.averageScore >= 80 ? '#10b981' :
                                 interviewStats.averageScore >= 60 ? '#fbbf24' : '#fb923c',
                          transition: 'stroke-dashoffset 0.5s ease' 
                        },
                        text: { fill: '#10b981', fontSize: '20px', fontWeight: 'bold' },
                        trail: { stroke: '#1a1a1a' },
                      }}
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gray-900/50 border border-emerald-800/30 hover:border-emerald-500/50 hover:shadow-green-glow transition-all">
                <div>
                  <p className="text-sm font-medium text-gray-400 mb-3">Performance Distribution</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-green-400 flex items-center gap-1">
                        <FaStar /> Excellent (81-100)
                      </span>
                      <span className="text-white font-bold">{interviewStats.scoreRanges.excellent}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <FaCheckCircle /> Good (61-80)
                      </span>
                      <span className="text-white font-bold">{interviewStats.scoreRanges.good}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-yellow-400 flex items-center gap-1">
                        <FaExclamationTriangle /> Fair (41-60)
                      </span>
                      <span className="text-white font-bold">{interviewStats.scoreRanges.fair}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-orange-400 flex items-center gap-1">
                        <FaExclamationTriangle /> Weak (&lt;41)
                      </span>
                      <span className="text-white font-bold">{interviewStats.scoreRanges.weak}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Interviews */}
            <Card className="bg-gray-900/50 border border-emerald-800/30 p-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="text-emerald-400" />
                Recent Interviews
              </h3>
              <div className="space-y-3">
                {interviewStats.recentInterviews.map((interview, index) => (
                  <div
                    key={interview.id}
                    className="p-4 bg-black/30 rounded-lg border border-emerald-800/20 hover:border-emerald-500/40 transition-all"
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
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    {interview.strengths.length > 0 && (
                      <div className="mt-2 text-xs">
                        <span className="text-emerald-400 font-semibold">Strengths: </span>
                        <span className="text-gray-300">{interview.strengths.slice(0, 2).join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* AI Assistant Suggestions */}
        {aiSuggestions && (
          <div className="mb-8">
            <Card className="bg-gradient-to-br from-emerald-900/30 to-gray-900/50 border border-emerald-500/30 p-6 hover:border-emerald-500/50 hover:shadow-green-glow-lg transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-500/20 p-3 rounded-full">
                  <FaBrain className="text-2xl text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    AI Learning Assistant
                    <IoSparkles className="text-emerald-400 animate-pulse" />
                  </h2>
                  <p className="text-sm text-gray-400">Personalized suggestions based on your activity</p>
                </div>
              </div>

              {loadingAI ? (
                <div className="space-y-4">
                  <div className="h-20 bg-emerald-900/20 rounded-lg animate-pulse"></div>
                  <div className="h-20 bg-emerald-900/20 rounded-lg animate-pulse"></div>
                </div>
              ) : (
                <>
                  {aiSuggestions.motivationalMessage && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                      <p className="text-emerald-100 italic flex items-center gap-2">
                        <FaLightbulb className="text-emerald-400" />
                        {aiSuggestions.motivationalMessage}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {aiSuggestions.suggestions?.map((suggestion, index) => (
                      <div
                        key={index}
                        className="p-4 bg-black/30 rounded-lg border border-emerald-800/20 hover:border-emerald-500/40 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 ${getPriorityColor(suggestion.priority)}`}>
                            {getPriorityIcon(suggestion.priority)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-white">{suggestion.title}</h4>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                suggestion.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                suggestion.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {suggestion.priority}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400">{suggestion.description}</p>
                            <p className="text-xs text-emerald-400 mt-2 capitalize">
                              {suggestion.category}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {aiSuggestions.nextSteps && aiSuggestions.nextSteps.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Target className="text-emerald-400" />
                        Your Next Steps
                      </h3>
                      <ul className="space-y-2">
                        {aiSuggestions.nextSteps.map((step, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1 flex-shrink-0" />
                            <span className="text-sm">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card 
            className="p-6 bg-gray-900/50 border border-emerald-800/30 hover:border-emerald-500/50 hover:shadow-green-glow transition-all duration-300 cursor-pointer"
            onClick={() => router.push('/interview')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">AI Interview</p>
                <h3 className="text-xl font-bold text-white mt-1">Practice & Improve</h3>
                <p className="text-xs text-gray-500 mt-1">Get instant feedback</p>
              </div>
              <div className="bg-emerald-500/20 p-3 rounded-full">
                <FaBrain className="text-2xl text-emerald-400" />
              </div>
            </div>
          </Card>

          <Card 
            className="p-6 bg-gray-900/50 border border-emerald-800/30 hover:border-emerald-500/50 hover:shadow-green-glow transition-all duration-300 cursor-pointer"
            onClick={() => router.push('/feed')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Community Feed</p>
                <h3 className="text-xl font-bold text-white mt-1">Connect & Share</h3>
                <p className="text-xs text-gray-500 mt-1">Join the conversation</p>
              </div>
              <div className="bg-emerald-500/20 p-3 rounded-full">
                <MessageSquare className="text-2xl text-emerald-400" />
              </div>
            </div>
          </Card>

          <Card 
            className="p-6 bg-gray-900/50 border border-emerald-800/30 hover:border-emerald-500/50 hover:shadow-green-glow transition-all duration-300 cursor-pointer"
            onClick={() => router.push('/roadmaps')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Learning Paths</p>
                <h3 className="text-xl font-bold text-white mt-1">Explore Roadmaps</h3>
                <p className="text-xs text-gray-500 mt-1">Structured learning</p>
              </div>
              <div className="bg-emerald-500/20 p-3 rounded-full">
                <FaRoad className="text-2xl text-emerald-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="bg-gray-900/50 border border-emerald-800/30 p-6 hover:border-emerald-500/50 hover:shadow-green-glow transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
              <FaClock className="text-emerald-400" />
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 hover:bg-emerald-950/30 rounded-lg transition-colors duration-200 cursor-pointer border border-emerald-800/20"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-200">{activity.title}</h4>
                    <div className="flex items-center mt-1">
                      <FaCalendarAlt className="text-emerald-500 text-xs mr-1" />
                      <p className="text-sm text-gray-400">
                        {activity.type} • {activity.date ? new Date(activity.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'Not started'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Active Learning Paths */}
          <Card className="bg-gray-900/50 border border-emerald-800/30 p-6 hover:border-emerald-500/50 hover:shadow-green-glow transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Active Learning Paths</h2>
              <FaRoad className="text-emerald-400" />
            </div>
            <div className="space-y-4">
              {roadmaps.slice(0, 2).map((roadmap, index) => {
                const saved = localStorage.getItem(`roadmap-${roadmap._id}-progress`);
                const completedSteps = saved ? new Set(JSON.parse(saved)) : new Set();
                const progress = roadmap.content?.steps ? 
                  Math.round((completedSteps.size / roadmap.content.steps.length) * 100) : 0;

                return (
                  <div
                    key={roadmap._id}
                    className="p-4 border border-emerald-800/30 rounded-lg hover:bg-emerald-950/30 hover:border-emerald-500/50 transition-all cursor-pointer"
                    onClick={() => router.push(`/roadmaps/${roadmap._id}`)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-200">{roadmap.title}</h3>
                        <p className="text-sm text-gray-400">{roadmap.description}</p>
                      </div>
                      <div className="w-16 h-16">
                        <CircularProgressbar
                          value={progress}
                          text={`${progress}%`}
                          styles={{
                            path: {
                              stroke: `rgba(16, 185, 129, ${progress / 100})`,
                            },
                            text: {
                              fill: '#10b981',
                              fontSize: '24px',
                            },
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between text-sm text-gray-500">
                      <span>{completedSteps.size} / {roadmap.content.steps?.length || 0} steps completed</span>
                      <span>{progress}% complete</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
