"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createRoadmap, getUserRoadmaps } from "@/lib/actions/roadmap";
import { FaYoutube } from "react-icons/fa";
import { FiExternalLink, FiChevronRight } from "react-icons/fi";

export default function RoadmapsPage() {
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingRoadmaps, setIsLoadingRoadmaps] = useState(true);
  const [open, setOpen] = useState(false);
  const [roadmaps, setRoadmaps] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    prompt: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      fetchUserRoadmaps();
    }
  }, [user]);

  const getProgress = (roadmap) => {
    const saved = localStorage.getItem(`roadmap-${roadmap._id}-progress`);
    if (saved && roadmap.content?.steps?.length) {
      const completedSteps = new Set(JSON.parse(saved));
      return Math.round((completedSteps.size / roadmap.content.steps.length) * 100);
    }
    return 0;
  };

  const fetchUserRoadmaps = async () => {
    setIsLoadingRoadmaps(true);
    try {
      const userRoadmaps = await getUserRoadmaps(user.id);
      setRoadmaps(userRoadmaps);
    } catch (error) {
      console.error("Error fetching roadmaps:", error);
    } finally {
      setIsLoadingRoadmaps(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await createRoadmap(formData.title, formData.prompt, user.id);
      setOpen(false);
      setFormData({ title: "", prompt: "" });
      fetchUserRoadmaps();
    } catch (error) {
      console.error("Error creating roadmap:", error);
      const errorMessage = error.message || (error.response && error.response.data && error.response.data.message);
      if (errorMessage && (errorMessage === "INVALID_TOPIC" || errorMessage.includes("INVALID_TOPIC"))) {
        setError("Please enter a topic related to computer science or IT only.");
      } else {
        setError("An error occurred while creating the roadmap. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-codeBlack-900 to-deepGreen-950">
      <div className="sticky top-0 z-40 bg-codeBlack-900/80 border-b border-deepGreen-800/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-deepGreen-400 to-deepGreen-600 bg-clip-text text-transparent">My Learning Paths</h1>
              <p className="mt-1 text-sm text-gray-300">Create and manage your personalized learning paths</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button className="group relative overflow-hidden px-6 py-3 rounded-xl bg-gradient-to-r from-deepGreen-600 to-deepGreen-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer"></div>
                  <span className="relative flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create New Roadmap
                  </span>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-codeBlack-900 text-gray-100 border border-deepGreen-800/30">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white">Create a New Learning Path</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Enter a computer science or IT-related topic to generate a personalized learning roadmap.
                    </DialogDescription>
                  </DialogHeader>
                  {error && (
                    <div className="p-3 rounded-md bg-red-950/30 border border-red-800/30">
                      <p className="text-sm text-red-300">{error}</p>
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-1 block">
                        Roadmap Title
                      </label>
                      <Input
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="e.g., My Python Learning Journey"
                        className="w-full px-4 py-2 rounded-lg bg-codeBlack-800 border border-deepGreen-800/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-deepGreen-500 focus:border-deepGreen-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-1 block">
                        What do you want to learn?
                      </label>
                      <Textarea
                        value={formData.prompt}
                        onChange={(e) =>
                          setFormData({ ...formData, prompt: e.target.value })
                        }
                        placeholder="e.g., I want to learn Python from scratch and become proficient in web development using Django"
                        className="w-full px-4 py-2 rounded-lg bg-codeBlack-800 border border-deepGreen-800/50 text-white placeholder-gray-400 focus:ring-2 focus:ring-deepGreen-500 focus:border-deepGreen-500 min-h-[120px]"
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-deepGreen-600 to-deepGreen-700 text-white py-2 rounded-lg hover:from-deepGreen-700 hover:to-deepGreen-800 transition-all duration-200 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                          Creating...
                        </div>
                      ) : (
                        'Create Roadmap'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoadingRoadmaps ? (
            // Loading Skeleton
            <>
              {[1, 2, 3].map((item) => (
                <div key={item} className="bg-codeBlack-900/50 rounded-xl border border-deepGreen-800/30 overflow-hidden">
                  <div className="bg-gradient-to-r from-deepGreen-900 to-codeBlack-900 p-6">
                    <div className="h-6 w-3/4 bg-deepGreen-900/30 rounded animate-pulse"></div>
                  </div>
                  <div className="p-6">
                    <div className="space-y-2 mb-6">
                      <div className="h-4 w-full bg-deepGreen-900/30 rounded animate-pulse"></div>
                      <div className="h-4 w-3/4 bg-deepGreen-900/30 rounded animate-pulse"></div>
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((step) => (
                        <div key={step} className="flex items-start space-x-2">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-deepGreen-900/40 animate-pulse"></div>
                          <div className="flex-1 h-4 bg-deepGreen-900/30 rounded animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {roadmaps.map((roadmap) => {
                const progress = getProgress(roadmap);
                return (
                  <div
                    key={roadmap._id}
                    onClick={() => router.push(`/roadmaps/${roadmap._id}`)}
                    className="group relative bg-codeBlack-900/50 rounded-2xl border border-deepGreen-800/30 hover:border-deepGreen-600/50 hover:shadow-green-glow transition-shadow duration-200 overflow-hidden cursor-pointer"
                  >
                    <div className="bg-gradient-to-r from-deepGreen-900 to-codeBlack-900 p-6">
                      <h2 className="text-xl font-bold text-white">{roadmap.title}</h2>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-300 mb-6 line-clamp-2">{roadmap.prompt}</p>
                      <div className="space-y-3">
                        {roadmap.content.steps.slice(0, 3).map((step) => (
                          <div key={step.step} className="flex items-start space-x-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-deepGreen-900/40 text-deepGreen-300 flex items-center justify-center text-sm font-medium">
                              {step.step}
                            </span>
                            <p className="text-gray-200 line-clamp-1 group-hover:text-deepGreen-300 transition-colors">{step.topic}</p>
                          </div>
                        ))}
                        {roadmap.content.steps.length > 3 && (
                          <p className="text-sm text-gray-400 pl-9">
                            +{roadmap.content.steps.length - 3} more steps
                          </p>
                        )}
                      </div>
                      <div className="mt-6 flex justify-end">
                        <div className="inline-flex items-center text-deepGreen-400 font-medium group-hover:translate-x-1 transition-transform duration-200">
                          View Roadmap
                          <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-medium text-gray-400">Progress</span>
                          <span className="text-xs font-semibold text-deepGreen-300">{progress}%</span>
                        </div>
                        <div className="w-full h-3 bg-codeBlack-800/90 border border-deepGreen-800/40 rounded-full overflow-hidden relative">
                          {/* Subtle animated backdrop */}
                          <div 
                            className="absolute inset-0 opacity-20 bg-gradient-to-r from-deepGreen-700 via-deepGreen-600 to-deepGreen-700 animate-gradient"
                            style={{
                              width: '200%',
                              transform: 'translateX(-50%)',
                            }}
                          />
                          {/* Actual progress bar */}
                          <div 
                            className="relative h-full rounded-full transition-[width] duration-500 ease-out bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.45)]"
                            style={{ 
                              width: `${progress}%`,
                              minWidth: progress > 0 ? '8px' : '0px',
                            }}
                          >
                            {/* Shine effect */}
                            <div 
                              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-20"
                              style={{
                                transform: 'skewX(-45deg) translateX(-100%)',
                                animation: 'shine 2.2s infinite',
                              }}
                            />
                            {/* Inline percentage label (visible on wider segments) */}
                            {progress >= 12 && (
                              <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[10px] leading-none font-semibold text-white/90 drop-shadow">
                                {progress}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <style jsx>{`
                        @keyframes shine {
                          0% {
                            transform: skewX(-45deg) translateX(-200%);
                          }
                          100% {
                            transform: skewX(-45deg) translateX(300%);
                          }
                        }
                        @keyframes gradient {
                          0% {
                            transform: translateX(-50%);
                          }
                          100% {
                            transform: translateX(0%);
                          }
                        }
                        .animate-gradient {
                          animation: gradient 3s linear infinite;
                          background-size: 200% 100%;
                        }
                      `}</style>
                    </div>
                  </div>
                );
              })}
              {roadmaps.length === 0 && !isLoadingRoadmaps && (
                <div className="col-span-full">
                  <div className="text-center py-12 bg-codeBlack-900/50 border border-deepGreen-800/30 rounded-xl">
                    <div className="w-16 h-16 bg-deepGreen-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-deepGreen-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Learning Paths Yet</h3>
                    <p className="text-gray-300 mb-6">
                      Create your first learning roadmap to get started on your journey!
                    </p>
                    <button
                      onClick={() => setOpen(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-deepGreen-600 hover:bg-deepGreen-700 transition-colors"
                    >
                      Create New Roadmap
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
