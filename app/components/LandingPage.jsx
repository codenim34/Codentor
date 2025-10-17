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
        <footer className="bg-black text-gray-400 py-16 border-t border-emerald-900/20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              <div>
                <h3 className="text-emerald-400 font-semibold text-lg mb-4">Platform</h3>
                <ul className="space-y-2">
                  <li><Link href="/learn" className="hover:text-emerald-400 transition-colors">Learn</Link></li>
                  <li><Link href="/roadmaps" className="hover:text-emerald-400 transition-colors">Roadmaps</Link></li>
                  <li><Link href="/playground" className="hover:text-emerald-400 transition-colors">Playground</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-emerald-400 font-semibold text-lg mb-4">Community</h3>
                <ul className="space-y-2">
                  <li><Link href="/dev-discuss" className="hover:text-emerald-400 transition-colors">Dev Discuss</Link></li>
                  <li><Link href="/quests" className="hover:text-emerald-400 transition-colors">Quests</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-emerald-400 font-semibold text-lg mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><Link href="/about" className="hover:text-emerald-400 transition-colors">About</Link></li>
                  <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-emerald-400 font-semibold text-lg mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><Link href="/privacy" className="hover:text-emerald-400 transition-colors">Privacy</Link></li>
                  <li><Link href="/terms" className="hover:text-emerald-400 transition-colors">Terms</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-emerald-900/20 pt-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                  Codentor
                </span>
              </div>
              <p className="text-gray-500">
                &copy; {new Date().getFullYear()} Codentor. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </header>
    </div>
  );
};

export default LandingPage;
