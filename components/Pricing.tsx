"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";
import Link from "next/link";

const pricingPlans = [
  {
    name: "Free",
    price: "0",
    description: "Essential AI assistant features for your website",
    popular: false,
    features: [
      "Enhanced AI model",
      "Up to 10,000 monthly queries",
      "Basic analytics dashboard",
      "Usage statistics",
      "Request history",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: "10",
    description: "Advanced features for growing websites",
    popular: true,
    features: [
      "Everything in Free plan",
      "Advanced AI model with better accuracy",
      "Up to 50,000 monthly queries",
      "Advanced analytics dashboard",
      "Real-time usage tracking",
      "User behavior insights",
      "Custom AI training",
      "Priority support",
    ],
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="py-24 bg-gradient-to-b from-white to-brand-lavender-light/10"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-brand-text-primary">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-brand-text-secondary">
            Choose the perfect plan for your needs.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl bg-white p-8 shadow-lg border 
                         transition-all duration-300 hover:shadow-xl
                         ${
                           plan.popular
                             ? "border-brand-accent scale-105 md:scale-110"
                             : "border-brand-lavender-light/20"
                         }`}
            >
              {plan.popular && (
                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-accent 
                               text-white px-4 py-1 rounded-full text-sm font-medium"
                >
                  Most Popular
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-brand-text-primary mb-4">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1 mb-4">
                  <span className="text-4xl font-bold text-brand-accent">
                    ${plan.price}
                  </span>
                  <span className="text-brand-text-secondary">/month</span>
                </div>
                <p className="text-brand-text-secondary">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-3 text-brand-text-secondary"
                  >
                    <FaCheck className="text-brand-accent flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/getStarted"
                className={`w-full block py-3 px-6 rounded-xl font-medium transition-all duration-300 text-center
                           ${
                             plan.popular
                               ? "bg-brand-accent text-white hover:bg-brand-accent/90"
                               : "bg-brand-lavender-light/10 text-brand-text-primary hover:bg-brand-lavender-light/20"
                           }`}
              >
                Get Started
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
