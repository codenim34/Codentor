"use client";

import { useUser } from "@clerk/nextjs"; // Import useUser from Clerk
import {
  Bot,
  ChevronRight,
  Globe2,
  GraduationCap,
  Map,
  Scale,
  Trophy,
  Users,
  Youtube,
  StickyNote,
  Mic,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

function FeatureCard({ icon, title, description, gradient }) {
  return (
    <div className="group relative bg-black/80 backdrop-blur-sm p-8 rounded-2xl border border-emerald-900/40 hover:border-emerald-500/70 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/20 overflow-hidden">
      {/* Animated background gradient */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${gradient || 'bg-gradient-to-br from-emerald-500 to-green-600'}`}></div>
      
      {/* Icon with glow effect */}
      <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-green-600/10 rounded-2xl flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-lg shadow-emerald-500/30">
        <div className="text-3xl">{icon}</div>
      </div>
      
      <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-emerald-400 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 leading-relaxed">
        {description}
      </p>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
}


const LandingPage = () => {
  const { isSignedIn, isLoaded } = useUser(); // Access user authentication state
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for mobile menu

  // While the user state is loading, you might want to show a loader or nothing
  if (!isLoaded) {
    return null; // Or a loader component
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950">
      {/* Header and Navigation */}
      <header className="relative">
        <nav className="fixed top-0 w-full z-20 bg-black/90 backdrop-blur-md border-b border-emerald-900/30">
          <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                Codentor
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-300 hover:text-emerald-400 transition-colors">
                Features
              </Link>
              <Link href="#about" className="text-gray-300 hover:text-emerald-400 transition-colors">
                About
              </Link>
              <Link href={isSignedIn ? "/dashboard" : "/sign-in"}>
                <button className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-2 rounded-full font-medium hover:from-emerald-600 hover:to-green-700 transition-all shadow-lg shadow-emerald-500/30">
                  {isSignedIn ? "Dashboard" : "Get Started"}
                </button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className={`w-full h-0.5 bg-emerald-400 transition-all ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                <div className={`w-full h-0.5 bg-emerald-400 transition-all ${isMenuOpen ? 'opacity-0' : ''}`}></div>
                <div className={`w-full h-0.5 bg-emerald-400 transition-all ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
              </div>
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden bg-black/95 backdrop-blur-md border-b border-emerald-900/30">
              <div className="px-6 py-4 space-y-4">
                <Link href="#features" className="block text-gray-300 hover:text-emerald-400 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  Features
                </Link>
                <Link href="#about" className="block text-gray-300 hover:text-emerald-400 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  About
                </Link>
                <Link href={isSignedIn ? "/dashboard" : "/sign-in"} onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-full font-medium hover:from-emerald-600 hover:to-green-700 transition-all">
                    {isSignedIn ? "Dashboard" : "Get Started"}
                  </button>
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="inline-block px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-8">
                <span className="text-emerald-400 text-sm font-medium">🚀 Now Live in Bangladesh</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Master Code.
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                  Build Future.
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Your all-in-one platform to learn, practice, and excel in programming. 
                Join a community of developers building the future of Bangladesh's tech ecosystem.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
                <Link href={isSignedIn ? "/dashboard" : "/sign-in"}>
                  <button className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-emerald-600 hover:to-green-700 transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center">
                    Try Codentor Now <ChevronRight className="ml-2 h-5 w-5" />
                  </button>
                </Link>
                <Link href="#features">
                  <button className="border-2 border-emerald-500/50 text-emerald-400 px-8 py-4 rounded-full text-lg font-semibold hover:border-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all">
                    Explore Features
                  </button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span>1000+ Active Learners</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span>Free Forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span>24/7 AI Support</span>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Features Section */}
        <section id="features" className="py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Everything You Need to Excel
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                A comprehensive platform designed to take you from beginner to professional developer
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<GraduationCap className="w-8 h-8" />}
                title="CodeLab"
                description="Learn code with live mentors and AI assistance. Real-time collaboration, instant execution, and personalized guidance for accelerated learning."
                gradient="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600"
              />
              <FeatureCard
                icon={<Youtube className="w-8 h-8" />}
                title="Interactive Learning"
                description="High-quality video tutorials paired with hands-on coding exercises. Learn by doing, not just watching. Master concepts through practice."
                gradient="bg-gradient-to-br from-green-500 via-emerald-500 to-cyan-600"
              />
              <FeatureCard
                icon={<Map className="w-8 h-8" />}
                title="Curated Roadmaps"
                description="Follow proven learning paths designed to take you from zero to professional developer. Structured curriculum for success."
                gradient="bg-gradient-to-br from-teal-500 via-emerald-500 to-green-600"
              />
              <FeatureCard
                icon={<Bot className="w-8 h-8" />}
                title="AI Interview Practice"
                description="Practice with AI-powered mock interviews. Get instant feedback on your technical skills, communication, and problem-solving approach."
                gradient="bg-gradient-to-br from-emerald-500 via-green-600 to-lime-600"
              />
              <FeatureCard
                icon={<Users className="w-8 h-8" />}
                title="Community Driven"
                description="Connect with mentors and peers worldwide. Learn together, share knowledge, and grow in a collaborative environment."
                gradient="bg-gradient-to-br from-green-600 via-emerald-500 to-teal-500"
              />
              <FeatureCard
                icon={<Trophy className="w-8 h-8" />}
                title="Learning Analytics"
                description="Track your progress with detailed analytics and AI-powered insights. Get personalized recommendations to optimize your learning journey."
                gradient="bg-gradient-to-br from-lime-500 via-green-500 to-emerald-600"
              />
              <FeatureCard
                icon={<StickyNote className="w-8 h-8" />}
                title="Smart Notes"
                description="Organize your learning with intelligent note-taking. Capture insights, code snippets, and key concepts with AI-powered organization and search."
                gradient="bg-gradient-to-br from-emerald-600 via-green-500 to-teal-500"
              />
              <FeatureCard
                icon={<Mic className="w-8 h-8" />}
                title="Voice Agent"
                description="Interact with AI through natural voice commands. Practice coding interviews, get explanations, and learn hands-free with our voice-enabled assistant."
                gradient="bg-gradient-to-br from-green-500 via-emerald-600 to-cyan-500"
              />
            </div>
          </div>
        </section>

        

        {/* CTA Section */}
        <section className="py-20 px-6 bg-gradient-to-br from-black via-emerald-950 to-black relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(16,185,129,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(16,185,129,0.1),transparent_50%)]"></div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-block px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-6">
              <span className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                Transform Your Career Today
              </span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Start Your Developer Journey
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                With AI-Powered Learning
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of developers learning, building, and growing their careers with personalized AI guidance and real-world practice.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href={isSignedIn ? "/dashboard" : "/sign-in"}>
                <button className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-10 py-4 rounded-full text-lg font-bold hover:from-emerald-600 hover:to-green-700 transition-all shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 hover:scale-105 duration-300 flex items-center justify-center gap-2">
                  {isSignedIn ? "Go to Dashboard" : "Join Now - It's Free"}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="#features">
                <button className="border-2 border-emerald-500/50 text-emerald-400 px-10 py-4 rounded-full text-lg font-bold hover:border-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-all hover:scale-105 duration-300">
                  Explore Features
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-black/40 backdrop-blur-sm border border-emerald-800/30 rounded-xl">
                <div className="text-3xl font-bold text-emerald-400 mb-2">1000+</div>
                <div className="text-gray-400">Active Learners</div>
              </div>
              <div className="p-6 bg-black/40 backdrop-blur-sm border border-emerald-800/30 rounded-xl">
                <div className="text-3xl font-bold text-emerald-400 mb-2">100%</div>
                <div className="text-gray-400">Free Forever</div>
              </div>
              <div className="p-6 bg-black/40 backdrop-blur-sm border border-emerald-800/30 rounded-xl">
                <div className="text-3xl font-bold text-emerald-400 mb-2">24/7</div>
                <div className="text-gray-400">AI Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative bg-gradient-to-b from-black via-gray-900 to-black text-gray-400 py-20 border-t border-emerald-800/30 overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.05),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.05),transparent_50%)]"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            {/* Top Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
              {/* Brand Section */}
              <div className="lg:col-span-2">
                <Link href="/" className="inline-block mb-4">
                  <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                    Codentor
                  </span>
                </Link>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Empowering developers to learn, practice, and excel in programming with AI-powered guidance and real-world experience.
                </p>
                <div className="flex gap-4">
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800/50 border border-emerald-800/30 rounded-lg flex items-center justify-center hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300">
                    <svg className="w-5 h-5 text-gray-400 hover:text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800/50 border border-emerald-800/30 rounded-lg flex items-center justify-center hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300">
                    <svg className="w-5 h-5 text-gray-400 hover:text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800/50 border border-emerald-800/30 rounded-lg flex items-center justify-center hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300">
                    <svg className="w-5 h-5 text-gray-400 hover:text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Platform Links */}
              <div>
                <h3 className="text-white font-bold text-lg mb-6 relative inline-block">
                  Platform
                  <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-emerald-400 to-transparent"></span>
                </h3>
                <ul className="space-y-3">
                  <li><Link href="/learn" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center group">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-emerald-400 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                    Learn Hub
                  </Link></li>
                  <li><Link href="/roadmaps" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center group">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-emerald-400 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                    Roadmaps
                  </Link></li>
                  <li><Link href="/codelab" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center group">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-emerald-400 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                    CodeLab
                  </Link></li>
                  <li><Link href="/interview" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center group">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-emerald-400 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                    AI Interview
                  </Link></li>
                </ul>
              </div>

              {/* Community Links */}
              <div>
                <h3 className="text-white font-bold text-lg mb-6 relative inline-block">
                  Community
                  <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-emerald-400 to-transparent"></span>
                </h3>
                <ul className="space-y-3">
                  <li><Link href="/connections" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center group">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-emerald-400 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                    Connections
                  </Link></li>
                  <li><Link href="/feed" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center group">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-emerald-400 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                    Dev Feed
                  </Link></li>
                  <li><Link href="/tasks" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center group">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-emerald-400 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                    Task Manager
                  </Link></li>
                </ul>
              </div>

              {/* Resources Links */}
              <div>
                <h3 className="text-white font-bold text-lg mb-6 relative inline-block">
                  Resources
                  <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-gradient-to-r from-emerald-400 to-transparent"></span>
                </h3>
                <ul className="space-y-3">
                  <li><Link href="/dashboard" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center group">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-emerald-400 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                    Dashboard
                  </Link></li>
                  <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center group">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-emerald-400 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                    Documentation
                  </a></li>
                  <li><a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors duration-200 flex items-center group">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-emerald-400 mr-0 group-hover:mr-2 transition-all duration-200"></span>
                    Help Center
                  </a></li>
                </ul>
              </div>
            </div>
            
            {/* Bottom Section */}
            <div className="border-t border-emerald-800/30 pt-10">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <p className="text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Codentor. All rights reserved.
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <Link href="/privacy" className="text-gray-500 hover:text-emerald-400 transition-colors">
                      Privacy Policy
                    </Link>
                    <span className="text-gray-700">•</span>
                    <Link href="/terms" className="text-gray-500 hover:text-emerald-400 transition-colors">
                      Terms of Service
                    </Link>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Made with</span>
                  <span className="text-emerald-400 animate-pulse">❤</span>
                  <span>in Bangladesh</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </header>
    </div>
  );
};

export default LandingPage;
