"use client";

import React, { useEffect, useState } from "react";
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
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";

interface DashboardData {
  stats: {
    totalChats: number;
    voiceChats: number;
    aiRedirects: number;
    activeSites: number;
  };
  chartData: {
    date: string;
    redirects: number;
    chats: number;
  }[];
  websites: {
    id: string;
    domain: string;
    platform: string;
    monthlyChats: number;
    aiRedirects: number;
    status: string;
  }[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/login");
    },
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/dashboard");
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        if (!response.ok) throw new Error("Failed to fetch dashboard data");
        const dashboardData = await response.json();
        setData(dashboardData);
        console.log(dashboardData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!data) {
    return <div>Error loading dashboard data</div>;
  }

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
          <p className="text-3xl font-bold text-brand-text-primary">
            {data.stats.totalChats}
          </p>
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
          <p className="text-3xl font-bold text-brand-text-primary">
            {data.stats.voiceChats}
          </p>
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
          <p className="text-3xl font-bold text-brand-text-primary">
            {data.stats.aiRedirects}
          </p>
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
          <p className="text-3xl font-bold text-brand-text-primary">
            {data.stats.activeSites}
          </p>
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
              <LineChart
                data={data.chartData.map((item) => ({
                  ...item,
                  date: format(new Date(item.date), "MMM d, yyyy"),
                }))}
              >
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  tickFormatter={(value) => format(new Date(value), "MMM d")}
                />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  labelFormatter={(label) =>
                    format(new Date(label), "MMM d, yyyy")
                  }
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="redirects"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="chats"
                  stroke="#a855f7"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  connectNulls
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
              {data.websites.map((site) => (
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
