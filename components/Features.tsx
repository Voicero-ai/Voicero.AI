"use client";

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  FaRobot,
  FaBrain,
  FaChartLine,
  FaBolt,
  FaShieldAlt,
  FaTools,
} from "react-icons/fa";

const features = [
  {
    icon: FaRobot,
    title: "AI-Powered Analysis",
    description:
      "Leverage advanced machine learning algorithms to extract meaningful insights from your data automatically.",
  },
  {
    icon: FaBrain,
    title: "Smart Learning",
    description:
      "Our system continuously learns and adapts to your specific needs and patterns.",
  },
  {
    icon: FaChartLine,
    title: "Real-time Analytics",
    description:
      "Monitor and analyze your data in real-time with interactive dashboards and visualizations.",
  },
  {
    icon: FaBolt,
    title: "Lightning Fast",
    description:
      "Experience blazing-fast performance with our optimized processing engine.",
  },
  {
    icon: FaShieldAlt,
    title: "Enterprise Security",
    description:
      "Rest easy knowing your data is protected with enterprise-grade security measures.",
  },
  {
    icon: FaTools,
    title: "Customizable Tools",
    description:
      "Tailor the platform to your needs with our extensive suite of customization options.",
  },
];

export default function Features() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <section className="py-20 bg-gradient-to-b from-white via-brand-lavender-light/10 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-brand-dark mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-brand-dark/70 max-w-3xl mx-auto">
            Discover the tools and capabilities that make our platform the leading choice
            for businesses worldwide.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group"
            >
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-brand-lavender-light rounded-lg flex items-center justify-center group-hover:bg-brand-accent transition-colors duration-300">
                    <feature.icon className="text-2xl text-brand-accent group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-dark ml-4">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-brand-dark/70">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
