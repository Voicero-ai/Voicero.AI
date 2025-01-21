"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b border-brand-lavender-light/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <motion.a 
            href="#"
            className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-brand-lavender-dark"
          >
            Vocero.AI
          </motion.a>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-brand-text-secondary hover:text-brand-accent transition-colors">Features</a>
            <a href="#demo" className="text-brand-text-secondary hover:text-brand-accent transition-colors">Demo</a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#cta"
              className="btn-primary"
            >
              Get Started
            </motion.a>
          </div>
        </div>
      </div>
    </nav>
  );
} 