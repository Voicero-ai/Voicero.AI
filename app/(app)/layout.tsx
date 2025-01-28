"use client";

import React, { Suspense, useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

interface UserData {
  id: string;
  name: string;
  username: string;
  profilePicture: string | null;
  email: string;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/me");
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-lavender-light/20 to-white">
      <Sidebar userData={userData} loading={loading} />
      <div className="md:pl-64">
        <main className="p-8">
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse text-brand-text-secondary">
                  Loading...
                </div>
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
