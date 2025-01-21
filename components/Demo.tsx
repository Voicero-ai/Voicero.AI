"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { FaMicrophone, FaRobot, FaKeyboard, FaHeadset } from 'react-icons/fa';
import AnimatedComputer from './AnimatedComputer';

const demoFeatures = [
  {
    icon: FaMicrophone,
    title: "Voice Commands",
    description: "Speak naturally to navigate websites"
  },
  {
    icon: FaKeyboard,
    title: "Text Input",
    description: "Type your questions when voice isn't ideal"
  },
  {
    icon: FaRobot,
    title: "Smart AI",
    description: "Context-aware responses and navigation"
  },
  {
    icon: FaHeadset,
    title: "Multi-Modal",
    description: "Switch between voice and text seamlessly"
  }
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
            Watch Vocero.AI in action as it helps users navigate through websites using natural language
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
          className="max-w-6xl mx-auto mb-16"
        >
          <AnimatedComputer />
        </motion.div>

        {/* Demo Instructions */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center p-6 rounded-2xl bg-brand-lavender-light/5"
            >
              <div className="w-12 h-12 bg-brand-lavender-light/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-brand-accent">1</span>
              </div>
              <h3 className="text-lg font-medium text-brand-text-primary mb-2">Ask a Question</h3>
              <p className="text-sm text-brand-text-secondary">
                Use voice or text to ask about website content
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center p-6 rounded-2xl bg-brand-lavender-light/5"
            >
              <div className="w-12 h-12 bg-brand-lavender-light/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-brand-accent">2</span>
              </div>
              <h3 className="text-lg font-medium text-brand-text-primary mb-2">AI Processing</h3>
              <p className="text-sm text-brand-text-secondary">
                Our AI understands and locates relevant information
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center p-6 rounded-2xl bg-brand-lavender-light/5"
            >
              <div className="w-12 h-12 bg-brand-lavender-light/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-brand-accent">3</span>
              </div>
              <h3 className="text-lg font-medium text-brand-text-primary mb-2">Instant Results</h3>
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