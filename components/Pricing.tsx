"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaCheck } from "react-icons/fa";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for trying out our platform",
    features: [
      "100 API calls/month",
      "Basic voice commands",
      "Standard response time",
      "Community support",
      "Single website integration",
      "Basic analytics",
      "Documentation access"
    ],
  },
  {
    name: "Growth",
    price: "10",
    description: "Ideal for small to medium businesses",
    features: [
      "50,000 API calls/month",
      "Advanced voice commands",
      "Priority email support",
      "Multiple website integration",
      "Advanced analytics dashboard",
      "Custom voice commands",
      "API access",
      "Team collaboration tools",
      "Regular feature updates"
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations with specific needs",
    features: [
      "Unlimited API calls",
      "Custom analytics",
      "24/7 phone & email support",
      "Unlimited team members",
      "Unlimited projects",
      "Custom integrations",
      "API access",
      "Dedicated account manager",
      "Custom development",
      "SLA guarantees",
      "Advanced security features",
      "Custom training sessions"
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-gradient-to-b from-white to-brand-lavender-light/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-brand-dark mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-brand-dark/70 max-w-3xl mx-auto">
            Choose the plan that best fits your needs. All plans include our core features.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`relative ${
                plan.popular ? "md:-mt-4 md:mb-4" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 text-center">
                  <span className="bg-brand-accent text-white text-sm font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className={`h-full p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border ${
                plan.popular ? "border-brand-accent" : "border-brand-lavender-light/50"
              }`}>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-brand-dark mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-brand-dark/70 mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center mb-6">
                    <span className="text-5xl font-bold text-brand-dark">
                      ${plan.price}
                    </span>
                    {plan.price !== "Custom" && (
                      <span className="text-brand-dark/70 ml-2">/month</span>
                    )}
                  </div>
                  <Link
                    href="/contact"
                    className={`block w-full py-3 px-6 rounded-lg transition-colors duration-200 ${
                      plan.popular
                        ? "bg-brand-accent hover:bg-brand-accent/90 text-white"
                        : "bg-brand-lavender-light hover:bg-brand-lavender-medium/20 text-brand-accent"
                    }`}
                  >
                    {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                  </Link>
                </div>

                <div className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center">
                      <FaCheck className="text-brand-accent mr-3 flex-shrink-0" />
                      <span className="text-brand-dark/70">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-20"
        >
          <p className="text-brand-dark/70">
            Have questions about our pricing?{" "}
            <Link href="/contact" className="text-brand-accent hover:underline">
              Contact our sales team
            </Link>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
