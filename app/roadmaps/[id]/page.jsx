"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaYoutube, FaCheckCircle, FaLock } from "react-icons/fa";
import { FiExternalLink, FiArrowLeft, FiClock, FiBookOpen } from "react-icons/fi";
import { getRoadmapById } from "@/lib/actions/roadmap";
import Progress from "@/components/Progress";
import dynamic from 'next/dynamic';
import useSound from 'use-sound';

const Confetti = dynamic(() => import('react-confetti'), {
  ssr: false
});

// Function to format duration from ISO 8601
const formatDuration = (duration) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;

  let formatted = "";
  if (hours) formatted += `${hours}h `;
  if (minutes) formatted += `${minutes}m `;
  if (seconds && !hours) formatted += `${seconds}s`;
  return formatted.trim();
};

const sanitizeUrl = (url) => {
  return url.replace(/[<>]/g, '').trim();
};

export default function RoadmapDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  // Add sound effects
  const [playComplete] = useSound('/sounds/complete.mp3', { volume: 0.5 });
  const [playSuccess] = useSound('/sounds/success.mp3', { volume: 0.75 });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        const data = await getRoadmapById(params.id);
        setRoadmap(data);
        // Load completed steps from localStorage
        const saved = localStorage.getItem(`roadmap-${params.id}-progress`);
        if (saved) {
          setCompletedSteps(new Set(JSON.parse(saved)));
        }
      } catch (error) {
        console.error("Error fetching roadmap:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchRoadmap();
    }
  }, [params.id]);

  useEffect(() => {
    const scrollToContent = () => {
      const activeContent = document.getElementById(`step-${activeStep}`);
      if (activeContent) {
        const windowHeight = window.innerHeight;
        const elementTop = activeContent.getBoundingClientRect().top;
        const offset = elementTop - (windowHeight / 2);
        
        window.scrollBy({
          top: offset,
          behavior: 'smooth'
        });
      }
    };
    scrollToContent();
  }, [activeStep]);

  useEffect(() => {
    const activeStepElement = document.querySelector(`#nav-step-${activeStep}`);
    if (activeStepElement) {
      const container = document.querySelector('.steps-container');
      const containerHeight = container.offsetHeight;
      const stepHeight = activeStepElement.offsetHeight;
      const stepTop = activeStepElement.offsetTop;
      
      // Calculate the center position
      const targetScroll = stepTop - (containerHeight / 2) + (stepHeight / 2);
      
      container.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });
    }
  }, [activeStep]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .steps-container {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;     /* Firefox */
        overflow-y: scroll;
      }
      .steps-container::-webkit-scrollbar {
        display: none;            /* Chrome, Safari and Opera */
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const toggleStepCompletion = (stepIndex) => {
    const newCompleted = new Set(completedSteps);
    if (completedSteps.has(stepIndex)) {
      newCompleted.delete(stepIndex);
    } else {
      newCompleted.add(stepIndex);
      
      // If this is the last step and it's being completed
      if (stepIndex === roadmap.content.steps.length - 1) {
        setShowConfetti(true);
        playSuccess();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Move to next step and play completion sound
        playComplete();
        setActiveStep(stepIndex + 1);
      }
    }
    setCompletedSteps(newCompleted);
    localStorage.setItem(`roadmap-${params.id}-progress`, JSON.stringify([...newCompleted]));
  };

  const progressPercentage = roadmap 
    ? Math.round((completedSteps.size / roadmap.content.steps.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-codeBlack-900 to-deepGreen-950">
        {/* Sticky Header Loading State */}
        <div className="sticky top-20 z-40 bg-codeBlack-900/80 border-b border-deepGreen-800/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="h-8 w-24 bg-deepGreen-900/30 rounded-lg animate-pulse"></div>
              <div className="flex items-center gap-4">
                <div className="h-4 w-24 bg-deepGreen-900/30 rounded animate-pulse"></div>
                <div className="w-32 h-2 bg-deepGreen-900/30 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Navigation Loading State */}
            <div className="lg:col-span-1">
              <div className="bg-codeBlack-900/50 rounded-2xl border border-deepGreen-800/30 p-6 sticky top-44">
                <div className="h-6 w-32 bg-deepGreen-900/30 rounded animate-pulse mb-6"></div>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((index) => (
                    <div key={index} className="bg-codeBlack-800/50 rounded-lg p-4 border border-deepGreen-800/30">
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-4 w-16 bg-deepGreen-900/30 rounded animate-pulse"></div>
                        <div className="h-4 w-4 bg-deepGreen-900/30 rounded-full animate-pulse"></div>
                      </div>
                      <div className="h-3 w-3/4 bg-deepGreen-900/30 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content Loading State */}
            <div className="lg:col-span-2">
              {/* Header Card Loading */}
              <div className="bg-codeBlack-900/50 rounded-2xl border border-deepGreen-800/30 overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-deepGreen-900 to-codeBlack-900 p-8">
                  <div className="h-8 w-2/3 bg-deepGreen-900/30 rounded animate-pulse mb-3"></div>
                  <div className="h-4 w-1/2 bg-deepGreen-900/30 rounded animate-pulse"></div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-deepGreen-900/30 rounded animate-pulse"></div>
                      <div className="h-4 w-20 bg-deepGreen-900/30 rounded animate-pulse"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-deepGreen-900/30 rounded animate-pulse"></div>
                      <div className="h-4 w-24 bg-deepGreen-900/30 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Steps Loading */}
              <div className="space-y-8">
                {[1, 2].map((index) => (
                  <div key={index} className="bg-codeBlack-900/50 rounded-2xl border border-deepGreen-800/30 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="h-8 w-1/3 bg-deepGreen-900/30 rounded animate-pulse"></div>
                      <div className="h-8 w-8 bg-deepGreen-900/30 rounded-full animate-pulse"></div>
                    </div>
                    <div className="space-y-4 mb-8">
                      <div className="h-4 w-full bg-deepGreen-900/30 rounded animate-pulse"></div>
                      <div className="h-4 w-5/6 bg-deepGreen-900/30 rounded animate-pulse"></div>
                      <div className="h-4 w-4/6 bg-deepGreen-900/30 rounded animate-pulse"></div>
                    </div>
                    <div className="flex gap-4">
                      <div className="h-12 w-40 bg-deepGreen-900/30 rounded-xl animate-pulse"></div>
                      <div className="h-12 w-40 bg-deepGreen-900/30 rounded-xl animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-codeBlack-900 to-deepGreen-950 flex items-center justify-center">
        <div className="text-center bg-codeBlack-900/50 border border-deepGreen-800/30 p-8 rounded-2xl max-w-md mx-4">
          <div className="w-16 h-16 bg-deepGreen-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiBookOpen className="w-8 h-8 text-deepGreen-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Roadmap Not Found</h1>
          <p className="text-gray-300 mb-6">The roadmap you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/roadmaps')}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-deepGreen-600 text-white hover:bg-deepGreen-700 transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back to Roadmaps
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-codeBlack-900 to-deepGreen-950">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={true}
          numberOfPieces={400}
        />
      )}
      {/* Sticky Header */}
      <div className="sticky top-20 z-40 bg-codeBlack-900/80 border-b border-deepGreen-800/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/roadmaps')}
              className="inline-flex items-center text-gray-300 hover:text-white"
            >
              <FiArrowLeft className="mr-2" />
              Back to Roadmaps
            </button>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-300">
                Progress: {progressPercentage}%
              </div>
              <div className="w-32">
                <Progress value={progressPercentage} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Steps Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-codeBlack-900/50 rounded-2xl border border-deepGreen-800/30 p-6 sticky top-44">
              <h2 className="text-lg font-semibold text-white mb-4">Steps Overview</h2>
              <div className="steps-container overflow-hidden" style={{ height: '400px', position: 'relative' }}>
                <div className="space-y-2">
                  {roadmap.content.steps.map((step, index) => (
                    <button
                      key={step.step}
                      id={`nav-step-${index}`}
                      onClick={() => setActiveStep(index)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        activeStep === index
                          ? 'bg-deepGreen-900/40 text-deepGreen-300 border border-deepGreen-800/30'
                          : 'hover:bg-codeBlack-800/50 border border-deepGreen-800/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${
                          completedSteps.has(index) ? 'text-deepGreen-400' : 'text-gray-300'
                        }`}>
                          Step {step.step}
                        </span>
                        {completedSteps.has(index) && (
                          <FaCheckCircle className="text-deepGreen-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                        {step.topic}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {/* Roadmap Header */}
            <div className="bg-codeBlack-900/50 rounded-2xl border border-deepGreen-800/30 overflow-hidden mb-8">
              <div className="bg-gradient-to-r from-deepGreen-900 to-codeBlack-900 p-8">
                <h1 className="text-3xl font-bold text-white mb-3">{roadmap.title}</h1>
                <p className="text-deepGreen-200">{roadmap.prompt}</p>
              </div>
              <div className="p-6 bg-gradient-to-b from-codeBlack-900/30">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-gray-300">
                    <FiClock className="text-deepGreen-400" />
                    <span>{roadmap.content.steps.length} Steps</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <FaCheckCircle className="text-deepGreen-400" />
                    <span>{completedSteps.size} Completed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Step Content */}
            <div className="space-y-8">
              {roadmap.content.steps.map((step, index) => (
                <div
                  key={step.step}
                  id={`step-${index}`}
                  onClick={() => setActiveStep(index)}
                  className={`bg-codeBlack-900/50 rounded-2xl border border-deepGreen-800/30 overflow-hidden transition-all duration-300 ${
                    activeStep === index ? 'ring-2 ring-deepGreen-500 ring-opacity-50' : 'cursor-pointer'
                  }`}
                  style={{ opacity: activeStep === index ? 1 : 0.5 }}
                >
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">
                        Step {step.step}: {step.topic}
                      </h2>
                      <button
                        onClick={(e) => {
                          if (activeStep === index) {
                            e.stopPropagation();
                            toggleStepCompletion(index);
                          }
                        }}
                        className={`p-2 rounded-full transition-colors ${
                          completedSteps.has(index)
                            ? 'bg-deepGreen-900/40 text-deepGreen-300'
                            : 'bg-codeBlack-800 text-gray-400'
                        } ${activeStep === index ? 'hover:bg-deepGreen-800/60' : 'pointer-events-none'}`}
                      >
                        <FaCheckCircle className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-gray-300 mb-6 leading-relaxed">
                      {step.description}
                    </p>

                    <div className="flex flex-wrap gap-4">
                      {step.documentation && (
                        <a
                          href={activeStep === index ? sanitizeUrl(step.documentation) : undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            if (activeStep !== index) {
                              e.preventDefault();
                            } else {
                              e.stopPropagation();
                            }
                          }}
                          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-deepGreen-900/40 text-deepGreen-300 ${
                            activeStep === index ? 'hover:bg-deepGreen-800/60' : 'pointer-events-none'
                          } transition-colors`}
                        >
                          <FiExternalLink className="text-lg" />
                          <span>Read Documentation</span>
                        </a>
                      )}
                      
                      {step.videoId && (
                        <a
                          href={activeStep === index ? `/learn/${step.videoId}` : undefined}
                          onClick={(e) => {
                            if (activeStep !== index) {
                              e.preventDefault();
                            } else {
                              e.stopPropagation();
                            }
                          }}
                          className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-codeBlack-800 text-red-300 ${
                            activeStep === index ? 'hover:bg-codeBlack-700' : 'pointer-events-none'
                          } transition-colors`}
                        >
                          <FaYoutube className="text-lg" />
                          <span>Watch Tutorial</span>
                          {step.videoDuration && (
                            <span className="text-sm text-red-300 bg-codeBlack-700 px-2 py-1 rounded-full ml-2">
                              {formatDuration(step.videoDuration)}
                            </span>
                          )}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
