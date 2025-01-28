import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // If it's not a path starting with /app, let the request continue
  if (!path.startsWith("/app")) {
    return NextResponse.next();
  }

  const session = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If the user is not authenticated and trying to access /app routes
  if (!session && path.startsWith("/app")) {
    // Redirect to the login page
    const loginUrl = new URL("/login", request.url);
    // Store the original intended destination
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Match all paths starting with /app
    "/app/:path*",
    // Add any other paths you want to protect
  ],
};
