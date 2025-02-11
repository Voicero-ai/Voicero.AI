import { NextRequest, NextResponse } from "next/server";

export async function cors(req: NextRequest, res: NextResponse) {
  // Get origin from request
  const origin = req.headers.get("origin") || "*";

  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400", // 24 hours
  };

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers,
    });
  }

  // Add headers to response
  Object.entries(headers).forEach(([key, value]) => {
    res.headers.set(key, value);
  });

  return res;
}
