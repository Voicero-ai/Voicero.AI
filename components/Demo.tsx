"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaMicrophone, FaRobot, FaKeyboard, FaHeadset } from "react-icons/fa";
import AnimatedComputer from "./AnimatedComputer";

const demoFeatures = [
  {
    icon: FaMicrophone,
    title: "Voice Commands",
    description: "Speak naturally to navigate websites",
  },
  {
    icon: FaKeyboard,
    title: "Text Input",
    description: "Type your questions when voice isn't ideal",
  },
  {
    icon: FaRobot,
    title: "Smart AI",
    description: "Context-aware responses and navigation",
  },
  {
    icon: FaHeadset,
    title: "Multi-Modal",
    description: "Switch between voice and text seamlessly",
  },
];

export default function Demo() {
  return (
    <section id="demo" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-brand-text-primary">
            See How It Works
          </h2>
          <p className="text-lg text-brand-text-secondary mb-8">
            Watch Voicero.AI in action as it helps users navigate through
            websites using natural language
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {demoFeatures.map((feature) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-brand-lavender-light/20 px-4 py-2 rounded-full 
                         flex items-center gap-2 text-sm text-brand-text-secondary"
              >
                <feature.icon className="w-4 h-4 text-brand-accent" />
                <span>{feature.title}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Interactive Demo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto mb-24 pt-16"
        >
          <div className="relative">
            <AnimatedComputer />

            {/* Decorative background elements */}
            <div className="absolute -z-10 inset-0 bg-gradient-to-b from-brand-lavender-light/5 to-transparent rounded-3xl transform scale-105 blur-xl" />
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-accent/5 rounded-full blur-3xl" />
          </div>
        </motion.div>

        {/* Demo Instructions - Now at bottom */}
        <div className="max-w-5xl mx-auto relative">
          {/* Background decorative element */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-lavender-light/5 to-transparent rounded-3xl transform scale-105 -z-10" />

          <div className="relative grid md:grid-cols-3 gap-8 md:gap-12">
            {/* Connecting lines (visible only on md screens and up) */}
            <div
              className="hidden md:block absolute top-1/2 left-[33%] right-[67%] h-1 
                          bg-gradient-to-r from-brand-accent/30 to-brand-accent 
                          transform -translate-y-1/2 z-0"
            />
            <div
              className="hidden md:block absolute top-1/2 left-[67%] right-[33%] h-1 
                          bg-gradient-to-r from-brand-accent to-brand-accent/30 
                          transform -translate-y-1/2 z-0"
            />

            {/* Step Cards - Updated with new hover effects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 },
              }}
              className="relative z-10 text-center p-8 rounded-2xl
                         bg-gradient-to-br from-white via-brand-lavender-light/10 to-transparent
                         hover:from-white hover:via-brand-lavender-light/20 hover:to-transparent
                         transition-all duration-300 shadow-lg hover:shadow-xl
                         border border-brand-accent/10 hover:border-brand-accent/30
                         backdrop-blur-sm group"
            >
              <div
                className="w-16 h-16 bg-gradient-to-br from-brand-accent/20 to-brand-accent/10 
                            rounded-2xl flex items-center justify-center mx-auto mb-6
                            shadow-inner group-hover:scale-110 transition-transform duration-300
                            border border-brand-accent/20 group-hover:border-brand-accent/40"
              >
                <span
                  className="text-3xl font-bold bg-gradient-to-r from-brand-accent to-brand-accent/70 
                               bg-clip-text text-transparent"
                >
                  1
                </span>
              </div>
              <h3
                className="text-xl font-semibold mb-3
                           bg-gradient-to-r from-brand-text-primary to-brand-accent 
                           bg-clip-text text-transparent"
              >
                Ask a Question
              </h3>
              <p className="text-sm text-brand-text-secondary">
                Use voice or text to ask about website content
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 },
              }}
              className="relative z-10 text-center p-8 rounded-2xl
                         bg-gradient-to-br from-white via-brand-lavender-light/10 to-transparent
                         hover:from-white hover:via-brand-lavender-light/20 hover:to-transparent
                         transition-all duration-300 shadow-lg hover:shadow-xl
                         border border-brand-accent/10 hover:border-brand-accent/30
                         backdrop-blur-sm group"
            >
              <div
                className="w-16 h-16 bg-gradient-to-br from-brand-accent/20 to-brand-accent/10 
                            rounded-2xl flex items-center justify-center mx-auto mb-6
                            shadow-inner group-hover:scale-110 transition-transform duration-300
                            border border-brand-accent/20 group-hover:border-brand-accent/40"
              >
                <span
                  className="text-3xl font-bold bg-gradient-to-r from-brand-accent to-brand-accent/70 
                               bg-clip-text text-transparent"
                >
                  2
                </span>
              </div>
              <h3
                className="text-xl font-semibold mb-3
                           bg-gradient-to-r from-brand-text-primary to-brand-accent 
                           bg-clip-text text-transparent"
              >
                AI Processing
              </h3>
              <p className="text-sm text-brand-text-secondary">
                Our AI understands and locates relevant information
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 },
              }}
              className="relative z-10 text-center p-8 rounded-2xl
                         bg-gradient-to-br from-white via-brand-lavender-light/10 to-transparent
                         hover:from-white hover:via-brand-lavender-light/20 hover:to-transparent
                         transition-all duration-300 shadow-lg hover:shadow-xl
                         border border-brand-accent/10 hover:border-brand-accent/30
                         backdrop-blur-sm group"
            >
              <div
                className="w-16 h-16 bg-gradient-to-br from-brand-accent/20 to-brand-accent/10 
                            rounded-2xl flex items-center justify-center mx-auto mb-6
                            shadow-inner group-hover:scale-110 transition-transform duration-300
                            border border-brand-accent/20 group-hover:border-brand-accent/40"
              >
                <span
                  className="text-3xl font-bold bg-gradient-to-r from-brand-accent to-brand-accent/70 
                               bg-clip-text text-transparent"
                >
                  3
                </span>
              </div>
              <h3
                className="text-xl font-semibold mb-3
                           bg-gradient-to-r from-brand-text-primary to-brand-accent 
                           bg-clip-text text-transparent"
              >
                Instant Results
              </h3>
              <p className="text-sm text-brand-text-secondary">
                Get guided directly to what you're looking for
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
