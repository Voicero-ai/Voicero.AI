"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

export default function CTA() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient and shapes */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-lavender-light via-white to-brand-lavender-light/30" />
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand-accent/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-brand-accent/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-brand-dark mb-6 leading-tight">
            Ready to Transform Your Digital Experience?
          </h2>
          <p className="text-xl text-brand-dark/70 mb-12 leading-relaxed">
            Join thousands of businesses already using our platform to drive growth
            and innovation. Start your journey today.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Link
              href="/waitlist"
              className="group btn-primary text-lg px-8 py-4 flex items-center gap-2"
            >
              Get Started
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <FaArrowRight className="text-white group-hover:translate-x-1 transition-transform" />
              </motion.span>
            </Link>
            <Link
              href="/pricing"
              className="btn-secondary text-lg px-8 py-4"
            >
              View Pricing
            </Link>
          </div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 pt-16 border-t border-brand-lavender-light/30"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-brand-accent mb-2">24/7</h3>
                <p className="text-brand-dark/70">Customer Support</p>
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-bold text-brand-accent mb-2">99.9%</h3>
                <p className="text-brand-dark/70">Uptime Guarantee</p>
              </div>
              <div className="text-center">
                <h3 className="text-3xl font-bold text-brand-accent mb-2">14 Days</h3>
                <p className="text-brand-dark/70">Free Trial</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
