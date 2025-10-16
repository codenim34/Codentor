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

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm p-6 md:p-8 rounded-xl border border-emerald-900/30 hover:border-emerald-500/50 transition-all hover:shadow-xl hover:shadow-emerald-500/10">
      <div className="w-16 h-16 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-400 mb-6">
        {icon}
      </div>
      <h3 className="text-2xl font-semibold mb-3 text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
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
                <Link href={isSignedIn ? "/codelab" : "/sign-in"}>
                  <button className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-emerald-600 hover:to-green-700 transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center">
                    Try CodeLab Now <ChevronRight className="ml-2 h-5 w-5" />
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
                icon={<GraduationCap />}
                title="CodeLab"
                description="Learn code with live mentors and AI assistance. Real-time collaboration, instant execution, and personalized guidance."
              />
              <FeatureCard
                icon={<Youtube />}
                title="Interactive Learning"
                description="High-quality video tutorials paired with hands-on coding exercises. Learn by doing, not just watching."
              />
              <FeatureCard
                icon={<Map />}
                title="Curated Roadmaps"
                description="Follow proven learning paths designed to take you from zero to professional developer."
              />
              <FeatureCard
                icon={<Bot />}
                title="AI Code Review"
                description="Instant feedback on your code with AI-powered reviews and optimization suggestions."
              />
              <FeatureCard
                icon={<Users />}
                title="Community Driven"
                description="Connect with mentors and peers. Learn together in a collaborative environment."
              />
              <FeatureCard
                icon={<Trophy />}
                title="Coding Quests"
                description="Level up with gamified challenges. Build real projects while earning achievements."
              />
            </div>
          </div>
        </section>

        

        {/* CTA Section */}
        <section className="py-20 px-6 bg-gradient-to-r from-emerald-900 via-green-900 to-emerald-950">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Start Your Developer Journey Today
            </h2>
            <p className="text-xl text-emerald-100 mb-12 max-w-2xl mx-auto">
              Join thousands of developers learning, building, and growing their careers with Codentor.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href={isSignedIn ? "/dashboard" : "/sign-in"}>
                <button className="bg-white text-emerald-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-emerald-50 transition-all shadow-xl shadow-emerald-500/30">
                  {isSignedIn ? "Go to Dashboard" : "Join Now - It's Free"}
                </button>
              </Link>
              <Link href="#features">
                <button className="border-2 border-white/20 text-white px-8 py-4 rounded-full text-lg font-semibold hover:border-white/40 hover:bg-white/10 transition-all">
                  Learn More
                </button>
              </Link>
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
