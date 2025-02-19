import { NextRequest, NextResponse } from "next/server";

export function cors(req: NextRequest, res: NextResponse): NextResponse {
  // Set headers to allow everything
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "*");
  res.headers.set("Access-Control-Allow-Headers", "*");
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Access-Control-Max-Age", "86400"); // 24 hours

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.headers.set("Content-Length", "0");
    res.headers.set("Content-Type", "text/plain");
  }

  return res;
}
