import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  const searchParams = request.nextUrl.search;

  try {
    console.log("Middleware running for path:", path);

    // Special case: if we're already on the error page, allow it through
    if (path.startsWith("/api/auth/error")) {
      console.log("Already on error page, allowing through");
      return NextResponse.next();
    }

    // Try to get the session token, with proper error handling
    let session = null;
    try {
      session = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });
    } catch (tokenError) {
      console.error("Error getting token in middleware:", tokenError);
      // Continue with session as null
    }

    console.log("Session in middleware:", session ? "exists" : "null", path);

    // Auth pages that logged-in users shouldn't access
    const authPages = ["/login", "/getStarted", "/forgotPassword"];

    // If user is logged in and trying to access auth pages, redirect to app
    if (session && authPages.includes(path)) {
      console.log(
        "Logged in user trying to access auth page, redirecting to app"
      );
      // Check if there's a callback URL with search params
      const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
      if (callbackUrl && callbackUrl.startsWith("/")) {
        console.log("Redirecting to callback URL:", callbackUrl);
        return NextResponse.redirect(new URL(callbackUrl, request.url));
      }
      console.log("Redirecting to /app");
      return NextResponse.redirect(new URL("/app", request.url));
    }

    // If user is not logged in and trying to access app routes
    if (!session && path.startsWith("/app")) {
      console.log(
        "Not logged in user trying to access app, redirecting to login"
      );
      // Redirect to the login page
      const loginUrl = new URL("/login", request.url);
      // Store the original intended destination with search params
      if (searchParams) {
        loginUrl.searchParams.set("callbackUrl", `${path}${searchParams}`);
      } else {
        loginUrl.searchParams.set("callbackUrl", path);
      }
      console.log("Redirecting to login with callbackUrl");
      return NextResponse.redirect(loginUrl);
    }

    console.log("Middleware allowing request to proceed");
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // On error for API routes, just proceed (let the API handle its own errors)
    if (path.startsWith("/api/")) {
      console.log("Error in middleware for API route, allowing through");
      return NextResponse.next();
    }
    // For non-API routes with errors, redirect to login as fallback
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Add auth pages to the matcher
    "/login",
    "/getStarted",
    "/forgotPassword",
    // App routes
    "/app/:path*",
    // Add API routes to allow protecting them
    "/api/user/:path*",
    "/api/auth/:path*",
  ],
};
