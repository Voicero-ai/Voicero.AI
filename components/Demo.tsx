"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const generateData = (days: number) => {
  const data = [];
  for (let i = 0; i < days; i++) {
    data.push({
      name: `Day ${i + 1}`,
      value: Math.floor(Math.random() * 100) + 50,
      efficiency: Math.floor(Math.random() * 30) + 70,
    });
  }
  return data;
};

const chartData = generateData(30);

const demoFeatures = [
  {
    title: "Real-time Analytics",
    description: "Watch as your data transforms into actionable insights instantly.",
  },
  {
    title: "Predictive Analysis",
    description: "See future trends based on historical data patterns.",
  },
  {
    title: "Performance Metrics",
    description: "Track key performance indicators in real-time.",
  },
];

export default function Demo() {
  const [activeTab, setActiveTab] = useState(0);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const tabVariants = {
    inactive: {
      opacity: 0.5,
      y: 0,
    },
    active: {
      opacity: 1,
      y: -5,
    },
  };

  return (
    <section id="demo" className="py-20 bg-gradient-to-b from-white to-brand-lavender-light/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-brand-dark mb-4">
            See It in Action
          </h2>
          <p className="text-xl text-brand-dark/70 max-w-3xl mx-auto">
            Experience the power of our platform through interactive demonstrations
            and real-time data visualization.
          </p>
        </motion.div>

        <div ref={ref} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Interactive Chart */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="bg-white p-6 rounded-xl shadow-lg"
          >
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                    animationDuration={2000}
                  />
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={false}
                    animationDuration={2000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Feature Tabs */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <div className="space-y-6">
              {demoFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={tabVariants}
                  animate={activeTab === index ? "active" : "inactive"}
                  className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                    activeTab === index
                      ? "bg-brand-accent text-white shadow-lg"
                      : "bg-white hover:bg-brand-lavender-light/50"
                  }`}
                  onClick={() => setActiveTab(index)}
                >
                  <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                  <p className={activeTab === index ? "text-white/90" : "text-brand-dark/70"}>
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
