"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMicrophone,
  FaRobot,
  FaApple,
  FaSearch,
  FaShoppingBag,
  FaUser,
  FaMinus,
  FaPlus
} from "react-icons/fa";

// We have three sample questions for Apple.com,
// each with a relevant "answer" and items to highlight.
const websites = [
  {
    name: "Apple.com",
    question: "Find me the terms of service and how I can sign up for this website.",
    highlightedItems: ["Terms of Service", "Create Apple ID"],
    answer:
      "You can find the Terms of Service under the 'Legal' section, and sign up by visiting 'Create Apple ID' in the 'Account' section."
  },
  {
    name: "Apple.com",
    question: "Where can I find the Apple Store and trade in options?",
    highlightedItems: ["Shop Online", "Apple Trade In"],
    answer:
      "You can access the Apple Store under the 'Store' section, and trade in your device using 'Apple Trade In.'"
  },
  {
    name: "Apple.com",
    question: "Show me how to manage my Apple ID and account settings.",
    highlightedItems: ["Manage Account", "iCloud Settings"],
    answer:
      "You can manage your Apple ID via the 'Manage Account' link or adjust cloud settings in 'iCloud Settings' under the 'Account' section."
  }
];

const appleContent = {
  nav: ["Store", "Mac", "iPad", "iPhone", "Watch", "Support"],
  hero: {
    title: "iPhone 15 Pro",
    subtitle: "Titanium. So strong. So light. So Pro."
  },
  sections: [
    {
      title: "Store",
      items: ["Shop Online", "Apple Trade In", "Financing", "Account"]
    },
    {
      title: "Services",
      items: ["Apple One", "Apple TV+", "Apple Music", "iCloud+"]
    },
    {
      title: "Legal",
      items: ["Terms of Service", "Privacy Policy", "Account & Security"]
    },
    {
      title: "Account",
      items: ["Sign In", "Create Apple ID", "Manage Account", "iCloud Settings"]
    }
  ]
};

