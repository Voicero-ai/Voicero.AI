"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedComputer from "./AnimatedComputer";
import { 
  FaShopify, 
  FaWordpress, 
  FaWix, 
  FaSquarespace,
  FaArrowRight,
  FaSearch 
} from "react-icons/fa";
import { SiWebflow, SiSquare, SiGhost, SiWoocommerce, SiShopware, SiMagento, SiBigcommerce } from "react-icons/si";
import Image from "next/image";

const platforms = [
  {
    name: "Shopify",
    icon: FaShopify,
    url: "https://www.shopify.com/",
    color: "#95BF47",
    description: "All-in-one commerce platform for online stores",
    isAvailable: true
  },
  {
    name: "WordPress",
    icon: FaWordpress,
    url: "https://wordpress.org/",
    color: "#21759B",
    description: "World's most popular website builder",
    isAvailable: true
  },
  {
    name: "Wix",
    icon: FaWix,
    url: "#",
    color: "#000000",
    description: "Cloud-based web development platform",
    isAvailable: false
  },
  {
    name: "Squarespace",
    icon: FaSquarespace,
    url: "#",
    color: "#000000",
    description: "Website builder and hosting platform",
    isAvailable: false
  },
  {
    name: "Webflow",
    icon: SiWebflow,
    url: "#",
    color: "#4353FF",
    description: "Visual web design platform",
    isAvailable: false
  },
  {
    name: "Square Online",
    icon: SiSquare,
    url: "#",
    color: "#3E4348",
    description: "Free online store from Square",
    isAvailable: false
  },
  {
    name: "Ghost",
    icon: SiGhost,
    url: "#",
    color: "#738A94",
    description: "Professional publishing platform",
    isAvailable: false
  },
  {
    name: "WooCommerce",
    icon: SiWoocommerce,
    url: "#",
    color: "#96588A",
    description: "Open-source e-commerce for WordPress",
    isAvailable: false
  },
  {
    name: "Shopware",
    icon: SiShopware,
    url: "#",
    color: "#189EFF",
    description: "Enterprise e-commerce platform",
    isAvailable: false
  },
  {
    name: "Magento",
    icon: SiMagento,
    url: "#",
    color: "#EE672F",
    description: "Adobe's enterprise e-commerce solution",
    isAvailable: false
  },
  {
    name: "BigCommerce",
    icon: SiBigcommerce,
    url: "#",
    color: "#12EF65",
    description: "Enterprise e-commerce platform",
    isAvailable: false
  }
];

export default function Hero() {
  const [showPlatformPopup, setShowPlatformPopup] = useState(false);

  const handlePlatformSelect = (url: string) => {
    window.open(url, '_blank');
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
              <span className="text-4xl lg:text-5xl font-medium mb-3">Making Online Shopping Accessible</span>
              <div className="flex flex-wrap items-baseline gap-x-4">
                <span className="text-4xl lg:text-5xl font-bold text-brand-accent">For Everyone,</span>
                <span className="text-4xl lg:text-5xl font-medium">Without</span>
                <span className="text-4xl lg:text-5xl font-bold text-brand-accent">Limits</span>
              </div>
            </h1>
            <p className="text-xl lg:text-2xl text-brand-dark/70 mb-12 leading-relaxed max-w-3xl">
              Experience the web without barriers; while businesses see up to a 3x increase in conversions by making their websites truly accessible to all. Empowering seniors, stroke survivors, and individuals with mobility challenges to navigate any website effortlessly using just their voice.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 mb-12">
              <motion.button
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 10px 30px -10px rgba(126, 58, 242, 0.4)"
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPlatformPopup(true)}
                className="relative overflow-hidden bg-gradient-to-r from-brand-accent via-[#9F5EF0] to-brand-accent text-white rounded-xl text-lg px-8 py-4 font-medium transition-all duration-300 bg-size-200 bg-pos-0 hover:bg-pos-100 flex items-center justify-center gap-3"
              >
                Start Now
                <FaArrowRight className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowPlatformPopup(true)}
                className="group relative overflow-hidden border-2 border-brand-accent/20 bg-white text-brand-dark rounded-xl text-lg px-8 py-4 font-medium transition-all duration-300 hover:border-brand-accent/40 hover:bg-brand-accent/5 flex items-center justify-center gap-3"
              >
                View Platforms
                <FaSearch className="w-4 h-4 text-brand-accent group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>

            {/* Platform Selection Popup */}
            <AnimatePresence>
              {showPlatformPopup && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
                  onClick={() => setShowPlatformPopup(false)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-2xl p-8 shadow-2xl max-w-4xl w-full mx-auto my-8"
                    onClick={e => e.stopPropagation()}
                  >
                    <h2 className="text-3xl font-bold text-brand-dark mb-4 text-center">
                      Choose Your Platform
                    </h2>
                    <p className="text-brand-dark/70 text-center mb-8 max-w-2xl mx-auto">
                      Select your preferred platform to integrate Voicero's voice navigation capabilities
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {platforms.map((platform) => (
                        <motion.button
                          key={platform.name}
                          whileHover={{ 
                            scale: platform.isAvailable ? 1.02 : 1,
                            boxShadow: platform.isAvailable ? `0 10px 30px -10px ${platform.color}40` : 'none'
                          }}
                          whileTap={{ scale: platform.isAvailable ? 0.98 : 1 }}
                          onClick={() => platform.isAvailable ? handlePlatformSelect(platform.url) : null}
                          className={`flex items-start gap-4 p-6 rounded-xl bg-white border-2 ${
                            platform.isAvailable 
                              ? 'border-gray-100 hover:border-brand-accent/20 cursor-pointer' 
                              : 'border-gray-100 opacity-75 cursor-default'
                          } transition-colors text-left group relative overflow-hidden`}
                        >
                          <div 
                            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                              !platform.isAvailable && 'grayscale'
                            }`}
                            style={{ color: platform.color }}
                          >
                            <platform.icon className={`w-8 h-8 transition-transform ${
                              platform.isAvailable ? 'group-hover:scale-110' : ''
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-brand-dark text-lg mb-1 flex items-center gap-2">
                              {platform.name}
                              {platform.isAvailable ? (
                                <FaArrowRight className="w-4 h-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                              ) : (
                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                  Coming Soon
                                </span>
                              )}
                            </h3>
                            <p className={`text-sm line-clamp-2 ${
                              platform.isAvailable ? 'text-brand-dark/60' : 'text-brand-dark/40'
                            }`}>
                              {platform.description}
                            </p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-brand-accent mb-2">92%</h3>
                <p className="text-brand-dark/70">Easier Navigation</p>
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-bold text-brand-accent mb-2">45%</h3>
                <p className="text-brand-dark/70">Conversion Increase</p>
              </div>
              <div className="text-center sm:col-span-1 col-span-2">
                <h3 className="text-3xl font-bold text-brand-accent mb-2">$13B</h3>
                <p className="text-brand-dark/70">Market Potential</p>
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
