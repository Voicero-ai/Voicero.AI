"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaShopify, FaWordpress, FaMicrophone, FaSearch } from "react-icons/fa";
import type { IconType } from "react-icons";

interface Feature {
  title: string;
  description: string;
  icon: IconType;
  color: string;
}

const features: Feature[] = [
  {
    title: "Shopify Integration",
    description:
      "Seamlessly integrate Voicero.AI with your Shopify store to help customers find products instantly.",
    icon: FaShopify,
    color: "bg-gradient-to-r from-brand-accent to-brand-lavender-dark",
  },
  {
    title: "WordPress Integration",
    description:
      "Add AI-powered voice search to your WordPress site with just a few clicks.",
    icon: FaWordpress,
    color: "bg-gradient-to-r from-brand-accent to-brand-lavender-dark",
  },
  {
    title: "Voice Commands",
    description:
      "Natural language processing that understands context and delivers accurate results.",
    icon: FaMicrophone,
    color: "bg-gradient-to-r from-brand-accent to-brand-lavender-dark",
  },
  {
    title: "Universal Search",
    description:
      "Search through any website's content, including text, images, and hidden elements.",
    icon: FaSearch,
    color: "bg-gradient-to-r from-brand-accent to-brand-lavender-dark",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="py-24 bg-gradient-to-b from-white to-brand-lavender-light/10"
    >
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
          <p className="text-brand-text-secondary text-lg max-w-2xl mx-auto">
            Transform how users interact with your website using voice commands
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start gap-6 p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div
                className={`flex-shrink-0 w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center transform -rotate-6`}
              >
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3 text-brand-text-primary">
                  {feature.title}
                </h3>
                <p className="text-brand-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
