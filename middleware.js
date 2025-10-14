import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)'
]);

export default clerkMiddleware(async (auth, request) => {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin') || 
      request.nextUrl.pathname.startsWith('/api/admin')) {
    
    const adminPath = "/admin";
    const loginPath = "/admin/login";
    const authPath = "/api/admin/auth";

    // Allow access to login page and auth endpoint
    if (request.nextUrl.pathname === loginPath || 
        request.nextUrl.pathname === authPath) {
      return NextResponse.next();
    }

    // Check for admin authentication
    const authHeader = request.headers.get("authorization");
    const cookies = request.cookies;
    const sessionAuth = cookies.get("adminAuth")?.value;

    if (!authHeader && !sessionAuth) {
      // If it's an API request, return 401
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
      // Otherwise redirect to login
      return NextResponse.redirect(new URL(loginPath, request.url));
    }

    const credentials = authHeader 
      ? authHeader.split(" ")[1] 
      : sessionAuth;

    if (!credentials) {
      return NextResponse.redirect(new URL(loginPath, request.url));
    }

    const [username, password] = Buffer.from(credentials, "base64")
      .toString()
      .split(":");

    if (username !== "admin" || password !== "admin123") {
      return NextResponse.redirect(new URL(loginPath, request.url));
    }

    return NextResponse.next();
  }

  // For non-admin routes, protect routes that are not public
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
