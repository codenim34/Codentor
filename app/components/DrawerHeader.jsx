"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  Home,
  BookOpen,
  Code,
  MessageSquare,
  Trophy,
  HelpCircle,
  ChevronLeft,
} from "lucide-react";

const DrawerHeader = () => {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Home" },
    { href: "/tasks", label: "Task Manager" },
    { href: "/feed", label: "Feed" },
    { href: "/connections", label: "Connections" },
    { href: "/learn", label: "Learn Hub" },
    { href: "/codelab", label: "Code Lab" },
    { href: "/quests", label: "Challenges" },
  ];

  return (
    <>
      {/* Drawer Button - Small shutter button */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="fixed top-4 left-4 z-50 bg-gray-800/90 backdrop-blur-sm border border-emerald-500/30 rounded-lg p-2 text-emerald-400 hover:bg-gray-700/90 transition-all duration-200 shadow-lg"
        title="Open Navigation"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Drawer Content */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-gray-900 border-r border-emerald-500/30 z-50 transform transition-transform duration-300 ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-emerald-500/30">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
              Codentor
            </span>
          </Link>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="p-1 text-gray-400 hover:text-emerald-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center space-x-3 px-3 py-3 text-gray-300 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all duration-200 group"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <Icon className="w-5 h-5 group-hover:text-emerald-400" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-emerald-500/30">
          <div className="flex items-center space-x-3">
            <UserButton
              afterSignOutUrl="/"
              signOutCallback={() => {
                router.push("/");
              }}
            />
            <span className="text-sm text-gray-400">Account</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default DrawerHeader;
