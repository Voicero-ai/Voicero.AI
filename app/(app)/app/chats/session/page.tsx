"use client";

import React from "react";
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

interface ChatMessage {
  id: string;
  type: "user" | "ai";
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

const mockSession: ChatSessionDetails = {
  id: "session1",
  type: "voice",
  website: {
    id: "1",
    domain: "mystore.shopify.com",
  },
  startedAt: "2024-01-15T16:10:00Z",
  messages: [
    {
      id: "m1",
      type: "user",
      content: "I need help finding the pricing for enterprise plans",
      timestamp: "2024-01-15T16:10:00Z",
    },
    {
      id: "m2",
      type: "ai",
      content:
        "I'll help you find the enterprise pricing information. Let me take you to our pricing page where you can see all the details.",
      timestamp: "2024-01-15T16:10:02Z",
      metadata: {
        url: "/pricing#enterprise",
      },
    },
    {
      id: "m3",
      type: "user",
      content: "What features are included?",
      timestamp: "2024-01-15T16:10:15Z",
    },
    {
      id: "m4",
      type: "ai",
      content:
        "Let me show you the enterprise features section. Here you'll find a complete list of all included features.",
      timestamp: "2024-01-15T16:10:17Z",
      metadata: {
        scrollToText: "Enterprise Features",
      },
    },
    {
      id: "m5",
      type: "user",
      content: "Can you give me a summary of the features?",
      timestamp: "2024-01-15T16:10:30Z",
    },
    {
      id: "m6",
      type: "ai",
      content: `Here's a summary of the enterprise plan features:

• Unlimited users
• 24/7 priority support
• Custom integrations
• Advanced analytics
• SLA guarantees

The Enterprise plan requires a minimum of 50 seats and has custom pricing based on your needs.`,
      timestamp: "2024-01-15T16:10:32Z",
    },
  ],
};

export default function ChatSession() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("id");

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
          href={`https://${mockSession.website.domain}`}
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
            {mockSession.type === "voice" ? (
              <FaVolumeUp className="w-5 h-5 text-brand-accent" />
            ) : (
              <FaKeyboard className="w-5 h-5 text-brand-accent" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-brand-text-primary mb-1">
              {mockSession.website.domain}
            </h1>
            <p className="text-brand-text-secondary">
              {mockSession.type === "voice" ? "Voice" : "Text"} chat started{" "}
              {new Date(mockSession.startedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="space-y-6">
        {mockSession.messages.map((message) => (
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
              } p-4 shadow-sm`}
            >
              <p
                className={
                  message.type === "user"
                    ? "text-white"
                    : "text-brand-text-primary"
                }
              >
                {message.content}
              </p>

              {/* Metadata Display */}
              {message.type === "ai" && message.metadata && (
                <div className="mt-3 pt-3 border-t border-brand-lavender-light/20">
                  {message.metadata.url && (
                    <a
                      href={`https://${mockSession.website.domain}${message.metadata.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-brand-accent hover:text-brand-accent/80 transition-colors"
                    >
                      <FaExternalLinkAlt className="w-4 h-4" />
                      View page
                    </a>
                  )}

                  {message.metadata.scrollToText && (
                    <div className="flex items-center gap-2 text-sm text-brand-accent">
                      <FaArrowDown className="w-4 h-4" />
                      Scrolled to "{message.metadata.scrollToText}"
                    </div>
                  )}
                </div>
              )}

              <div
                className={`text-xs mt-2 ${
                  message.type === "user"
                    ? "text-white/80"
                    : "text-brand-text-secondary"
                }`}
              >
                {new Date(message.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
