"use client";

import React from "react";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <div className="section-container section-container-cta bg-white">
      <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gradient-to-r from-brand-accent to-brand-lavender-dark px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Get started with Voicero.AI today
          </h2>
          <p className="text-white/90 text-lg md:text-xl mb-8">
            Contact us today to get started on your journey to success.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <a
              href="/contact"
              className="btn-secondary cursor-pointer relative z-10 pointer-events-auto"
            >
              Contact Us
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
