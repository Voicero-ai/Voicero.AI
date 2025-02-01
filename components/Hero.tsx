"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaShopify,
  FaWordpress,
  FaMicrophone,
  FaComments,
  FaRobot,
  FaBrain,
  FaGlobe,
} from "react-icons/fa";
import { IoSend, IoSpeedometer } from "react-icons/io5";
import Link from "next/link";

const sampleQuestions = [
  "Where can I find your pricing information?",
  "What are your shipping policies?",
  "How do I contact customer support?",
  "What payment methods do you accept?",
  "Do you offer international shipping?",
];

const sampleWebsiteContent = [
  {
    title: "E-commerce Store",
    url: "shop.example.com",
    content: ["Products", "Categories", "Special Offers", "New Arrivals"],
  },
  {
    title: "Tech Blog",
    url: "blog.example.com",
    content: ["Latest Posts", "Tutorials", "Reviews", "Resources"],
  },
  {
    title: "Service Provider",
    url: "service.example.com",
    content: ["Services", "Solutions", "Pricing", "Contact"],
  },
];

// Add infographic data
const infographics = [
  {
    icon: FaRobot,
    title: "AI-Powered",
    description:
      "Advanced natural language processing for accurate voice commands",
  },
  {
    icon: FaBrain,
    title: "Smart Learning",
    description: "Adapts to your website's structure and content automatically",
  },
  {
    icon: IoSpeedometer,
    title: "Lightning Fast",
    description: "Real-time search and navigation across any webpage",
  },
  {
    icon: FaGlobe,
    title: "Universal",
    description: "Works on any website, from e-commerce to documentation",
  },
];

export default function Hero() {
  const scrollToDemo = (e: React.MouseEvent) => {
    e.preventDefault();
    const demoSection = document.getElementById("demo");
    demoSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.section
      id="hero"
      className="section-container section-container-hero relative min-h-screen pt-8 bg-gradient-to-b from-brand-lavender-light/20 to-white overflow-hidden"
    >
      {/* Background Elements */}
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-lavender-medium/20 rounded-full blur-3xl opacity-70" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-lavender-medium/20 rounded-full blur-3xl opacity-70" />
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-4 pt-24">
        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <FaShopify className="w-8 h-8 text-brand-accent" />
            <FaWordpress className="w-8 h-8 text-brand-accent" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-brand-lavender-dark">
            Voicero.AI
          </h1>
          <p className="text-lg md:text-xl mb-8 text-brand-text-secondary">
            Your AI-powered voice assistant for seamless website navigation
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (window.location.href = "/getStarted")}
              className="btn-primary cursor-pointer relative z-10 pointer-events-auto"
              style={{ touchAction: "manipulation" }}
            >
              Get Started
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToDemo}
              className="btn-secondary cursor-pointer relative z-10 pointer-events-auto"
              style={{ touchAction: "manipulation" }}
            >
              Watch Demo
            </motion.div>
          </div>
        </motion.div>

        {/* Infographics Section */}
        <div className="w-full py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {infographics.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative h-[250px]"
              >
                {/* Icon Container */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative z-10 h-full bg-white p-8 rounded-2xl shadow-md 
                           border border-brand-lavender-light/20 
                           group-hover:border-brand-accent/20 transition-colors
                           flex flex-col items-center justify-center"
                >
                  <info.icon className="w-12 h-12 text-brand-accent mb-4" />
                  <h3 className="text-xl font-medium text-brand-text-primary text-center">
                    {info.title}
                  </h3>
                </motion.div>

                {/* Hover Info Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 bg-white p-8 rounded-2xl
                           shadow-lg border border-brand-lavender-light/20
                           opacity-0 group-hover:opacity-100 transition-all duration-200
                           flex flex-col items-center justify-center z-20"
                >
                  <info.icon className="w-10 h-10 text-brand-accent mb-4" />
                  <h3 className="text-xl font-medium text-brand-text-primary mb-4 text-center">
                    {info.title}
                  </h3>
                  <p className="text-base text-brand-text-secondary text-center leading-relaxed">
                    {info.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
