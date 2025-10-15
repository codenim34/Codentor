"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { IoSearch } from "react-icons/io5";
import { formatDistanceToNow } from "date-fns";

const CHANNEL_IDS = [
  "UC8butISFwT-Wl7EV0hUK0BQ", // freeCodeCamp
  "UC59K-uG2A5ogwIrHw4bmlEg", // Telusko
];

// Function to get a random API key
const getRandomApiKey = () => {
  const apiKeys = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY.split(',');
  const randomIndex = Math.floor(Math.random() * apiKeys.length);
  return apiKeys[randomIndex];
};

const LearnPage = () => {
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("latest");
  const [isLoading, setIsLoading] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiProblem, setAiProblem] = useState("");
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const router = useRouter();

  const formatDuration = (duration) => {
    console.log('Duration input:', duration); // Debug log
    if (!duration) return '0:00'; // Handle null or undefined duration
    
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00'; // Handle invalid format
    
    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');

    let formattedDuration = '';
    
    if (hours) {
      formattedDuration += `${hours}:`;
      formattedDuration += `${minutes.padStart(2, '0')}:`;
    } else if (minutes) {
      formattedDuration += `${minutes}:`;
    } else {
      formattedDuration += '0:';
    }
    
    formattedDuration += seconds.padStart(2, '0');
    
    return formattedDuration;
  };

  const getVideoDetails = async (videoIds) => {
    try {
      const response = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
        params: {
          part: 'contentDetails',
          id: videoIds.join(','),
          key: getRandomApiKey(),
        },
      });
      return response.data.items;
    } catch (error) {
      console.error('Error fetching video details:', error);
      return [];
    }
  };

  const fetchVideos = async () => {
    setIsLoading(true);
    setActiveFilter("latest");
    try {
      const promises = CHANNEL_IDS.map((channelId) =>
        axios.get(`https://www.googleapis.com/youtube/v3/search`, {
          params: {
            part: "snippet",
            channelId: channelId,
            maxResults: 6,
            order: "date",
            key: getRandomApiKey(),
          },
        })
      );
      const results = await Promise.all(promises);
      const allVideos = results.flatMap((result) => result.data.items);
      
      // Get video durations
      const videoIds = allVideos.map(video => video.id.videoId);
      const videoDetails = await getVideoDetails(videoIds);
      
      // Merge duration information with video data
      const videosWithDuration = allVideos.map(video => {
        const details = videoDetails.find(detail => detail.id === video.id.videoId);
        return {
          ...video,
          contentDetails: details?.contentDetails || null,
        };
      });
      
      setVideos(videosWithDuration);
    } catch (error) {
      console.error("Error fetching videos", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPopularVideos = async () => {
    setIsLoading(true);
    setActiveFilter("popular");
    try {
      const promises = CHANNEL_IDS.map((channelId) =>
        axios.get(`https://www.googleapis.com/youtube/v3/search`, {
          params: {
            part: "snippet",
            channelId: channelId,
            maxResults: 6,
            order: "viewCount",
            key: getRandomApiKey(),
          },
        })
      );
      const results = await Promise.all(promises);
      const allVideos = results.flatMap((result) => result.data.items);
      
      const videoIds = allVideos.map(video => video.id.videoId);
      const videoDetails = await getVideoDetails(videoIds);
      
      const videosWithDuration = allVideos.map(video => {
        const details = videoDetails.find(detail => detail.id === video.id.videoId);
        return {
          ...video,
          contentDetails: details?.contentDetails || null,
        };
      });
      
      setVideos(videosWithDuration);
    } catch (error) {
      console.error("Error fetching popular videos", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrendingVideos = async () => {
    setIsLoading(true);
    setActiveFilter("trending");
    try {
      const promises = CHANNEL_IDS.map((channelId) =>
        axios.get(`https://www.googleapis.com/youtube/v3/search`, {
          params: {
            part: "snippet",
            channelId: channelId,
            maxResults: 6,
            order: "rating",
            key: getRandomApiKey(),
          },
        })
      );
      const results = await Promise.all(promises);
      const allVideos = results.flatMap((result) => result.data.items);
      
      const videoIds = allVideos.map(video => video.id.videoId);
      const videoDetails = await getVideoDetails(videoIds);
      
      const videosWithDuration = allVideos.map(video => {
        const details = videoDetails.find(detail => detail.id === video.id.videoId);
        return {
          ...video,
          contentDetails: details?.contentDetails || null,
        };
      });
      
      setVideos(videosWithDuration);
    } catch (error) {
      console.error("Error fetching trending videos", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVideosBySearch = async () => {
    setIsLoading(true);
    setActiveFilter("search");
    try {
      const promises = CHANNEL_IDS.map((channelId) =>
        axios.get(`https://www.googleapis.com/youtube/v3/search`, {
          params: {
            part: "snippet",
            channelId: channelId,
            maxResults: 12,
            order: "relevance",
            q: searchTerm,
            key: getRandomApiKey(),
          },
        })
      );
      const results = await Promise.all(promises);
      const allVideos = results.flatMap((result) => result.data.items);
      
      // Get video durations
      const videoIds = allVideos.map(video => video.id.videoId);
      const videoDetails = await getVideoDetails(videoIds);
      
      // Merge duration information with video data
      const videosWithDuration = allVideos.map(video => {
        const details = videoDetails.find(detail => detail.id === video.id.videoId);
        return {
          ...video,
          contentDetails: details?.contentDetails || null,
        };
      });
      
      setVideos(videosWithDuration);
    } catch (error) {
      console.error("Error fetching videos by search", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleAISearch = async () => {
    if (!aiProblem.trim()) return;

    setIsAIProcessing(true);
    try {
      // Call the AI API to extract search keywords
      const response = await axios.post('/api/ai-search', {
        userProblem: aiProblem,
      });

      const { searchKeywords } = response.data;

      // Set the search term and trigger search
      setSearchTerm(searchKeywords);
      setShowAIAssistant(false);
      setAiProblem("");

      // Fetch videos based on AI-generated keywords
      await fetchVideosByAISearch(searchKeywords);
    } catch (error) {
      console.error('Error with AI search:', error);
      alert('Failed to process your request. Please try again.');
    } finally {
      setIsAIProcessing(false);
    }
  };

  const fetchVideosByAISearch = async (keywords) => {
    setIsLoading(true);
    setActiveFilter("search");
    try {
      const promises = CHANNEL_IDS.map((channelId) =>
        axios.get(`https://www.googleapis.com/youtube/v3/search`, {
          params: {
            part: "snippet",
            channelId: channelId,
            maxResults: 12,
            order: "relevance",
            q: keywords,
            key: getRandomApiKey(),
          },
        })
      );
      const results = await Promise.all(promises);
      const allVideos = results.flatMap((result) => result.data.items);
      
      const videoIds = allVideos.map(video => video.id.videoId);
      const videoDetails = await getVideoDetails(videoIds);
      
      const videosWithDuration = allVideos.map(video => {
        const details = videoDetails.find(detail => detail.id === video.id.videoId);
        return {
          ...video,
          contentDetails: details?.contentDetails || null,
        };
      });
      
      setVideos(videosWithDuration);
    } catch (error) {
      console.error("Error fetching videos by AI search", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes shimmer {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }
      .animate-shimmer {
        animation: shimmer 2.5s infinite;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950">
      {/* Fixed Search Bar - Compact Version */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl shadow-xl border-b border-emerald-900/30">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          {/* Search and Actions in One Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input - Compact */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400">
                  <IoSearch size={18} />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchTerm.trim()) {
                      fetchVideosBySearch();
                    }
                  }}
                  placeholder="Search tutorials..."
                  className="w-full pl-10 pr-24 py-2.5 bg-gray-900/60 border border-emerald-900/30 rounded-lg focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-200 text-white text-sm placeholder-gray-500"
                />
                <button 
                  onClick={() => searchTerm.trim() && fetchVideosBySearch()} 
                  className={`absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-emerald-600 text-white text-sm rounded-md hover:bg-emerald-700 transition-all duration-200 font-medium ${!searchTerm.trim() && 'opacity-50 cursor-not-allowed'}`}
                  disabled={!searchTerm.trim()}
                >
                  Search
                </button>
              </div>
            </div>

            {/* AI Roadmap Button - Compact */}
            <button
              onClick={() => router.push('/roadmaps')}
              className="group relative overflow-hidden inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-emerald-600/50 text-sm font-semibold rounded-lg text-white bg-emerald-900/20 hover:bg-emerald-800/30 hover:border-emerald-500 transition-all duration-300 whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              AI Roadmap
              <svg className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content with proper top padding */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        {/* Page Header and Filter Pills in One Section */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                Learn & Explore
              </h1>
              <p className="text-gray-400 text-xs mt-1">Curated tutorials from top educators</p>
            </div>

            {/* Video Count */}
            {videos.length > 0 && !isLoading && (
              <div className="text-sm text-gray-400">
                <span className="text-emerald-400 font-semibold">{videos.length}</span> videos
                {activeFilter === "search" && searchTerm && (
                  <span className="ml-1">for "<span className="text-emerald-300">{searchTerm}</span>"</span>
                )}
              </div>
            )}
          </div>

          {/* Filter Pills - Compact */}
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={fetchVideos}
              className={`px-4 py-1.5 border rounded-full transition-all duration-200 font-medium text-xs ${
                activeFilter === "latest"
                  ? "bg-emerald-600 border-emerald-500 text-white shadow-md"
                  : "bg-gray-900/40 hover:bg-gray-800/60 border-emerald-900/30 hover:border-emerald-700/40 text-emerald-300"
              }`}
            >
              Latest
            </button>
            <button 
              onClick={fetchPopularVideos}
              className={`px-4 py-1.5 border rounded-full transition-all duration-200 font-medium text-xs ${
                activeFilter === "popular"
                  ? "bg-emerald-600 border-emerald-500 text-white shadow-md"
                  : "bg-gray-900/40 hover:bg-gray-800/60 border-emerald-900/30 hover:border-emerald-700/40 text-gray-300 hover:text-emerald-300"
              }`}
            >
              Popular
            </button>
            <button 
              onClick={fetchTrendingVideos}
              className={`px-4 py-1.5 border rounded-full transition-all duration-200 font-medium text-xs ${
                activeFilter === "trending"
                  ? "bg-emerald-600 border-emerald-500 text-white shadow-md"
                  : "bg-gray-900/40 hover:bg-gray-800/60 border-emerald-900/30 hover:border-emerald-700/40 text-gray-300 hover:text-emerald-300"
              }`}
            >
              Trending
            </button>
          </div>
        </div>

        {/* Videos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading || videos.length === 0 ? (
            // Loading Skeleton
            <>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="group bg-gray-900/50 border border-emerald-900/30 rounded-2xl overflow-hidden flex flex-col h-full shadow-lg backdrop-blur-sm"
                >
                  {/* Thumbnail Skeleton */}
                  <div className="relative" style={{ paddingBottom: '56.25%' }}>
                    <div className="absolute inset-0 bg-gray-800/40 animate-pulse">
                      <div className="absolute bottom-3 right-3 w-14 h-6 bg-gray-700/60 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Content Skeleton */}
                  <div className="flex flex-col flex-grow p-6">
                    {/* Title Skeleton */}
                    <div className="space-y-3 mb-4">
                      <div className="h-5 bg-gray-800/40 rounded-lg w-full animate-pulse"></div>
                      <div className="h-5 bg-gray-800/40 rounded-lg w-4/5 animate-pulse"></div>
                    </div>
                    
                    {/* Footer Skeleton */}
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-emerald-900/30">
                      <div className="w-28 h-4 bg-gray-800/40 rounded-lg animate-pulse"></div>
                      <div className="w-24 h-3 bg-gray-800/40 rounded-lg animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            videos.map((video) => (
              <div
                key={video.id.videoId}
                className="group bg-gray-900/50 backdrop-blur-sm border border-emerald-900/30 rounded-2xl hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full transform hover:-translate-y-1"
                onClick={() => router.push(`/learn/${video.id.videoId}`)}
              >
                {/* Thumbnail Container */}
                <div className="relative overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                  <img
                    src={video.snippet.thumbnails.medium.url}
                    alt={video.snippet.title}
                    className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                  
                  {/* Play Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-emerald-500/90 rounded-full p-4 transform group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Duration Badge */}
                  {video.contentDetails && (
                    <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-black/90 backdrop-blur-sm text-white text-sm font-semibold rounded-lg border border-emerald-600/30">
                      {formatDuration(video.contentDetails.duration)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col flex-grow p-6 bg-gradient-to-b from-gray-900/60 to-gray-900/80">
                  <h3 className="text-lg font-bold text-white line-clamp-2 mb-3 group-hover:text-emerald-400 transition-colors leading-tight">
                    {video.snippet.title}
                  </h3>
                  
                  {/* Channel and Date */}
                  <div className="mt-auto pt-4 flex items-center justify-between border-t border-emerald-900/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <p className="text-sm font-medium text-gray-300 group-hover:text-emerald-300 transition-colors">
                        {video.snippet.channelTitle}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                      {formatDistanceToNow(new Date(video.snippet.publishedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Floating AI Assistant Button */}
      <button
        onClick={() => setShowAIAssistant(true)}
        className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-emerald-600 to-green-600 text-white p-4 rounded-full shadow-2xl hover:shadow-emerald-500/50 hover:scale-110 transition-all duration-300 group"
        title="AI Assistant"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          AI
        </span>
      </button>

      {/* AI Assistant Modal */}
      {showAIAssistant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 border border-emerald-500/30 rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-500/20 p-3 rounded-xl">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                    AI Learning Assistant
                  </h2>
                  <p className="text-gray-400 text-sm">Tell me your coding problem, I'll find tutorials for you</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAIAssistant(false);
                  setAiProblem("");
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Input Area */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  What coding problem are you facing?
                </label>
                <textarea
                  value={aiProblem}
                  onChange={(e) => setAiProblem(e.target.value)}
                  placeholder="Example: I'm getting a 'Cannot read property of undefined' error in my React component when trying to map over an array..."
                  className="w-full h-32 px-4 py-3 bg-gray-800/50 border border-emerald-900/30 rounded-xl focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-white placeholder-gray-500 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey && aiProblem.trim()) {
                      handleAISearch();
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Be specific about your error, language, or framework
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAISearch}
                  disabled={!aiProblem.trim() || isAIProcessing}
                  className={`flex-1 py-3 px-6 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                    !aiProblem.trim() || isAIProcessing
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:from-emerald-700 hover:to-green-700 hover:shadow-lg hover:shadow-emerald-500/30'
                  }`}
                >
                  {isAIProcessing ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Find Tutorials
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowAIAssistant(false);
                    setAiProblem("");
                  }}
                  className="py-3 px-6 bg-gray-800/50 text-gray-300 rounded-xl font-semibold hover:bg-gray-700/50 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Press <kbd className="px-2 py-1 bg-gray-800 rounded">Ctrl</kbd> + <kbd className="px-2 py-1 bg-gray-800 rounded">Enter</kbd> to search
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearnPage;