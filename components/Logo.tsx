"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <motion.div
        className="w-10 h-10 rounded-xl bg-gradient-to-r from-brand-accent to-brand-accent-dark flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-2xl font-bold text-white">V</span>
      </motion.div>
      <motion.span
        className="text-2xl font-bold bg-gradient-to-r from-brand-accent to-brand-accent-dark bg-clip-text text-transparent"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Voicero.AI
      </motion.span>
    </Link>
  );
} 