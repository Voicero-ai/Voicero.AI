"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b border-brand-lavender-light/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <motion.a
            href="/"
            className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-brand-lavender-dark"
          >
            Voicero.AI
          </motion.a>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="/#features"
              className="text-brand-text-secondary hover:text-brand-accent transition-colors"
            >
              Features
            </a>
            <a
              href="/#demo"
              className="text-brand-text-secondary hover:text-brand-accent transition-colors"
            >
              Demo
            </a>
            <a
              href="/#pricing"
              className="text-brand-text-secondary hover:text-brand-accent transition-colors"
            >
              Pricing
            </a>
            <a
              href="/contact"
              className="text-brand-text-secondary hover:text-brand-accent transition-colors"
            >
              Contact
            </a>
            <a
              href="/login"
              className="text-brand-text-secondary hover:text-brand-accent transition-colors"
            >
              Login
            </a>
            <Link href="/getStarted">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary"
              >
                Get Started
              </motion.a>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-brand-text-secondary hover:text-brand-accent transition-colors"
          >
            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-brand-lavender-light/20"
            >
              <div className="flex flex-col space-y-4 py-4">
                <a
                  href="/#features"
                  className="text-brand-text-secondary hover:text-brand-accent transition-colors px-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  href="/#demo"
                  className="text-brand-text-secondary hover:text-brand-accent transition-colors px-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Demo
                </a>
                <a
                  href="/#pricing"
                  className="text-brand-text-secondary hover:text-brand-accent transition-colors px-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Pricing
                </a>
                <a
                  href="/contact"
                  className="text-brand-text-secondary hover:text-brand-accent transition-colors px-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </a>
                <a
                  href="/login"
                  className="text-brand-text-secondary hover:text-brand-accent transition-colors px-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </a>
                <Link href="/getStarted" onClick={() => setIsMenuOpen(false)}>
                  <motion.a
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary inline-block text-center mx-2"
                  >
                    Get Started
                  </motion.a>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
