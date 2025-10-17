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
import { FaYoutube, FaTrophy, FaRoad, FaBook, FaClock, FaCalendarAlt } from "react-icons/fa";
import { IoTrendingUp } from "react-icons/io5";
import { MessageSquare } from "lucide-react";

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

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

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

      // Format roadmap activities - limit to 2 roadmaps
      const roadmapActivities = userRoadmaps?.slice(0, 2).map(roadmap => ({
        title: roadmap.title,
        type: 'Roadmap',
        date: roadmap.createdAt || roadmap.updatedAt || null
      })) || [];

      // Combine and sort activities, then limit to 3 most recent
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
      // Get progress from localStorage using _id
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
    // If user is logged in, they should have at least 1 day streak
    if (!history?.length) return 1;
    
    // Sort history by date in descending order (most recent first)
    const sortedDates = history
      .map(entry => new Date(entry.date))
      .sort((a, b) => b - a);

    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // If this is the first login today, count it as 1
    const lastActivity = sortedDates[0] ? new Date(sortedDates[0]) : today;
    lastActivity.setHours(0, 0, 0, 0);
    
    // Always count today's login
    if (lastActivity.getTime() === today.getTime()) {
      return Math.max(1, sortedDates.length);
    }
    
    const timeDiff = today - lastActivity;
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    
    // If last activity was more than a day ago, but user is logged in today
    if (daysDiff > 1) return 1;
    
    let streak = 1; // Start with 1 for today
    let currentDate = lastActivity;
    
    // Count consecutive days
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
    
    // If logged in today, ensure minimum streak is 1
    return Math.max(1, streak);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-codeBlack-900 to-deepGreen-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8 space-y-4">
            <div className="h-12 w-3/4 bg-deepGreen-900/30 rounded-lg animate-pulse"></div>
            <div className="h-6 w-1/2 bg-deepGreen-900/30 rounded-lg animate-pulse"></div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-codeBlack-900/50 border border-deepGreen-800/30 p-6 rounded-xl">
                <div className="flex justify-between items-center">
                  <div className="space-y-3">
                    <div className="h-4 w-20 bg-deepGreen-900/30 rounded animate-pulse"></div>
                    <div className="h-8 w-16 bg-deepGreen-900/40 rounded animate-pulse"></div>
                    <div className="h-4 w-24 bg-deepGreen-900/30 rounded animate-pulse"></div>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-deepGreen-900/30 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity and Learning Paths Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity Skeleton */}
            <div className="bg-codeBlack-900/50 border border-deepGreen-800/30 rounded-xl p-6">
              <div className="h-6 w-40 bg-deepGreen-900/30 rounded mb-6 animate-pulse"></div>
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex items-center space-x-4 mb-4">
                  <div className="h-10 w-10 rounded-full bg-deepGreen-900/30 animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-deepGreen-900/30 rounded animate-pulse"></div>
                    <div className="h-3 w-1/2 bg-deepGreen-900/30 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Active Learning Paths Skeleton */}
            <div className="bg-codeBlack-900/50 border border-deepGreen-800/30 rounded-xl p-6">
              <div className="h-6 w-40 bg-deepGreen-900/30 rounded mb-6 animate-pulse"></div>
              {[1, 2].map((item) => (
                <div key={item} className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 w-1/3 bg-deepGreen-900/30 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-deepGreen-900/30 rounded animate-pulse"></div>
                  </div>
                  <div className="h-2 w-full bg-codeBlack-800 rounded-full">
                    <div className="h-2 w-1/3 bg-deepGreen-900/40 rounded-full animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-codeBlack-900 to-deepGreen-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-deepGreen-400 to-deepGreen-600 bg-clip-text text-transparent">
            Welcome back, <span className="text-deepGreen-500">{user?.firstName}</span>!
          </h1>
          <p className="text-gray-300">Here's an overview of your learning journey</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-codeBlack-900/50 border border-deepGreen-800/30 hover:border-deepGreen-600/50 hover:shadow-green-glow transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Active Challenges</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stats.activeQuests}</h3>
                <p className="text-xs text-gray-500 mt-1">Ongoing challenges</p>
              </div>
              <div className="bg-deepGreen-500/20 p-3 rounded-full">
                <FaTrophy className="text-2xl text-deepGreen-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-codeBlack-900/50 border border-deepGreen-800/30 hover:border-deepGreen-600/50 hover:shadow-green-glow transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Completed Challenges</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stats.completedQuests}</h3>
                <p className="text-xs text-gray-500 mt-1">Successfully finished</p>
              </div>
              <div className="bg-deepGreen-500/20 p-3 rounded-full">
                <FaBook className="text-2xl text-deepGreen-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-codeBlack-900/50 border border-deepGreen-800/30 hover:border-deepGreen-600/50 hover:shadow-green-glow transition-all duration-300">
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

          <Card className="p-6 bg-codeBlack-900/50 border border-deepGreen-800/30 hover:border-deepGreen-600/50 hover:shadow-green-glow transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Learning Streak</p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {stats.learningStreak} {stats.learningStreak === 1 ? 'day' : 'days'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Keep it up!</p>
              </div>
              <div className="bg-deepGreen-500/20 p-3 rounded-full">
                <IoTrendingUp className="text-2xl text-deepGreen-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card 
            className="p-6 bg-codeBlack-900/50 border border-deepGreen-800/30 hover:border-deepGreen-600/50 hover:shadow-green-glow transition-all duration-300 cursor-pointer"
            onClick={() => router.push('/feed')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Community Feed</p>
                <h3 className="text-xl font-bold text-white mt-1">Connect & Share</h3>
                <p className="text-xs text-gray-500 mt-1">Join the conversation</p>
              </div>
              <div className="bg-deepGreen-500/20 p-3 rounded-full">
                <MessageSquare className="text-2xl text-deepGreen-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="bg-codeBlack-900/50 border border-deepGreen-800/30 p-6 hover:border-deepGreen-600/50 hover:shadow-green-glow transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
              <FaClock className="text-deepGreen-400" />
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 hover:bg-deepGreen-950/30 rounded-lg transition-colors duration-200 cursor-pointer border border-deepGreen-800/20"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-200">{activity.title}</h4>
                    <div className="flex items-center mt-1">
                      <FaCalendarAlt className="text-deepGreen-500 text-xs mr-1" />
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
          <Card className="bg-codeBlack-900/50 border border-deepGreen-800/30 p-6 hover:border-deepGreen-600/50 hover:shadow-green-glow transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Active Learning Paths</h2>
              <FaRoad className="text-deepGreen-400" />
            </div>
            <div className="space-y-4">
              {roadmaps.slice(0, 2).map((roadmap, index) => {
                // Get progress from localStorage using _id
                const saved = localStorage.getItem(`roadmap-${roadmap._id}-progress`);
                const completedSteps = saved ? new Set(JSON.parse(saved)) : new Set();
                const progress = roadmap.content?.steps ? 
                  Math.round((completedSteps.size / roadmap.content.steps.length) * 100) : 0;

                return (
                  <div
                    key={roadmap._id}
                    className="p-4 border border-deepGreen-800/30 rounded-lg hover:bg-deepGreen-950/30 hover:border-deepGreen-600/50 transition-all cursor-pointer"
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
