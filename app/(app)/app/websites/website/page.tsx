"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaGlobe,
  FaSync,
  FaCreditCard,
  FaShoppingBag,
  FaNewspaper,
  FaFile,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface ContentItem {
  id: string;
  title: string;
  url: string;
  type: "product" | "post" | "page";
  lastUpdated: string;
  aiRedirects: number;
}

const websiteData = {
  id: "1",
  domain: "mystore.shopify.com",
  type: "Shopify",
  plan: "Pro",
  status: "active" as "active" | "inactive",
  monthlyQueries: 25420,
  queryLimit: 50000,
  lastSync: "2024-01-15T10:30:00Z",
  globalStats: {
    totalAiRedirects: 5678,
    totalVoiceChats: 234,
    totalTextChats: 1234,
  },
  stats: {
    aiRedirects: 1234,
    totalRedirects: 5678,
    redirectRate: 21.7, // percentage
  },
  content: {
    products: [
      {
        id: "p1",
        title: "Premium Widget",
        url: "/products/premium-widget",
        type: "product" as const,
        description:
          "Our flagship widget with advanced features. This premium widget offers seamless integration, real-time updates, and customizable settings to meet all your needs. It's perfect for any website looking to enhance user engagement and drive sales. ",
        lastUpdated: "2024-01-10T14:30:00Z",
        price: 99.99,
        aiRedirects: 156,
      },
    ],
    blogPosts: [
      {
        id: "b1",
        title: "How to Use Our Widget",
        url: "/blog/how-to-use",
        type: "post" as const,
        content:
          "Learn how to maximize your widget's potential. In this comprehensive guide, we'll walk you through all the features and best practices for implementation. This guide covers everything from installation to customization, ensuring you get the most out of your widget. It's a must-read for anyone looking to enhance their website's functionality and drive more traffic to their store.",
        lastUpdated: "2024-01-12T09:15:00Z",
        author: "John Doe",
        aiRedirects: 89,
      },
    ],
    pages: [
      {
        id: "pg1",
        title: "About Us",
        url: "/about",
        type: "page" as const,
        content:
          "We're a team dedicated to creating the best possible solutions for our customers. Our journey began in 2020 when we realized there was a better way to connect customers to products. We've been working hard to build the best tools for our customers, and we're proud to say that we've been able to help thousands of businesses grow and succeed. We're a team of passionate individuals who are dedicated to helping our customers succeed. We're a team of passionate individuals who are dedicated to helping our customers succeed.",
        lastUpdated: "2024-01-05T11:20:00Z",
        template: "default",
        aiRedirects: 234,
      },
    ],
  },
};

