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
  FaUniversalAccess,
  FaHeartbeat,
  FaHandHoldingHeart,
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
  ChartOptions,
} from "chart.js";

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

type ChartType = "realtime" | "predictive" | "performance";

const chartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: {
        display: true,
        color: "rgba(0, 0, 0, 0.05)",
      },
    },
    y: {
      grid: {
        display: true,
        color: "rgba(0, 0, 0, 0.05)",
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

const features = [
  {
    icon: FaUniversalAccess,
    title: "Voice Navigation",
    description:
      "Navigate any website using simple voice commands, making the web accessible for those with limited mobility.",
  },
  {
    icon: FaBrain,
    title: "Cognitive Support",
    description:
      "Simplified interface and clear instructions help stroke survivors and those with cognitive challenges browse with confidence.",
  },
  {
    icon: FaHeartbeat,
    title: "Stress-Free Browsing",
    description:
      "Reduced physical strain and frustration for heart patients and seniors through intuitive voice controls.",
  },
  {
    icon: FaHandHoldingHeart,
    title: "Caregiver Support",
    description:
      "Easy setup and monitoring tools help caregivers ensure their loved ones can browse independently and safely.",
  },
  {
    icon: FaShieldAlt,
    title: "Safe & Secure",
    description:
      "Enterprise-grade security ensures personal information stays protected while providing accessible navigation.",
  },
  {
    icon: FaTools,
    title: "Easy Integration",
    description:
      "Quick setup for any website, making your online presence instantly accessible to all users.",
  },
];

const chartData: Record<ChartType, ChartData<"line">> = {
  realtime: {
    labels: ["2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"],
    datasets: [
      {
        label: "Market Growth (Billions USD)",
        data: [2.5, 3.8, 5.2, 7.1, 9.4, 11.8, 13.2, 15.0],
        fill: true,
        backgroundColor: "rgba(126, 58, 242, 0.1)",
        borderColor: "rgba(126, 58, 242, 1)",
        pointBackgroundColor: "rgba(126, 58, 242, 1)",
      },
    ],
  },
  predictive: {
    labels: ["18-29", "30-44", "45-60", "60-75", "75+"],
    datasets: [
      {
        label: "Online Shopping Usage by Age Group (%)",
        data: [92, 87, 78, 65, 45],
        fill: true,
        backgroundColor: "rgba(126, 58, 242, 0.1)",
        borderColor: "rgba(126, 58, 242, 1)",
        pointBackgroundColor: "rgba(126, 58, 242, 1)",
      },
    ],
  },
  performance: {
    labels: ["2023", "2024", "2025", "2026", "2027", "2028"],
    datasets: [
      {
        label: "E-commerce Growth (Trillions USD)",
        data: [5.8, 6.3, 6.9, 7.5, 8.1, 8.8],
        fill: true,
        backgroundColor: "rgba(126, 58, 242, 0.1)",
        borderColor: "rgba(126, 58, 242, 1)",
        pointBackgroundColor: "rgba(126, 58, 242, 1)",
      },
    ],
  },
};

export default function Features() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [activeChart, setActiveChart] = useState<ChartType>("realtime");

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
    <section
      id="features"
      className="py-20 bg-gradient-to-b from-white via-brand-lavender-light/10 to-white"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-brand-dark mb-4">
            Making the Web Accessible for Everyone
          </h2>
          <p className="text-xl text-brand-dark/70 max-w-3xl mx-auto">
            Our AI-powered voice navigation system breaks down barriers,
            enabling everyone to browse the web with confidence and
            independence.
          </p>
        </motion.div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20"
        >
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants} className="group">
              <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-brand-lavender-light rounded-lg flex items-center justify-center group-hover:bg-brand-accent transition-colors duration-300">
                    <feature.icon className="text-2xl text-brand-accent group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-dark ml-4">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-brand-dark/70">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Interactive Chart Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-brand-dark mb-4">
              Real Impact, Real Results
            </h2>
            <p className="text-xl text-brand-dark/70">
              See how our voice navigation technology improves web accessibility
              and user independence over time.
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
                  id: "realtime" as ChartType,
                  title: "Market Growth Potential",
                  description:
                    "The digital accessibility market is projected to reach $15B by 2026, showing strong growth potential.",
                },
                {
                  id: "predictive" as ChartType,
                  title: "Age Group Analysis",
                  description:
                    "Online shopping usage varies significantly by age group, highlighting the need for accessible solutions.",
                },
                {
                  id: "performance" as ChartType,
                  title: "E-commerce Growth",
                  description:
                    "Global e-commerce market size projections, representing the total addressable market for accessibility solutions.",
                },
              ].map((feature) => (
                <motion.div
                  key={feature.id}
                  className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                    activeChart === feature.id
                      ? "bg-brand-accent text-white shadow-lg scale-105"
                      : "bg-white hover:bg-brand-accent/5"
                  }`}
                  onClick={() => setActiveChart(feature.id)}
                  whileHover={{
                    scale: activeChart === feature.id ? 1.05 : 1.02,
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <h3
                    className={`text-xl font-bold mb-2 ${
                      activeChart === feature.id
                        ? "text-white"
                        : "text-brand-dark"
                    }`}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className={
                      activeChart === feature.id
                        ? "text-white/90"
                        : "text-brand-dark/70"
                    }
                  >
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
