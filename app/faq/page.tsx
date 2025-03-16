"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: "What is the current cart abandonment rate for Shopify stores in 2024?",
    answer: "According to recent data, the average cart abandonment rate for Shopify stores in 2024 is 70.19%. This means that a significant portion of potential sales are being lost during the checkout process."
  },
  {
    question: "What are the main reasons customers abandon their shopping carts?",
    answer: "The top reasons for cart abandonment include: extra costs being too high (48%), requirement to create an account (26%), concerns about payment security (25%), slow delivery times (23%), and complex checkout processes (22%)."
  },
  {
    question: "How can an AI chatbot help improve my Shopify store's conversion rate?",
    answer: "Our AI chatbot helps improve conversion rates by providing instant customer support, addressing concerns in real-time, simplifying the checkout process, and offering personalized assistance. This helps overcome common barriers that lead to cart abandonment."
  },
  {
    question: "What is the average conversion rate for Shopify stores?",
    answer: "The industry average conversion rate for Shopify stores is 1.4%. Our AI chatbot solution helps stores exceed this benchmark by improving user engagement and reducing cart abandonment."
  },
  {
    question: "How has Shopify's platform grown in recent years?",
    answer: "Shopify has shown remarkable growth, with annual revenue increasing from $2.93 billion in 2020 to $8.88 billion in 2024. This demonstrates the platform's growing importance in the e-commerce landscape."
  },
  {
    question: "What security measures are in place to protect customer data?",
    answer: "We implement enterprise-grade security measures to ensure all personal information remains protected. Our system is designed with privacy and security as top priorities, giving both merchants and customers peace of mind."
  },
  {
    question: "How quickly can I integrate the AI chatbot with my Shopify store?",
    answer: "Our solution offers quick setup and easy integration with any Shopify store. The process is streamlined to get you up and running as quickly as possible while ensuring all features work seamlessly with your existing store setup."
  },
  {
    question: "Can the AI chatbot handle multiple customer inquiries simultaneously?",
    answer: "Yes, our AI chatbot can handle multiple customer conversations simultaneously, providing consistent, high-quality support 24/7 without any degradation in performance or response time."
  }
];

export default function FAQ() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <main>
      <div className="min-h-screen bg-gradient-to-b from-white via-brand-lavender-light/10 to-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl font-bold text-brand-dark mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-brand-dark/70 max-w-3xl mx-auto">
              Find answers to common questions about our AI chatbot solution for Shopify stores.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-brand-lavender-light/5 transition-colors duration-300"
                >
                  <span className="text-lg font-semibold text-brand-dark">{faq.question}</span>
                  <span className={`transform transition-transform duration-300 ${
                    expandedIndex === index ? 'rotate-180' : ''
                  }`}>
                    ▼
                  </span>
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: expandedIndex === index ? "auto" : 0,
                    opacity: expandedIndex === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 text-brand-dark/70">
                    {faq.answer}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
} 