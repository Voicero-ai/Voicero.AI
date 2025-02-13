"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  FaRobot,
  FaBrain,
  FaChartLine,
  FaBolt,
  FaShieldAlt,
  FaTools,
} from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type ChartType = 'realtime' | 'predictive' | 'performance';

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.05)',
      },
    },
    y: {
      grid: {
        display: true,
        color: 'rgba(0, 0, 0, 0.05)',
      },
      beginAtZero: true,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
  },
  elements: {
    line: {
      tension: 0.4,
    },
  },
};

const chartData: Record<ChartType, ChartData<'line'>> = {
  realtime: {
    labels: ['Day 3', 'Day 6', 'Day 9', 'Day 13', 'Day 17', 'Day 21', 'Day 25', 'Day 30'],
    datasets: [{
      label: 'Real-time Analytics',
      data: [100, 140, 80, 120, 150, 90, 130, 110],
      fill: true,
      backgroundColor: 'rgba(126, 58, 242, 0.1)',
      borderColor: 'rgba(126, 58, 242, 1)',
      pointBackgroundColor: 'rgba(126, 58, 242, 1)',
    }],
  },
  predictive: {
    labels: ['Day 3', 'Day 6', 'Day 9', 'Day 13', 'Day 17', 'Day 21', 'Day 25', 'Day 30'],
    datasets: [{
      label: 'Predictive Analysis',
      data: [80, 95, 130, 110, 140, 160, 150, 180],
      fill: true,
      backgroundColor: 'rgba(126, 58, 242, 0.1)',
      borderColor: 'rgba(126, 58, 242, 1)',
      pointBackgroundColor: 'rgba(126, 58, 242, 1)',
    }],
  },
  performance: {
    labels: ['Day 3', 'Day 6', 'Day 9', 'Day 13', 'Day 17', 'Day 21', 'Day 25', 'Day 30'],
    datasets: [{
      label: 'Performance Metrics',
      data: [90, 110, 95, 120, 105, 130, 125, 140],
      fill: true,
      backgroundColor: 'rgba(126, 58, 242, 0.1)',
      borderColor: 'rgba(126, 58, 242, 1)',
      pointBackgroundColor: 'rgba(126, 58, 242, 1)',
    }],
  },
};

const features = [
  {
    icon: FaRobot,
    title: "AI-Powered Analysis",
    description: "Leverage advanced machine learning algorithms to extract meaningful insights from your data automatically.",
  },
  {
    icon: FaBrain,
    title: "Smart Learning",
    description: "Our system continuously learns and adapts to your specific needs and patterns.",
  },
  {
    icon: FaChartLine,
    title: "Real-time Analytics",
    description: "Monitor and analyze your data in real-time with interactive dashboards and visualizations.",
  },
  {
    icon: FaBolt,
    title: "Lightning Fast",
    description: "Experience blazing-fast performance with our optimized processing engine.",
  },
  {
    icon: FaShieldAlt,
    title: "Enterprise Security",
    description: "Rest easy knowing your data is protected with enterprise-grade security measures.",
  },
  {
    icon: FaTools,
    title: "Customizable Tools",
    description: "Tailor the platform to your needs with our extensive suite of customization options.",
  },
];

export default function Features() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [activeChart, setActiveChart] = useState<ChartType>('realtime');

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

        {/* Interactive Chart Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-brand-dark mb-4">See It in Action</h2>
            <p className="text-xl text-brand-dark/70">
              Experience the power of our platform through interactive demonstrations and real-time
              data visualization.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Chart */}
            <motion.div 
              className="relative aspect-[4/3] bg-white rounded-2xl shadow-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeChart}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <Line data={chartData[activeChart]} options={chartOptions} />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Feature Selection */}
            <div className="space-y-6">
              {[
                {
                  id: 'realtime' as ChartType,
                  title: 'Real-time Analytics',
                  description: 'Watch as your data transforms into actionable insights instantly.',
                },
                {
                  id: 'predictive' as ChartType,
                  title: 'Predictive Analysis',
                  description: 'See future trends based on historical data patterns.',
                },
                {
                  id: 'performance' as ChartType,
                  title: 'Performance Metrics',
                  description: 'Track key performance indicators in real-time.',
                },
              ].map((feature) => (
                <motion.div
                  key={feature.id}
                  className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                    activeChart === feature.id
                      ? 'bg-brand-accent text-white shadow-lg scale-105'
                      : 'bg-white hover:bg-brand-accent/5'
                  }`}
                  onClick={() => setActiveChart(feature.id)}
                  whileHover={{ scale: activeChart === feature.id ? 1.05 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h3 className={`text-xl font-bold mb-2 ${
                    activeChart === feature.id ? 'text-white' : 'text-brand-dark'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={activeChart === feature.id ? 'text-white/90' : 'text-brand-dark/70'}>
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
