"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaArrowLeft,
  FaVolumeUp,
  FaKeyboard,
  FaExternalLinkAlt,
  FaArrowDown,
  FaCopy,
  FaCode,
} from "react-icons/fa";
import ReactMarkdown from "react-markdown";

interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
  metadata?: {
    url?: string;
    scrollToText?: string;
  };
}

interface ChatSessionDetails {
  id: string;
  type: "voice" | "text";
  website: {
    id: string;
    domain: string;
  };
  startedAt: string;
  messages: ChatMessage[];
}

export default function ChatSession() {
  const router = useRouter();
  const searchParams = useSearchParams()!;
  const sessionId = searchParams.get("id");
  const [session, setSession] = useState<ChatSessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;

      try {
        setLoading(true);
        const response = await fetch(
          `/api/chats/threadId?sessionId=${sessionId}`
        );
        if (!response.ok) throw new Error("Failed to fetch chat session");

        const data = await response.json();
        console.log("💬 Data:", data);
        setSession(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-20 bg-gray-200 rounded-xl" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-red-50 text-red-500 p-4 rounded-xl">
          {error || "Session not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-brand-text-secondary hover:text-brand-text-primary transition-colors"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span>Back to Chat History</span>
        </button>
        <a
          href={`https://${session.website.domain}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-text-secondary hover:text-brand-accent transition-colors"
        >
          <FaExternalLinkAlt className="w-4 h-4" />
        </a>
      </div>

      {/* Session Info */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2 bg-brand-lavender-light/10 rounded-lg">
            {session.type === "voice" ? (
              <FaVolumeUp className="w-5 h-5 text-brand-accent" />
            ) : (
              <FaKeyboard className="w-5 h-5 text-brand-accent" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-brand-text-primary mb-1">
              {session.website.domain}
            </h1>
            <p className="text-brand-text-secondary">
              {session.type === "voice" ? "Voice" : "Text"} chat started{" "}
              {new Date(session.startedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="space-y-6">
        {session.messages.map((message) => {
          console.log("Message type:", message.type);
          return (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] ${
                  message.type === "user"
                    ? "bg-brand-accent text-white rounded-2xl rounded-tr-sm"
                    : "bg-white border border-brand-lavender-light/20 rounded-2xl rounded-tl-sm"
                } p-4 shadow-sm space-y-3`}
              >
                {/* Message Content */}
                <div
                  className={
                    message.type === "user"
                      ? "text-white"
                      : "text-brand-text-primary"
                  }
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>

                {/* Metadata Display */}
                {message.type === "assistant" &&
                  message.metadata?.scrollToText && (
                    <div className="mt-3 pt-3 border-t border-brand-lavender-light/20">
                      <div className="flex items-center gap-2 text-sm text-brand-text-secondary">
                        <div className="p-1.5 rounded-md bg-brand-lavender-light/10">
                          <FaArrowDown className="w-3.5 h-3.5 text-brand-accent" />
                        </div>
                        <span>
                          Scrolled to:{" "}
                          <span className="font-medium text-brand-text-primary">
                            &quot;{message.metadata.scrollToText}&quot;
                          </span>
                        </span>
                      </div>
                    </div>
                  )}

                {/* URL Metadata if present */}
                {message.type === "assistant" && message.metadata?.url && (
                  <div className="mt-3 pt-3 border-t border-brand-lavender-light/20">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm text-brand-text-secondary">
                        <div className="p-1.5 rounded-md bg-brand-lavender-light/10">
                          <FaExternalLinkAlt className="w-3.5 h-3.5 text-brand-accent" />
                        </div>
                        <span>Redirect to this page:</span>
                      </div>

                      <div className="flex flex-col gap-2 ml-7">
                        <span className="text-sm text-brand-text-primary">
                          {message.metadata.url}
                        </span>

                        <a
                          href={`https://${session.website.domain}${message.metadata.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-brand-accent hover:text-brand-accent/80 transition-colors w-fit"
                        >
                          <span className="underline">Click here</span>
                          <FaExternalLinkAlt className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <div
                  className={`text-xs ${
                    message.type === "user"
                      ? "text-white/80"
                      : "text-brand-text-secondary"
                  }`}
                >
                  {new Date(message.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
