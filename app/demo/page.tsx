"use client";

import React from "react";
import { motion } from "framer-motion";
import AnimatedComputer from "../../components/AnimatedComputer";
import Link from "next/link";

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="fixed top-8 left-8 z-10">
        <Link href="/" className="text-gray-600 hover:text-purple-600 transition-colors text-lg">
          ← Back to Home
        </Link>
      </div>

      {/* Main Demo Container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-4xl">
          <AnimatedComputer />
        </div>
      </div>
    </main>
  );
} 