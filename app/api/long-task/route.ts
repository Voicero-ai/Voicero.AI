import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Increase the default timeout for this route
export const maxDuration = 300; // 5 minutes

async function longRunningProcess() {
  // Simulate a long-running task
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ result: "Task completed successfully" });
    }, 15000); // 15 seconds delay
  });
}

export async function POST(request: NextRequest) {
  try {
    // Enable streaming for long responses
    const encoder = new TextEncoder();
    const customStream = new TransformStream();
    const writer = customStream.writable.getWriter();

    // Start the long process
    const result = await longRunningProcess();

    // Write the result
    await writer.write(encoder.encode(JSON.stringify(result)));
    await writer.close();

    return new NextResponse(customStream.readable, {
      headers: {
        "Content-Type": "application/json",
        "Transfer-Encoding": "chunked",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in long-running task:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