export default function WebsiteSettings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const websiteId = searchParams.get("id");
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "posts" | "pages">(
    "products"
  );

  const handleSync = async () => {
    setIsSyncing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSyncing(false);
  };

  const ContentList = ({ items }: { items: ContentItem[] }) => {
    const [expandedItems, setExpandedItems] = useState<string[]>([]);

    const toggleExpand = (itemId: string) => {
      setExpandedItems((prev) =>
        prev.includes(itemId)
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId]
      );
    };

    return (
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-white rounded-lg border border-brand-lavender-light/20"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-brand-text-primary">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm text-brand-text-secondary">
                  {websiteData.domain}
                  {item.url}
                </p>
              </div>
              <a
                href={`https://${websiteData.domain}${item.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-brand-text-secondary hover:text-brand-accent 
                         transition-colors rounded-lg hover:bg-brand-lavender-light/5"
              >
                <FaExternalLinkAlt className="w-4 h-4" />
              </a>
            </div>

            <div className="text-sm text-brand-text-secondary mb-3">
              <p
                className={
                  expandedItems.includes(item.id) ? "" : "line-clamp-2"
                }
              >
                {(item as any).content || (item as any).description}
              </p>
              <button
                onClick={() => toggleExpand(item.id)}
                className="text-brand-accent hover:text-brand-accent/80 transition-colors mt-1"
              >
                {expandedItems.includes(item.id) ? "Show less" : "Read more..."}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs text-brand-text-secondary border-t border-brand-lavender-light/20 pt-3">
              <div className="flex items-center gap-4">
                <span>
                  Last updated:{" "}
                  {new Date(item.lastUpdated).toLocaleDateString()}
                </span>
                {item.type === "product" && (
                  <span className="font-medium">${(item as any).price}</span>
                )}
                {item.type === "post" && <span>By {(item as any).author}</span>}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-brand-accent">
                  {item.aiRedirects.toLocaleString()}
                </span>
                <span>AI redirects</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-brand-text-primary">
              {websiteData.domain}
            </h1>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                websiteData.status === "active"
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {websiteData.status}
            </span>
            <a
              href={`https://${websiteData.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-brand-text-secondary hover:text-brand-accent 
                       transition-colors rounded-lg hover:bg-brand-lavender-light/5"
            >
              <FaExternalLinkAlt className="w-4 h-4" />
            </a>
          </div>
          <p className="text-brand-text-secondary">
            {websiteData.type} • {websiteData.plan} Plan
          </p>
        </div>
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSync}
            disabled={isSyncing}
            className="px-4 py-2 text-brand-accent border border-brand-accent/20 
                     rounded-xl hover:bg-brand-accent/5 transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSync
              className={`inline-block mr-2 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Syncing..." : "Sync Content"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-gradient-to-r from-brand-accent to-brand-lavender-dark 
                     text-white rounded-xl shadow-lg shadow-brand-accent/20
                     hover:shadow-xl hover:shadow-brand-accent/30 transition-shadow"
          >
            <FaCreditCard className="inline-block mr-2" />
            Upgrade Plan
          </motion.button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 p-6">
        <h2 className="text-xl font-semibold text-brand-text-primary mb-4">
          Usage
        </h2>
        <div className="bg-brand-lavender-light/5 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-brand-text-secondary">
              Monthly Queries
            </span>
            <span className="text-sm font-medium text-brand-text-primary">
              {websiteData.monthlyQueries.toLocaleString()} /{" "}
              {websiteData.queryLimit.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-brand-lavender-light/20 rounded-full h-2">
            <div
              className="bg-brand-accent h-2 rounded-full transition-all"
              style={{
                width: `${
                  (websiteData.monthlyQueries / websiteData.queryLimit) * 100
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 p-6">
        <h2 className="text-xl font-semibold text-brand-text-primary mb-6">
          Global Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm text-brand-text-secondary mb-2">
              Total AI Redirects
            </h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-brand-accent">
                {websiteData.globalStats.totalAiRedirects.toLocaleString()}
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-sm text-brand-text-secondary mb-2">
              Voice Chats
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-brand-text-primary">
                {websiteData.globalStats.totalVoiceChats.toLocaleString()}
              </span>
              <Link
                href={`/app/chats?website=${websiteData.id}&type=voice`}
                className="text-sm text-brand-accent hover:text-brand-accent/80 transition-colors"
              >
                View chats →
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm text-brand-text-secondary mb-2">
              Text Chats
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-brand-text-primary">
                {websiteData.globalStats.totalTextChats.toLocaleString()}
              </span>
              <Link
                href={`/app/chats?website=${websiteData.id}&type=text`}
                className="text-sm text-brand-accent hover:text-brand-accent/80 transition-colors"
              >
                View chats →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 overflow-hidden">
        <div className="border-b border-brand-lavender-light/20">
          <div className="flex">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-6 py-4 text-sm font-medium transition-colors relative
                       ${
                         activeTab === "products"
                           ? "text-brand-accent"
                           : "text-brand-text-secondary"
                       }`}
            >
              <FaShoppingBag className="inline-block mr-2" />
              Products
              {activeTab === "products" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`px-6 py-4 text-sm font-medium transition-colors relative
                       ${
                         activeTab === "posts"
                           ? "text-brand-accent"
                           : "text-brand-text-secondary"
                       }`}
            >
              <FaNewspaper className="inline-block mr-2" />
              Blog Posts
              {activeTab === "posts" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("pages")}
              className={`px-6 py-4 text-sm font-medium transition-colors relative
                       ${
                         activeTab === "pages"
                           ? "text-brand-accent"
                           : "text-brand-text-secondary"
                       }`}
            >
              <FaFile className="inline-block mr-2" />
              Pages
              {activeTab === "pages" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent"
                />
              )}
            </button>
          </div>
        </div>
        <div className="p-6">
          <ContentList
            items={
              activeTab === "products"
                ? websiteData.content.products
                : activeTab === "posts"
                ? websiteData.content.blogPosts
                : websiteData.content.pages
            }
          />
        </div>
      </div>
    </div>
  );
}
