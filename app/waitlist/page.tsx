"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaEnvelope, FaRocket, FaCheck, FaShopify, FaChartLine, FaUsers } from "react-icons/fa";

const floatingAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const pulseAnimation = {
  initial: { scale: 1, opacity: 0.5 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "Failed to join waitlist");
        return;
      }

      setStatus("success");
      setMessage("You've been added to our waitlist!");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-brand-lavender-light/5 to-white flex flex-col items-center justify-center p-4 pt-20 overflow-hidden">
      {/* Animated Background Elements - Adjusted for mobile */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 pointer-events-none"
      >
        <motion.div
          variants={pulseAnimation}
          initial="initial"
          animate="animate"
          className="absolute top-20 left-5 md:left-10 w-32 md:w-64 h-32 md:h-64 bg-brand-accent/5 rounded-full blur-3xl"
        />
        <motion.div
          variants={pulseAnimation}
          initial="initial"
          animate="animate"
          className="absolute bottom-20 right-5 md:right-10 w-32 md:w-64 h-32 md:h-64 bg-brand-accent/5 rounded-full blur-3xl"
        />
      </motion.div>

      {/* Floating Icons - Adjusted for mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          variants={floatingAnimation}
          initial="initial"
          animate="animate"
          className="absolute top-[20%] left-[5%] md:left-[15%]"
        >
          <FaShopify className="text-brand-accent/20 w-8 h-8 md:w-12 md:h-12" />
        </motion.div>
        <motion.div
          variants={floatingAnimation}
          initial="initial"
          animate="animate"
          transition={{ delay: 1 }}
          className="absolute top-[30%] right-[5%] md:right-[15%]"
        >
          <FaChartLine className="text-brand-accent/20 w-8 h-8 md:w-12 md:h-12" />
        </motion.div>
        <motion.div
          variants={floatingAnimation}
          initial="initial"
          animate="animate"
          transition={{ delay: 2 }}
          className="absolute bottom-[20%] left-[10%] md:left-[20%]"
        >
          <FaUsers className="text-brand-accent/20 w-8 h-8 md:w-12 md:h-12" />
        </motion.div>
      </div>

      <div className="max-w-xl w-full text-center space-y-6 md:space-y-8 relative z-10 px-4 md:px-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-brand-text-primary">
            Boost Your Shopify Store's
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-[#9F5EF0] block mt-2">
              Conversion Rate
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg md:text-xl text-brand-text-secondary px-2 md:px-0"
          >
            Join the waitlist for our AI chatbot that helps Shopify stores
            {" "}increase sales by up to 30%
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="relative"
        >
          {/* Animated Border */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-brand-accent via-[#9F5EF0] to-brand-accent rounded-xl opacity-70 blur group-hover:opacity-100 transition-all duration-300" />
          
          <div className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 p-4 md:p-8 relative">
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="text-brand-accent w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-12 pr-4 py-3 border border-brand-lavender-light/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all text-base md:text-lg"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-white font-medium transition-all text-base md:text-lg
                ${
                  status === "loading"
                    ? "bg-brand-accent/70 cursor-not-allowed"
                    : "bg-brand-accent hover:bg-brand-accent/90"
                }`}
              >
                {status === "loading" ? (
                  <>Processing...</>
                ) : (
                  <>
                    <FaRocket className="w-5 h-5" />
                    Join Waitlist
                  </>
                )}
              </button>
            </form>

            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-2 text-green-600 justify-center"
              >
                <FaCheck />
                <span>{message}</span>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-red-600"
              >
                {message}
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-brand-text-secondary space-y-2"
        >
          <p className="font-medium">Why join our waitlist?</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-3 md:p-4 rounded-lg border border-brand-lavender-light/20"
            >
              <p>Early Access</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-3 md:p-4 rounded-lg border border-brand-lavender-light/20"
            >
              <p>Special Pricing</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-3 md:p-4 rounded-lg border border-brand-lavender-light/20"
            >
              <p>Priority Support</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
