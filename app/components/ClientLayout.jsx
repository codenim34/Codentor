"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Header from "./Header";
import DrawerHeader from "./DrawerHeader";
import dynamic from 'next/dynamic';

// Dynamically import TourGuide with no SSR
const TourGuide = dynamic(() => import("@/components/TourGuide"), {
  ssr: false,
});

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Normalize the pathname to handle trailing slashes
  const normalizedPath = pathname.replace(/\/+$/, "");
  const isHomePage = normalizedPath === "" || normalizedPath === "/";

  // Define paths where Header should not be rendered
  const excludedPaths = ["/sign-in", "/sign-up"];
  const isExcludedPath =
    excludedPaths.includes(normalizedPath) ||
    pathname === "/not-found" ||
    pathname.startsWith("/admin");

  // Paths that should use drawer header (all except dashboard and codelab)
  const useDrawerHeader = !isHomePage && 
    !normalizedPath.startsWith("/dashboard") && 
    !normalizedPath.startsWith("/codelab") &&
    !isExcludedPath;

  // Paths that should use regular header (dashboard only)
  const useRegularHeader = !isHomePage && 
    normalizedPath.startsWith("/dashboard") && 
    !isExcludedPath;

  // Don't render any layout components for admin paths
  if (pathname.startsWith("/admin")) {
    return children;
  }

  return (
    <>
      {/* Conditionally render Header or DrawerHeader */}
      {useRegularHeader && <Header />}
      {useDrawerHeader && <DrawerHeader />}

      <main
        className={`w-full transition-all duration-300 ${
          useRegularHeader ? "pt-16" : ""
        }`}
      >
        <div className="flex items-start justify-center min-h-screen w-full">
          <div className="w-full">
            {children}
            {isMounted && !isExcludedPath && <TourGuide />}
          </div>
        </div>
      </main>
    </>
  );
}
