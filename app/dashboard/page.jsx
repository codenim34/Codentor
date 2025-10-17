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
import FloatingAICoach from "@/app/components/FloatingAICoach";

export default function Dashboard() {
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    totalRoadmaps: 0,
    roadmapProgress: 0,
    averageScore: 0,
    totalTasks: 0,
    completedTasks: 0,
    taskCompletionRate: 0,
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
        // Update main stats with interview data
        setStats(prev => ({
          ...prev,
          totalInterviews: data.stats?.totalInterviews || 0,
          averageScore: data.stats?.averageScore || 0,
        }));
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

      // Fetch task statistics
      const tasksResponse = await fetch('/api/tasks/stats');
      const tasksData = tasksResponse.ok ? await tasksResponse.json() : { total: 0, completed: 0 };

      setStats(prev => ({
        ...prev,
        totalRoadmaps: userRoadmaps?.length || 0,
        roadmapProgress: calculateRoadmapProgress(userRoadmaps),
        totalTasks: tasksData.total || 0,
        completedTasks: tasksData.completed || 0,
        taskCompletionRate: tasksData.total > 0 ? Math.round((tasksData.completed / tasksData.total) * 100) : 0,
      }));

      const roadmapActivities = userRoadmaps?.slice(0, 3).map(roadmap => ({
        title: roadmap.title,
        type: 'Roadmap',
        date: roadmap.createdAt || roadmap.updatedAt || null
      })) || [];

      setRecentActivity(roadmapActivities);
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
                <p className="text-sm font-medium text-gray-400">AI Interviews</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stats.totalInterviews}</h3>
                <p className="text-xs text-gray-500 mt-1">Completed</p>
              </div>
              <div className="bg-emerald-500/20 p-3 rounded-full">
                <FaBrain className="text-2xl text-emerald-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gray-900/50 border border-emerald-800/30 hover:border-emerald-500/50 hover:shadow-green-glow transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Interview Score</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stats.averageScore}%</h3>
                <p className="text-xs text-gray-500 mt-1">Average performance</p>
              </div>
              <div className="bg-emerald-500/20 p-3 rounded-full">
                <FaChartLine className="text-2xl text-emerald-400" />
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
                <h3 className="text-2xl font-bold text-white mt-1">{stats.totalRoadmaps}</h3>
                <p className="text-xs text-gray-500 mt-1">Active roadmaps</p>
              </div>
              <div className="bg-emerald-500/20 p-3 rounded-full">
                <FaRoad className="text-2xl text-emerald-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gray-900/50 border border-emerald-800/30 hover:border-emerald-500/50 hover:shadow-green-glow transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Task Completion</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stats.taskCompletionRate}%</h3>
                <p className="text-xs text-gray-500 mt-1">{stats.completedTasks}/{stats.totalTasks} tasks</p>
              </div>
              <div style={{ width: 60, height: 60 }}>
                <CircularProgressbar
                  value={stats.taskCompletionRate}
                  text={`${stats.taskCompletionRate}%`}
                  styles={{
                    path: { stroke: '#10b981', transition: 'stroke-dashoffset 0.5s ease' },
                    text: { fill: '#10b981', fontSize: '24px', fontWeight: 'bold' },
                    trail: { stroke: '#1a1a1a' },
                  }}
                />
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

          </div>
        )}


        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

      {/* Floating AI Coach */}
      <FloatingAICoach />
    </div>
  );
}
