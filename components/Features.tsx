"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FaShopify, FaChrome, FaMicrophone, FaSearch } from 'react-icons/fa';
import type { IconType } from 'react-icons';

interface Feature {
  title: string;
  description: string;
  icon: IconType;
  color: string;
}

const features: Feature[] = [
  {
    title: "Shopify Integration",
    description: "Seamlessly integrate Vocero.AI with your Shopify store to help customers find products instantly.",
    icon: FaShopify,
    color: "bg-gradient-to-r from-brand-accent to-brand-lavender-dark"
  },
  {
    title: "Chrome Extension",
    description: "Browse any website with AI-powered voice search just one click away.",
    icon: FaChrome,
    color: "bg-gradient-to-r from-brand-accent to-brand-lavender-dark"
  },
  {
    title: "Voice Commands",
    description: "Natural language processing that understands context and delivers accurate results.",
    icon: FaMicrophone,
    color: "bg-gradient-to-r from-brand-accent to-brand-lavender-dark"
  },
  {
    title: "Universal Search",
    description: "Search through any website's content, including text, images, and hidden elements.",
    icon: FaSearch,
    color: "bg-gradient-to-r from-brand-accent to-brand-lavender-dark"
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-brand-lavender-light/10">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-brand-text-primary">
            Powerful Features for Modern Browsing
          </h2>
          <p className="text-brand-text-secondary text-lg">
            Transform how users interact with your website using voice commands
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card p-6 hover:scale-105 transition-transform duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 mx-auto`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-brand-text-primary">{feature.title}</h3>
              <p className="text-brand-text-secondary">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}