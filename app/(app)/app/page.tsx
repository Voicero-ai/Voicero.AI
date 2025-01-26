"use client";

import React from "react";
import Link from "next/link";
import {
  FaShopify,
  FaWordpress,
  FaRocket,
  FaChartLine,
  FaComments,
  FaMicrophone,
  FaExternalLinkAlt,
  FaPlus,
  FaKey,
  FaCog,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const mockChartData = [
  { date: "Jan 1", redirects: 240, chats: 150 },
  { date: "Jan 2", redirects: 300, chats: 180 },
  { date: "Jan 3", redirects: 280, chats: 190 },
  { date: "Jan 4", redirects: 320, chats: 200 },
  { date: "Jan 5", redirects: 350, chats: 220 },
  { date: "Jan 7", redirects: 380, chats: 250 },
  { date: "Jan 8", redirects: 400, chats: 280 },
];

const mockWebsites = [
  {
    id: "1",
    domain: "mystore.shopify.com",
    platform: "shopify",
    monthlyChats: 1234,
    aiRedirects: 567,
    status: "active",
  },
  {
    id: "2",
    domain: "blog.wordpress.com",
    platform: "wordpress",
    monthlyChats: 890,
    aiRedirects: 345,
    status: "active",
  },
];

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-lavender-light/10 rounded-lg">
              <FaComments className="w-5 h-5 text-brand-accent" />
            </div>
            <h3 className="text-brand-text-secondary font-medium">
              Total Chats
            </h3>
          </div>
          <p className="text-3xl font-bold text-brand-text-primary">2,124</p>
          <p className="text-sm text-green-600 mt-1">↑ 12% from last month</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-lavender-light/10 rounded-lg">
              <FaMicrophone className="w-5 h-5 text-brand-accent" />
            </div>
            <h3 className="text-brand-text-secondary font-medium">
              Voice Chats
            </h3>
          </div>
          <p className="text-3xl font-bold text-brand-text-primary">912</p>
          <p className="text-sm text-green-600 mt-1">↑ 18% from last month</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-lavender-light/10 rounded-lg">
              <FaChartLine className="w-5 h-5 text-brand-accent" />
            </div>
            <h3 className="text-brand-text-secondary font-medium">
              AI Redirects
            </h3>
          </div>
          <p className="text-3xl font-bold text-brand-text-primary">912</p>
          <p className="text-sm text-green-600 mt-1">↑ 8% from last month</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-lavender-light/10 rounded-lg">
              <FaRocket className="w-5 h-5 text-brand-accent" />
            </div>
            <h3 className="text-brand-text-secondary font-medium">
              Active Sites
            </h3>
          </div>
          <p className="text-3xl font-bold text-brand-text-primary">2</p>
          <p className="text-sm text-brand-text-secondary mt-1">
            Shopify & WordPress
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-brand-text-primary">
              Activity Overview
            </h2>
            <select className="px-3 py-1 border border-brand-lavender-light/20 rounded-lg text-sm text-brand-text-secondary">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockChartData}>
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="redirects"
                  stroke="#6366f1"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="chats"
                  stroke="#a855f7"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 p-6">
            <h2 className="text-xl font-semibold text-brand-text-primary mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                href="/app/websites/new"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-lavender-light/5 transition-colors group"
              >
                <div className="p-2 bg-brand-lavender-light/10 rounded-lg group-hover:bg-brand-lavender-light/20">
                  <FaPlus className="w-4 h-4 text-brand-accent" />
                </div>
                <div>
                  <h3 className="font-medium text-brand-text-primary">
                    Add Website
                  </h3>
                  <p className="text-sm text-brand-text-secondary">
                    Connect a new site
                  </p>
                </div>
              </Link>

              <Link
                href="/app/access-keys"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-lavender-light/5 transition-colors group"
              >
                <div className="p-2 bg-brand-lavender-light/10 rounded-lg group-hover:bg-brand-lavender-light/20">
                  <FaKey className="w-4 h-4 text-brand-accent" />
                </div>
                <div>
                  <h3 className="font-medium text-brand-text-primary">
                    Access Keys
                  </h3>
                  <p className="text-sm text-brand-text-secondary">
                    Manage your API keys
                  </p>
                </div>
              </Link>

              <Link
                href="/docs"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-brand-lavender-light/5 transition-colors group"
              >
                <div className="p-2 bg-brand-lavender-light/10 rounded-lg group-hover:bg-brand-lavender-light/20">
                  <FaRocket className="w-4 h-4 text-brand-accent" />
                </div>
                <div>
                  <h3 className="font-medium text-brand-text-primary">
                    Documentation
                  </h3>
                  <p className="text-sm text-brand-text-secondary">
                    Setup guides & help
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Connected Sites */}
          <div className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 p-6">
            <h2 className="text-xl font-semibold text-brand-text-primary mb-4">
              Connected Sites
            </h2>
            <div className="space-y-4">
              {mockWebsites.map((site) => (
                <Link
                  key={site.id}
                  href={`/app/websites/${site.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-brand-lavender-light/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-lavender-light/10 rounded-lg">
                      {site.platform === "shopify" ? (
                        <FaShopify className="w-4 h-4 text-brand-accent" />
                      ) : (
                        <FaWordpress className="w-4 h-4 text-brand-accent" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-brand-text-primary">
                        {site.domain}
                      </h3>
                      <p className="text-sm text-brand-text-secondary">
                        {site.monthlyChats} chats • {site.aiRedirects} redirects
                      </p>
                    </div>
                  </div>
                  <FaExternalLinkAlt className="w-4 h-4 text-brand-text-secondary" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
