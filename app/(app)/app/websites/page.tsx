"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaGlobe,
  FaChartBar,
  FaExternalLinkAlt,
  FaCog,
  FaShoppingBag,
  FaNewspaper,
  FaFile,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

interface Website {
  id: string;
  domain: string;
  type: "WordPress" | "Shopify";
  plan: "Basic" | "Pro";
  status: "active" | "inactive";
  monthlyQueries: number;
  queryLimit: number;
  lastSync: string;
  content: {
    products?: number;
    blogPosts?: number;
    pages: number;
  };
}

const websites: Website[] = [
  {
    id: "1",
    domain: "mystore.shopify.com",
    type: "Shopify",
    plan: "Pro",
    status: "active",
    monthlyQueries: 25420,
    queryLimit: 50000,
    lastSync: "2024-01-15T10:30:00Z",
    content: {
      products: 150,
      pages: 12,
      blogPosts: 25,
    },
  },
  {
    id: "2",
    domain: "myblog.wordpress.com",
    type: "WordPress",
    plan: "Basic",
    status: "active",
    monthlyQueries: 4521,
    queryLimit: 10000,
    lastSync: "2024-01-14T15:45:00Z",
    content: {
      pages: 8,
      blogPosts: 45,
    },
  },
];

export default function Websites() {
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-brand-text-primary mb-2">
          Connected Websites
        </h1>
        <p className="text-brand-text-secondary">
          Manage and monitor your connected websites
        </p>
      </header>

      {/* Website List */}
      <div className="grid gap-6">
        {websites.map((website) => (
          <motion.div
            key={website.id}
            onClick={() => setSelectedWebsite(website)}
            className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 
                     overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="p-6 border-b border-brand-lavender-light/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-lavender-light/10 rounded-lg">
                    <FaGlobe className="w-6 h-6 text-brand-accent" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold text-brand-text-primary">
                        {website.domain}
                      </h2>
                      {website.status === "active" ? (
                        <span className="text-green-500 text-sm flex items-center gap-1">
                          <FaCheckCircle className="w-4 h-4" />
                          Active
                        </span>
                      ) : (
                        <span className="text-red-500 text-sm flex items-center gap-1">
                          <FaTimesCircle className="w-4 h-4" />
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-brand-text-secondary">
                      {website.type} • {website.plan} Plan
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={`https://${website.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-brand-text-secondary hover:text-brand-accent 
                             transition-colors rounded-lg hover:bg-brand-lavender-light/5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaExternalLinkAlt className="w-4 h-4" />
                  </a>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/app/websites/website?id=${website.id}`);
                    }}
                    className="p-2 text-brand-text-secondary hover:text-brand-accent 
                             transition-colors rounded-lg hover:bg-brand-lavender-light/5"
                  >
                    <FaCog className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="mt-6 bg-brand-lavender-light/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-brand-text-secondary">
                    Monthly Queries
                  </span>
                  <span className="text-sm font-medium text-brand-text-primary">
                    {website.monthlyQueries.toLocaleString()} /{" "}
                    {website.queryLimit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-brand-lavender-light/20 rounded-full h-2">
                  <div
                    className="bg-brand-accent h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        (website.monthlyQueries / website.queryLimit) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Content Summary */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                {website.content.products && (
                  <div className="flex items-center gap-2">
                    <FaShoppingBag className="w-4 h-4 text-brand-text-secondary" />
                    <span className="text-sm text-brand-text-secondary">
                      {website.content.products} Products
                    </span>
                  </div>
                )}
                {website.content.blogPosts && (
                  <div className="flex items-center gap-2">
                    <FaNewspaper className="w-4 h-4 text-brand-text-secondary" />
                    <span className="text-sm text-brand-text-secondary">
                      {website.content.blogPosts} Blog Posts
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FaFile className="w-4 h-4 text-brand-text-secondary" />
                  <span className="text-sm text-brand-text-secondary">
                    {website.content.pages} Pages
                  </span>
                </div>
              </div>
            </div>

            {/* Last Sync Info */}
            <div className="px-6 py-3 bg-brand-lavender-light/5 text-sm text-brand-text-secondary">
              Last synced: {new Date(website.lastSync).toLocaleString()}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {websites.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-brand-lavender-light/20">
          <FaGlobe className="w-12 h-12 text-brand-text-secondary/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-brand-text-primary mb-2">
            No Websites Connected
          </h3>
          <p className="text-brand-text-secondary mb-6">
            Connect your first website to get started
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2 bg-gradient-to-r from-brand-accent to-brand-lavender-dark 
                     text-white rounded-xl shadow-lg shadow-brand-accent/20
                     hover:shadow-xl hover:shadow-brand-accent/30 transition-shadow"
          >
            Connect Website
          </motion.button>
        </div>
      )}
    </div>
  );
}
