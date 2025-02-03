import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  const searchParams = request.nextUrl.search; // Get search params

  const session = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Auth pages that logged-in users shouldn't access
  const authPages = ["/login", "/getStarted", "/forgotPassword"];

  // If user is logged in and trying to access auth pages, redirect to app
  if (session && authPages.includes(path)) {
    // Check if there's a callback URL with search params
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    if (callbackUrl) {
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    }
    return NextResponse.redirect(new URL("/app", request.url));
  }

  // If user is not logged in and trying to access app routes
  if (!session && path.startsWith("/app")) {
    // Redirect to the login page
    const loginUrl = new URL("/login", request.url);
    // Store the original intended destination with search params
    loginUrl.searchParams.set("callbackUrl", `${path}${searchParams}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
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
  ],
};
