"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
  FaVolumeUp,
  FaKeyboard,
  FaExternalLinkAlt,
  FaArrowDown,
  FaCopy,
  FaCode,
  FaChevronDown,
  FaChevronRight,
  FaFilter,
  FaSort,
  FaCaretDown,
} from "react-icons/fa";
import Link from "next/link";

interface ChatResponse {
  type: "redirect" | "scroll" | "answer";
  content: string;
  metadata?: {
    url?: string;
    elementId?: string;
    json?: any;
  };
  timestamp: string;
}

interface Chat {
  id: string;
  type: "voice" | "text";
  query: string;
  response: ChatResponse;
  timestamp: string;
}

interface Website {
  id: string;
  domain: string;
  chats: Chat[];
  lastChatAt: string;
}

interface ChatSession {
  id: string;
  startedAt: string;
  type: "voice" | "text";
  initialQuery: string;
  messageCount: number;
  website: {
    id: string;
    domain: string;
  };
}

type SortOption = "recent" | "oldest" | "longest" | "shortest";
type TimeRange = "all" | "last20" | "today" | "week" | "month";

const mockWebsites: Website[] = [
  {
    id: "1",
    domain: "mystore.shopify.com",
    lastChatAt: "2024-01-15T16:10:00Z",
    chats: [
      {
        id: "1",
        type: "voice",
        query: "Where can I find pricing information?",
        response: {
          type: "redirect",
          content: "I'll take you to our pricing page",
          metadata: { url: "/pricing" },
          timestamp: "2024-01-15T14:30:00Z",
        },
        timestamp: "2024-01-15T14:29:55Z",
      },
      {
        id: "1",
        type: "voice",
        query: "Where can I find pricing information?",
        response: {
          type: "redirect",
          content: "I'll take you to our pricing page",
          metadata: { url: "/pricing" },
          timestamp: "2024-01-15T14:30:00Z",
        },
        timestamp: "2024-01-15T14:29:55Z",
      },
      // ... more chats (hidden initially)
    ],
  },
  {
    id: "2",
    domain: "myblog.wordpress.com",
    lastChatAt: "2024-01-15T15:20:00Z",
    chats: [
      {
        id: "3",
        type: "text",
        query: "Get me product information",
        response: {
          type: "answer",
          content: "Here's the product information you requested",
          metadata: {
            json: {
              name: "Premium Widget",
              price: 99.99,
              features: ["Feature 1", "Feature 2"],
              availability: true,
            },
          },
          timestamp: "2024-01-15T16:10:00Z",
        },
        timestamp: "2024-01-15T16:09:45Z",
      },
      // ... more chats (hidden initially)
    ],
  },
];

const mockChatSessions: ChatSession[] = [
  {
    id: "session1",
    startedAt: "2024-01-15T16:10:00Z",
    type: "voice",
    initialQuery: "I need help finding the right product",
    messageCount: 5,
    website: {
      id: "1",
      domain: "mystore.shopify.com",
    },
  },
  {
    id: "session2",
    startedAt: "2024-01-15T15:45:00Z",
    type: "text",
    initialQuery: "What's included in the Pro plan?",
    messageCount: 3,
    website: {
      id: "1",
      domain: "mystore.shopify.com",
    },
  },
  {
    id: "session3",
    startedAt: "2024-01-15T14:30:00Z",
    type: "voice",
    initialQuery: "How do I contact support?",
    messageCount: 2,
    website: {
      id: "2",
      domain: "myblog.wordpress.com",
    },
  },
  // Add more sessions...
];

