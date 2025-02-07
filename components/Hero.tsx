"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import AnimatedComputer from "./AnimatedComputer";

export default function Hero() {
  const scrollToDemo = (e: React.MouseEvent) => {
    e.preventDefault();
    const demoSection = document.getElementById("demo");
    demoSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen pt-32 overflow-hidden bg-gradient-to-b from-brand-lavender-light/20 via-white to-white">
      {/* Background Elements */}
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-lavender-medium/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-lavender-medium/20 rounded-full blur-3xl" />
      </motion.div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="flex flex-col text-brand-dark leading-tight mb-6">
              <span className="text-4xl lg:text-5xl font-medium mb-3">Voice/Text to Search With AI;</span>
              <div className="flex flex-wrap items-baseline gap-x-4">
                <span className="text-4xl lg:text-5xl font-bold text-brand-accent">Increasing</span>
                <span className="text-4xl lg:text-5xl font-medium">Conversion Rates,</span>
                <span className="text-4xl lg:text-5xl font-bold text-brand-accent">Decreasing</span>
                <span className="text-4xl lg:text-5xl font-medium">Costs</span>
              </div>
            </h1>
            <p className="text-xl text-brand-dark/70 mb-8 leading-relaxed">
              Harness the power of artificial intelligence to create seamless, 
              intelligent interactions that drive engagement and boost productivity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/demo"
                className="btn-primary text-lg px-8 py-4"
              >
                Try Demo
              </Link>
              <Link href="/contact" className="btn-secondary text-lg px-8 py-4">
                Contact Sales
              </Link>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-brand-accent mb-2">98%</h3>
                <p className="text-brand-dark/70">Customer Satisfaction</p>
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-bold text-brand-accent mb-2">24/7</h3>
                <p className="text-brand-dark/70">Support Available</p>
              </div>
              <div className="text-center sm:col-span-1 col-span-2">
                <h3 className="text-3xl font-bold text-brand-accent mb-2">100K+</h3>
                <p className="text-brand-dark/70">Active Users</p>
              </div>
            </div>
          </motion.div>

          {/* Animated Computer */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative w-full aspect-square max-w-2xl mx-auto">
              <AnimatedComputer />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