export default function AnimatedComputer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [displayMessage, setDisplayMessage] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [highlightedItems, setHighlightedItems] = useState<string[]>([]);

  // Extract info from the current website question
  const { name, question, highlightedItems: siteItems, answer } =
    websites[currentIndex];

  // Simulate typing effect for the question
  useEffect(() => {
    if (step === 0) {
      let charIndex = 0;
      const interval = setInterval(() => {
        if (charIndex < question.length) {
          setTypedText((prev) => prev + question.charAt(charIndex));
          charIndex++;
        } else {
          clearInterval(interval);
          // After finishing typing, move to next step
          setTimeout(() => setStep(1), 1000);
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [step, question]);

  // Control the flow of steps (search, highlight, answer, reset)
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (step === 1) {
      // Searching...
      setDisplayMessage("Searching...");
      setIsMinimized(true); // Minimize the assistant while "searching"
      timer = setTimeout(() => setStep(2), 2000);
    } else if (step === 2) {
      // Found relevant sections, highlight them
      setDisplayMessage("Found relevant sections. Navigating...");
      setHighlightedItems(siteItems);
      timer = setTimeout(() => setStep(3), 2000);
    } else if (step === 3) {
      // Show the assistant with the final answer
      setIsMinimized(false);
      setDisplayMessage(`Here's what I found for you:\n${answer}`);
      timer = setTimeout(() => setStep(4), 4000);
    } else if (step === 4) {
      // Reset and go to the next question
      timer = setTimeout(() => {
        setStep(0);
        setTypedText("");
        setDisplayMessage("");
        setHighlightedItems([]);
        setCurrentIndex((prev) => (prev + 1) % websites.length);
      }, 2000);
    }

    return () => clearTimeout(timer);
  }, [step, currentIndex, siteItems, answer]);

  // Simulate a slow scroll effect during "searching" steps
  useEffect(() => {
    if (step === 1 || step === 2) {
      const scrollInterval = setInterval(() => {
        setScrollY((prev) => (prev + 1) % 200); // Loop scroll
      }, 30);
      return () => clearInterval(scrollInterval);
    } else {
      setScrollY(0);
    }
  }, [step]);

  return (
    <div className="w-full flex flex-row items-start gap-6">
      {/* Left side: Smaller "browser" showcasing Apple.com */}
      <div className="w-[550px] shrink-0">
        <div className="w-full aspect-video bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Browser Bar */}
          <div className="bg-brand-lavender-light/5 px-4 py-3 border-b border-brand-lavender-light/20 flex items-center gap-2">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 bg-white/80 rounded-md px-3 py-1 text-sm text-brand-text-secondary">
              {name.toLowerCase()}
            </div>
          </div>

          {/* Content Area */}
          <div className="relative p-4 overflow-hidden">
            {/* Simulated Apple Website Content */}
            <motion.div
              animate={{ y: -scrollY }}
              transition={{ type: "spring", stiffness: 50 }}
              className="max-w-2xl"
            >
              {/* Navigation */}
              <div className="flex items-center justify-between mb-8 text-sm text-brand-text-secondary">
                <FaApple className="w-5 h-5" />
                <div className="flex gap-6">
                  {appleContent.nav.map((item) => (
                    <span
                      key={item}
                      className="hover:text-brand-accent cursor-pointer"
                    >
                      {item}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4">
                  <FaSearch className="w-4 h-4" />
                  <FaShoppingBag className="w-4 h-4" />
                  <FaUser className="w-4 h-4" />
                </div>
              </div>

              {/* Hero Section */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-medium text-brand-text-primary mb-2">
                  {appleContent.hero.title}
                </h1>
                <p className="text-brand-text-secondary">
                  {appleContent.hero.subtitle}
                </p>
              </div>

              {/* Sections */}
              <div className="space-y-8">
                {appleContent.sections.map((section, index) => (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-t border-brand-lavender-light/20 pt-4"
                  >
                    <h2 className="text-lg font-medium text-brand-text-primary mb-4">
                      {section.title}
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                      {section.items.map((item) => (
                        <motion.div
                          key={item}
                          animate={{
                            scale: highlightedItems.includes(item) ? 1.05 : 1,
                            backgroundColor: highlightedItems.includes(item)
                              ? "rgba(126, 58, 242, 0.2)"
                              : item.includes("Terms") ||
                                item.includes("Sign") ||
                                item.includes("Create")
                              ? "rgba(243, 232, 255, 0.2)"
                              : "rgba(243, 232, 255, 0.05)"
                          }}
                          className={`p-3 rounded-lg text-sm transition-colors ${
                            highlightedItems.includes(item)
                              ? "text-brand-accent font-medium"
                              : "text-brand-text-secondary"
                          }`}
                        >
                          {item}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Right side: Vocero.AI Assistant popup */}
      <div className="relative flex-1 min-h-[400px]">
        <AnimatePresence>
          {isMinimized ? (
            // Small robot icon (minimized state)
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="bg-gradient-to-r from-brand-accent to-brand-lavender-dark p-3 rounded-full shadow-lg cursor-pointer absolute top-4 right-4 z-50"
              onClick={() => setIsMinimized(false)}
            >
              <FaRobot className="w-5 h-5 text-white" />
            </motion.div>
          ) : (
            // Full assistant card
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              className="w-72 card absolute top-4 right-4 z-50"
            >
              <div className="bg-gradient-to-r from-brand-accent to-brand-lavender-dark p-3 rounded-t-lg text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaRobot className="w-4 h-4" />
                  <span className="font-medium">Vocero.AI Assistant</span>
                </div>
                <button onClick={() => setIsMinimized(true)}>
                  <FaMinus className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 bg-white rounded-b-lg shadow-md">
                <div className="flex items-center gap-2 mb-3 text-brand-text-secondary">
                  <FaMicrophone className="w-4 h-4 text-brand-accent" />
                  <span className="text-sm">
                    Ask anything about this website
                  </span>
                </div>
                <div className="min-h-[100px] bg-brand-lavender-light/5 rounded p-3 text-sm text-brand-text-secondary whitespace-pre-line">
                  {step === 0 && typedText}
                  {step >= 1 && displayMessage}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
