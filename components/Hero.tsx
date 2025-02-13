"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedComputer from "./AnimatedComputer";
import { FaShopify, FaWordpress } from "react-icons/fa";

export default function Hero() {
  const [showPlatformPopup, setShowPlatformPopup] = useState(false);

  const handlePlatformSelect = (platform: string) => {
    if (platform === 'shopify') {
      window.open('https://www.shopify.com/', '_blank');
    } else if (platform === 'wordpress') {
      window.open('https://wordpress.com/', '_blank');
    }
    setShowPlatformPopup(false);
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
            <p className="text-xl lg:text-2xl text-brand-dark/70 mb-8 leading-relaxed max-w-3xl">
              Transform your e-commerce store with our cutting-edge AI that predicts and adapts to customer behavior in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 10px 30px -10px rgba(126, 58, 242, 0.4)"
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => window.location.href = '/demo'}
                className="relative overflow-hidden bg-gradient-to-r from-brand-accent to-[#9F5EF0] text-white rounded-xl text-lg px-8 py-4 font-medium transition-all duration-300 hover:from-[#9F5EF0] hover:to-brand-accent"
              >
                <motion.span
                  className="relative z-10 flex items-center justify-center gap-2"
                  whileHover={{ y: -2 }}
                >
                  Try Demo
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    →
                  </motion.span>
                </motion.span>
              </motion.button>
              <motion.button 
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 10px 30px -10px rgba(126, 58, 242, 0.3)"
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPlatformPopup(true)}
                className="relative overflow-hidden border-2 border-brand-accent/20 bg-white text-brand-accent rounded-xl text-lg px-8 py-4 font-medium transition-all duration-300 hover:border-brand-accent/40 hover:bg-brand-accent/5"
              >
                <motion.span
                  className="relative z-10 flex items-center justify-center gap-2"
                  whileHover={{ y: -2 }}
                >
                  Get Started
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    →
                  </motion.span>
                </motion.span>
              </motion.button>
            </div>

            {/* Platform Selection Popup */}
            <AnimatePresence>
              {showPlatformPopup && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                  onClick={() => setShowPlatformPopup(false)}
                >
                  <motion.div
                    className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full mx-4"
                    onClick={e => e.stopPropagation()}
                  >
                    <h2 className="text-2xl font-bold text-brand-dark mb-6 text-center">
                      Choose Your Platform
                    </h2>
                    <div className="flex flex-col gap-4">
                      <motion.button
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: "0 10px 30px -10px rgba(126, 58, 242, 0.4)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePlatformSelect('shopify')}
                        className="relative overflow-hidden bg-gradient-to-r from-[#95BF47] to-[#5E8E3E] text-white rounded-xl text-lg py-4 font-medium transition-all duration-300 hover:from-[#5E8E3E] hover:to-[#95BF47]"
                      >
                        <motion.span
                          className="relative z-10 flex items-center justify-center gap-3"
                          whileHover={{ y: -2 }}
                        >
                          <FaShopify className="w-6 h-6" />
                          Shopify
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="ml-1"
                          >
                            →
                          </motion.span>
                        </motion.span>
                      </motion.button>
                      <motion.button
                        whileHover={{ 
                          scale: 1.02,
                          boxShadow: "0 10px 30px -10px rgba(33, 117, 155, 0.4)"
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePlatformSelect('wordpress')}
                        className="relative overflow-hidden bg-gradient-to-r from-[#21759B] to-[#464646] text-white rounded-xl text-lg py-4 font-medium transition-all duration-300 hover:from-[#464646] hover:to-[#21759B]"
                      >
                        <motion.span
                          className="relative z-10 flex items-center justify-center gap-3"
                          whileHover={{ y: -2 }}
                        >
                          <FaWordpress className="w-6 h-6" />
                          WordPress
                          <motion.span
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="ml-1"
                          >
                            →
                          </motion.span>
                        </motion.span>
                      </motion.button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
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