export default function Chats() {
  const searchParams = useSearchParams();
  const websiteId = searchParams.get("website");
  const filterType = searchParams.get("type") as "voice" | "text" | null;

  const [showWebsiteFilter, setShowWebsiteFilter] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [showSortFilter, setShowSortFilter] = useState(false);
  const [showTimeFilter, setShowTimeFilter] = useState(false);

  const [selectedWebsite, setSelectedWebsite] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<"all" | "voice" | "text">(
    "all"
  );
  const [selectedSort, setSelectedSort] = useState<SortOption>("recent");
  const [selectedTime, setSelectedTime] = useState<TimeRange>("all");

  const filteredSessions = websiteId
    ? mockChatSessions.filter((session) => session.website.id === websiteId)
    : mockChatSessions;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-brand-text-primary mb-2">
          Chat History
        </h1>
        <p className="text-brand-text-secondary">
          View past chat sessions across your websites
        </p>
      </header>

      <div className="flex flex-wrap gap-4 items-center">
        {/* Website Filter */}
        <div className="relative">
          <button
            onClick={() => setShowWebsiteFilter(!showWebsiteFilter)}
            className="px-4 py-2 bg-white rounded-xl border border-brand-lavender-light/20 
                     flex items-center gap-2 hover:border-brand-lavender-light/40 transition-colors"
          >
            <FaFilter className="w-4 h-4 text-brand-text-secondary" />
            <span className="text-sm text-brand-text-primary">
              {selectedWebsite === "all"
                ? "All Websites"
                : mockWebsites.find((w) => w.id === selectedWebsite)?.domain}
            </span>
            <FaCaretDown className="w-4 h-4 text-brand-text-secondary" />
          </button>

          {showWebsiteFilter && (
            <div className="absolute top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-brand-lavender-light/20 py-2 z-10">
              <button
                onClick={() => {
                  setSelectedWebsite("all");
                  setShowWebsiteFilter(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-brand-lavender-light/5 transition-colors
                         ${
                           selectedWebsite === "all"
                             ? "text-brand-accent"
                             : "text-brand-text-primary"
                         }`}
              >
                All Websites
              </button>
              {mockWebsites.map((website) => (
                <button
                  key={website.id}
                  onClick={() => {
                    setSelectedWebsite(website.id);
                    setShowWebsiteFilter(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-brand-lavender-light/5 transition-colors
                           ${
                             selectedWebsite === website.id
                               ? "text-brand-accent"
                               : "text-brand-text-primary"
                           }`}
                >
                  {website.domain}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat Type Filter */}
        <div className="relative">
          <button
            onClick={() => setShowTypeFilter(!showTypeFilter)}
            className="px-4 py-2 bg-white rounded-xl border border-brand-lavender-light/20 
                     flex items-center gap-2 hover:border-brand-lavender-light/40 transition-colors"
          >
            {selectedType === "voice" ? (
              <FaVolumeUp className="w-4 h-4 text-brand-text-secondary" />
            ) : selectedType === "text" ? (
              <FaKeyboard className="w-4 h-4 text-brand-text-secondary" />
            ) : (
              <FaFilter className="w-4 h-4 text-brand-text-secondary" />
            )}
            <span className="text-sm text-brand-text-primary">
              {selectedType === "all" ? "All Types" : `${selectedType} Chats`}
            </span>
            <FaCaretDown className="w-4 h-4 text-brand-text-secondary" />
          </button>

          {showTypeFilter && (
            <div className="absolute top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-brand-lavender-light/20 py-2 z-10">
              {["all", "voice", "text"].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type as "all" | "voice" | "text");
                    setShowTypeFilter(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-brand-lavender-light/5 transition-colors
                           ${
                             selectedType === type
                               ? "text-brand-accent"
                               : "text-brand-text-primary"
                           }`}
                >
                  {type === "all" ? "All Types" : `${type} Chats`}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sort Filter */}
        <div className="relative">
          <button
            onClick={() => setShowSortFilter(!showSortFilter)}
            className="px-4 py-2 bg-white rounded-xl border border-brand-lavender-light/20 
                     flex items-center gap-2 hover:border-brand-lavender-light/40 transition-colors"
          >
            <FaSort className="w-4 h-4 text-brand-text-secondary" />
            <span className="text-sm text-brand-text-primary">
              {selectedSort === "recent"
                ? "Most Recent"
                : selectedSort === "oldest"
                ? "Oldest First"
                : selectedSort === "longest"
                ? "Longest First"
                : "Shortest First"}
            </span>
            <FaCaretDown className="w-4 h-4 text-brand-text-secondary" />
          </button>

          {showSortFilter && (
            <div className="absolute top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-brand-lavender-light/20 py-2 z-10">
              {[
                { value: "recent", label: "Most Recent" },
                { value: "oldest", label: "Oldest First" },
                { value: "longest", label: "Longest First" },
                { value: "shortest", label: "Shortest First" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedSort(option.value as SortOption);
                    setShowSortFilter(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-brand-lavender-light/5 transition-colors
                           ${
                             selectedSort === option.value
                               ? "text-brand-accent"
                               : "text-brand-text-primary"
                           }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Time Range Filter */}
        <div className="relative">
          <button
            onClick={() => setShowTimeFilter(!showTimeFilter)}
            className="px-4 py-2 bg-white rounded-xl border border-brand-lavender-light/20 
                     flex items-center gap-2 hover:border-brand-lavender-light/40 transition-colors"
          >
            <FaFilter className="w-4 h-4 text-brand-text-secondary" />
            <span className="text-sm text-brand-text-primary">
              {selectedTime === "all"
                ? "All Time"
                : selectedTime === "last20"
                ? "Last 20"
                : selectedTime === "today"
                ? "Today"
                : selectedTime === "week"
                ? "This Week"
                : "This Month"}
            </span>
            <FaCaretDown className="w-4 h-4 text-brand-text-secondary" />
          </button>

          {showTimeFilter && (
            <div className="absolute top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-brand-lavender-light/20 py-2 z-10">
              {[
                { value: "all", label: "All Time" },
                { value: "last20", label: "Last 20" },
                { value: "today", label: "Today" },
                { value: "week", label: "This Week" },
                { value: "month", label: "This Month" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedTime(option.value as TimeRange);
                    setShowTimeFilter(false);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-brand-lavender-light/5 transition-colors
                           ${
                             selectedTime === option.value
                               ? "text-brand-accent"
                               : "text-brand-text-primary"
                           }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {filteredSessions.map((session) => (
          <div
            key={session.id}
            className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 p-6 hover:border-brand-lavender-light/40 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-brand-lavender-light/10 rounded-lg">
                  {session.type === "voice" ? (
                    <FaVolumeUp className="w-5 h-5 text-brand-accent" />
                  ) : (
                    <FaKeyboard className="w-5 h-5 text-brand-accent" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-brand-text-secondary">
                      {session.website.domain}
                    </span>
                    <span className="text-xs text-brand-text-secondary">•</span>
                    <span className="text-sm text-brand-text-secondary">
                      {new Date(session.startedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-brand-text-primary font-medium mb-2">
                    {session.initialQuery}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-brand-text-secondary">
                      {session.messageCount} messages in conversation
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href={`/app/chats/session?id=${session.id}`}
                className="flex items-center gap-1 text-brand-accent hover:text-brand-accent/80 transition-colors text-sm"
              >
                View conversation
                <FaChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Separate component for chat preview
function ChatPreview({ chat }: { chat: Chat }) {
  return (
    <div className="space-y-4">
      {/* Query */}
      <div className="flex items-start gap-4">
        <div className="p-2 bg-brand-lavender-light/10 rounded-lg">
          {chat.type === "voice" ? (
            <FaVolumeUp className="w-5 h-5 text-brand-accent" />
          ) : (
            <FaKeyboard className="w-5 h-5 text-brand-accent" />
          )}
        </div>
        <div>
          <p className="text-brand-text-primary font-medium mb-1">
            {chat.query}
          </p>
          <p className="text-sm text-brand-text-secondary">
            {new Date(chat.timestamp).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Response Preview */}
      <div className="ml-12 p-4 bg-brand-lavender-light/5 rounded-xl">
        <p className="text-brand-text-primary">{chat.response.content}</p>
        <div className="mt-2 text-sm">
          {chat.response.type === "redirect" && (
            <span className="text-brand-accent">Redirected to page</span>
          )}
          {chat.response.type === "scroll" && (
            <span className="text-brand-accent">Scrolled to element</span>
          )}
          {chat.response.type === "answer" && (
            <span className="text-brand-accent">Provided JSON response</span>
          )}
        </div>
      </div>
    </div>
  );
}
