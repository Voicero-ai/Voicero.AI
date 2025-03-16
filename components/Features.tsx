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

const baseChartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: {
        display: true,
        color: "rgba(0, 0, 0, 0.05)",
      },
      title: {
        display: true,
        text: "Year",
        color: "rgba(0, 0, 0, 0.7)",
      }
    },
    y: {
      grid: {
        display: true,
        color: "rgba(0, 0, 0, 0.05)",
      },
      beginAtZero: true,
      title: {
        display: true,
        text: "Value",
        color: "rgba(0, 0, 0, 0.7)",
      }
    },
  },
  plugins: {
    legend: {
      display: true,
      position: 'top' as const,
    },
    title: {
      display: true,
      text: "",
      font: {
        size: 16,
        weight: 'bold'
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            if (context.dataset.label?.includes('Revenue')) {
              label += '$' + context.parsed.y + 'B';
            } else {
              label += context.parsed.y + '%';
            }
          }
          return label;
        }
      }
    }
  },
  elements: {
    line: {
      tension: 0.4,
    },
    point: {
      radius: 5,
      hoverRadius: 7,
    }
  },
};

const getChartOptions = (type: ChartType): ChartOptions<"line"> => {
  const options = JSON.parse(JSON.stringify(baseChartOptions));
  
  if (options.plugins?.title && options.scales?.x?.title && options.scales?.y?.title) {
    switch (type) {
      case "realtime":
        options.plugins.title.text = "Cart Abandonment Rates Over Time";
        options.scales.y.title.text = "Abandonment Rate (%)";
        break;
      case "predictive":
        options.plugins.title.text = "Top Reasons for Lost Sales (2024)";
        options.scales.y.title.text = "Percentage of Customers (%)";
        options.scales.x.title.text = "Abandonment Reason";
        break;
      case "performance":
        options.plugins.title.text = "Shopify Platform Growth";
        options.scales.y.title.text = "Revenue (Billions USD)";
        break;
    }
  }
  
  return options;
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
    labels: ["2019", "2020", "2021", "2022", "2023", "2024"],
    datasets: [
      {
        label: "Cart Abandonment Rate (%)",
        data: [77.13, 84.27, 81.08, 68.70, 79.53, 70.19],
        fill: true,
        backgroundColor: "rgba(126, 58, 242, 0.1)",
        borderColor: "rgba(126, 58, 242, 1)",
        pointBackgroundColor: "rgba(126, 58, 242, 1)",
      },
    ],
  },
  predictive: {
    labels: ["Extra Costs", "Account Creation", "Trust Issues", "Slow Delivery", "Complex Checkout"],
    datasets: [
      {
        label: "Reasons for Cart Abandonment (%)",
        data: [48, 26, 25, 23, 22],
        fill: true,
        backgroundColor: "rgba(126, 58, 242, 0.1)",
        borderColor: "rgba(126, 58, 242, 1)",
        pointBackgroundColor: "rgba(126, 58, 242, 1)",
      },
    ],
  },
  performance: {
    labels: ["2020", "2021", "2022", "2023", "2024"],
    datasets: [
      {
        label: "Shopify Annual Revenue (Billions USD)",
        data: [2.93, 4.61, 5.60, 7.06, 8.88],
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
            Transform Your Shopify Store's Performance
          </h2>
          <p className="text-xl text-brand-dark/70 max-w-3xl mx-auto">
            With an average cart abandonment rate of 70.19% in 2024, Shopify stores are losing significant revenue. Our AI chatbot helps recover lost sales and improve user engagement.
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
              Discover how our AI chatbot addresses the top reasons for cart abandonment and helps boost your Shopify store's conversion rate above the industry average of 1.4%.
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
                  <Line data={chartData[activeChart]} options={getChartOptions(activeChart)} />
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
