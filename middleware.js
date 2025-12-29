import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/faq(.*)",
  "/api/webhooks(.*)",
]);

// Define admin routes
const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth();

  // Handle admin routes
  if (isAdminRoute(request)) {
    const loginPath = "/admin/login";
    const authPath = "/api/admin/auth";

    // Allow access to login page and auth endpoint
    if (
      request.nextUrl.pathname === loginPath ||
      request.nextUrl.pathname === authPath
    ) {
      return NextResponse.next();
    }

    // Check for admin authentication
    const authHeader = request.headers.get("authorization");
    const cookies = request.cookies;
    const sessionAuth = cookies.get("adminAuth")?.value;

    if (!authHeader && !sessionAuth) {
      // If it's an API request, return 401
      if (request.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      // Otherwise redirect to login
      return NextResponse.redirect(new URL(loginPath, request.url));
    }

    const credentials = authHeader ? authHeader.split(" ")[1] : sessionAuth;

    if (!credentials) {
      return NextResponse.redirect(new URL(loginPath, request.url));
    }

    try {
      const [username, password] = Buffer.from(credentials, "base64")
        .toString()
        .split(":");

      if (username !== "admin" || password !== "admin123") {
        return NextResponse.redirect(new URL(loginPath, request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL(loginPath, request.url));
    }

    return NextResponse.next();
  }

  // Protect all routes that are not public
  if (!isPublicRoute(request)) {
    if (!userId) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect_url", request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
