"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CompleteWebsitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const completeSetup = async () => {
      try {
        const response = await fetch(
          `/api/stripe/session?session_id=${sessionId}`
        );
        if (!response.ok) throw new Error("Failed to complete setup");

        // Redirect to websites page after completion
        router.push("/app/websites");
      } catch (error) {
        console.error("Error completing setup:", error);
        router.push("/app/websites?error=setup-failed");
      }
    };

    if (sessionId) {
      completeSetup();
    }
  }, [sessionId, router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-accent"></div>
        </div>
        <h1 className="text-2xl font-bold text-brand-text-primary">
          Setting Up Your Website
        </h1>
        <p className="text-brand-text-secondary max-w-md mx-auto">
          We're configuring your website with Voicero.AI. This will only take a
          moment...
        </p>
      </div>
    </div>
  );
}
