"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMicrophone,
  FaRobot,
  FaApple,
  FaSearch,
  FaShoppingBag,
  FaUser,
  FaPlus,
} from "react-icons/fa";

const appleContent = {
  nav: ["Store", "Mac", "iPad", "iPhone", "Watch", "Support"],
  hero: {
    title: "iPhone 15 Pro",
    subtitle: "Titanium. So strong. So light. So Pro.",
  },
  sections: [
    {
      title: "Store",
      items: ["Shop Online", "Apple Trade In", "Financing", "Account"],
    },
    {
      title: "Services",
      items: ["Apple One", "Apple TV+", "Apple Music", "iCloud+"],
    },
    {
      title: "Legal",
      items: ["Terms of Service", "Privacy Policy", "Account & Security"],
    },
    {
      title: "Reviews",
      items: [
        "4 Star Reviews",
        "5 Star Reviews",
        "Customer Stories",
        "Expert Reviews",
      ],
    },
    {
      title: "Account",
      items: [
        "Sign In",
        "Create Apple ID",
        "Manage Account",
        "iCloud Settings",
      ],
    },
  ],
  footer: ["Reviews", "Support", "Privacy", "Contact"],
};

export default function AnimatedComputer() {
  const demoQA = useMemo(() => {
    const qa = [
      {
        question: "Please order me the new iPhone to 123 Main St.",
        answer:
          "Your new iPhone has been ordered and will be delivered to 123 Main St.",
        highlight: "iPhone",
        target: "nav",
      },
      {
        question: "Show me all of the 4 star reviews for the new iPhone.",
        answer: "Here are all the 4 star reviews for the new iPhone.",
        highlight: "Reviews",
        target: "footer",
      },
    ];
    return qa;
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [displayMessage, setDisplayMessage] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const [isMinimized, setIsMinimized] = useState(true);
  const [highlightedItems, setHighlightedItems] = useState<string[]>([]);
  const [pageView, setPageView] = useState("home");
  const [showCheckout, setShowCheckout] = useState(false);

  // Auto-open chat popup after 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMinimized(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Typing effect with 50ms per character
  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    if (pageView === "home" && step === 0) {
      setTypedText("");
      const currentQuestion = demoQA[currentIndex].question;

      const typeLetter = (i: number) => {
        if (!isMounted) return;

        if (i < currentQuestion.length) {
          setTypedText(currentQuestion.slice(0, i + 1));
          timeoutId = setTimeout(() => typeLetter(i + 1), 50);
        } else {
          timeoutId = setTimeout(() => {
            if (isMounted) setStep(1);
          }, 500);
        }
      };

      timeoutId = setTimeout(() => typeLetter(0), 100);
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [step, currentIndex, demoQA, pageView]);

  // Control animation sequence
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (pageView === "home") {
      if (step === 1) {
        setDisplayMessage("Thinking...");
        timer = setTimeout(() => {
          if (demoQA[currentIndex].target === "nav") {
            setStep(3);
          } else {
            setStep(2);
          }
        }, 2000);
      } else if (step === 2) {
        setDisplayMessage("Scrolling...");
        setScrollY(200);
        timer = setTimeout(() => setStep(3), 1000);
      } else if (step === 3) {
        setDisplayMessage("Clicking...");
        setHighlightedItems([demoQA[currentIndex].highlight]);
        timer = setTimeout(() => {
          setPageView("answer");
          setStep(4);
        }, 2000);
      }
    } else if (pageView === "answer") {
      timer = setTimeout(() => {
        setShowCheckout(true);
      }, 500);

      // Reset after showing answer and checkout
      timer = setTimeout(() => {
        setPageView("home");
        setStep(0);
        setTypedText("");
        setDisplayMessage("");
        setHighlightedItems([]);
        setScrollY(0);
        setShowCheckout(false);
        setCurrentIndex((prev) => (prev + 1) % demoQA.length);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [step, pageView, currentIndex, demoQA]);

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Browser window */}
      <div className="w-full max-w-[800px] relative]">
        <motion.div
          className="w-full aspect-[16/10] bg-white rounded-xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Browser Bar with brand theme */}
          <div className="bg-brand-accent/10 px-4 py-3 border-b border-brand-accent/20 flex items-center gap-2">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <div className="flex-1 bg-white/90 rounded-md px-3 py-1 text-sm text-brand-text-secondary">
              apple.com
            </div>
          </div>

          {/* Content Area */}
          <div className="relative p-4 overflow-hidden h-[500px]">
            {pageView === "home" ? (
              <motion.div
                animate={{ y: -scrollY }}
                transition={{ type: "spring", stiffness: 50 }}
                className="max-w-2xl mx-auto pb-16"
              >
                {/* Navigation */}
                <motion.div
                  className="flex items-center justify-between mb-8 text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <FaApple className="w-5 h-5 text-brand-accent" />
                  <div className="flex gap-6">
                    {appleContent.nav.map((item, index) => (
                      <motion.span
                        key={item}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => {
                          if (
                            demoQA[currentIndex].target === "nav" &&
                            item === demoQA[currentIndex].highlight
                          ) {
                            setHighlightedItems([item]);
                            setPageView("answer");
                          }
                        }}
                        className={`cursor-pointer transition-all duration-300 ${
                          highlightedItems.includes(item)
                            ? "text-brand-accent font-medium scale-105 bg-brand-accent/20 px-2 py-1 rounded"
                            : "hover:text-brand-accent text-brand-text-secondary"
                        }`}
                      >
                        {item}
                      </motion.span>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <FaSearch className="w-4 h-4 text-brand-accent" />
                    <FaShoppingBag className="w-4 h-4 text-brand-accent" />
                    <FaUser className="w-4 h-4 text-brand-accent" />
                  </div>
                </motion.div>

                {/* Hero Section */}
                <motion.div
                  className="text-center mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h1 className="text-4xl font-medium text-brand-text-primary mb-2">
                    {appleContent.hero.title}
                  </h1>
                  <p className="text-brand-text-secondary">
                    {appleContent.hero.subtitle}
                  </p>
                </motion.div>

                {/* Sections */}
                <div className="space-y-8">
                  {appleContent.sections.map((section, index) => (
                    <motion.div
                      key={section.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="border-t border-brand-accent/20 pt-4"
                    >
                      <h2 className="text-lg font-medium text-brand-text-primary mb-4">
                        {section.title}
                      </h2>
                      <div className="grid grid-cols-2 gap-4">
                        {section.items.map((item, itemIndex) => (
                          <motion.div
                            key={item}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{
                              opacity: 1,
                              scale: highlightedItems.includes(item) ? 1.05 : 1,
                              backgroundColor: highlightedItems.includes(item)
                                ? "rgba(126, 58, 242, 0.2)"
                                : "rgba(243, 232, 255, 0.05)",
                            }}
                            transition={{
                              delay: 0.3 + index * 0.1 + itemIndex * 0.05,
                            }}
                            onClick={() => {
                              if (
                                demoQA[currentIndex].target === "section" &&
                                item === demoQA[currentIndex].highlight
                              ) {
                                setHighlightedItems([item]);
                                setPageView("answer");
                              }
                            }}
                            className={`p-3 rounded-lg text-sm transition-all duration-300 cursor-pointer ${
                              highlightedItems.includes(item)
                                ? "text-brand-accent font-medium"
                                : "text-brand-text-secondary hover:bg-brand-accent/10"
                            }`}
                          >
                            {item}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Footer */}
                <motion.div
                  className="mt-8 pt-4 pb-4 border-t border-brand-accent/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex justify-center gap-8">
                    {appleContent.footer.map((item, index) => (
                      <motion.button
                        key={item}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        onClick={() => {
                          if (
                            demoQA[currentIndex].target === "footer" &&
                            item === demoQA[currentIndex].highlight
                          ) {
                            setHighlightedItems([item]);
                            setPageView("answer");
                          }
                        }}
                        className={`text-sm transition-all duration-300 ${
                          highlightedItems.includes(item)
                            ? "text-brand-accent font-medium scale-105 bg-brand-accent/20 px-3 py-1 rounded"
                            : "text-brand-text-secondary hover:text-brand-accent"
                        }`}
                      >
                        {item}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full min-h-[300px]"
              >
                {demoQA[currentIndex].target === "nav" ? (
                  // iPhone order confirmation page
                  <motion.div
                    className="w-full max-w-2xl mx-auto p-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <motion.h1
                      className="text-3xl font-bold mb-4 text-brand-accent"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      iPhone 15 Pro
                    </motion.h1>
                    <motion.p
                      className="text-lg mb-6 text-brand-text-secondary"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      Experience the future with the all-new iPhone 15 Pro.
                    </motion.p>
                    {showCheckout && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-green-50 border border-green-200 rounded-lg p-6"
                      >
                        <p className="text-lg text-green-600 font-medium">
                          Your order has been confirmed and will be delivered to
                          123 Main St.
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  // Reviews answer page
                  <motion.div
                    className="w-full max-w-2xl mx-auto p-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <motion.h1
                      className="text-2xl font-bold text-brand-text-primary mb-6"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {demoQA[currentIndex].question}
                    </motion.h1>
                    {showCheckout && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-4"
                      >
                        <p className="text-lg text-brand-text-secondary mb-6">
                          {demoQA[currentIndex].answer}
                        </p>
                        <div className="bg-brand-accent/5 rounded-lg p-6 space-y-4">
                          {/* Sample reviews */}
                          {[1, 2, 3].map((_, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 + i * 0.1 }}
                              className="border-b border-brand-accent/10 pb-4 last:border-0"
                            >
                              <div className="flex items-center text-brand-accent mb-2">
                                {"★".repeat(4)}
                                {"☆".repeat(1)}
                              </div>
                              <p className="text-brand-text-secondary">
                                Sample review {i + 1} for the iPhone 15 Pro...
                              </p>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* AI Assistant - Positioned below browser */}
      <div className="w-full max-w-[800px] relative h-48">
        {" "}
        {/* Container for AI Assistant */}
        <AnimatePresence>
          {isMinimized ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{
                scale: 1.1,
                boxShadow: "0 0 15px rgba(126, 58, 242, 0.6)",
              }}
              className="absolute top-4 right-4 bg-gradient-to-r from-[#E0BBE4] to-[#957DAD] p-4 rounded-full shadow-xl cursor-pointer transition-all duration-300"
              onClick={() => setIsMinimized(false)}
            >
              <FaRobot className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 0 20px rgba(126, 58, 242, 0.2)",
              }}
              className="absolute top-4 left-0 right-0 mx-4 bg-gradient-to-br from-white via-white to-brand-accent/5 rounded-lg shadow-xl border border-brand-accent/20 transition-all duration-300 hover:border-brand-accent/30"
            >
              <div className="p-4 flex items-center justify-between border-b border-brand-accent/20 bg-gradient-to-r from-[#E0BBE4]/10 to-[#957DAD]/10">
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    className="text-brand-accent"
                  >
                    <FaMicrophone className="w-5 h-5" />
                  </motion.div>
                  <span className="text-brand-accent font-medium">
                    AI Assistant
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsMinimized(true)}
                  className="hover:bg-brand-accent/10 rounded-full p-2 transition-colors"
                >
                  <FaPlus className="w-4 h-4 text-brand-accent transform rotate-45" />
                </motion.button>
              </div>
              <motion.div
                className="p-6 space-y-4 bg-gradient-to-br from-white via-white to-[#E0BBE4]/10"
                whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
              >
                <motion.div
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/80 transition-all duration-300"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 0 10px rgba(126, 58, 242, 0.2)",
                    backgroundColor: "rgba(255, 255, 255, 1)",
                  }}
                >
                  <span className="text-sm font-medium text-brand-text-secondary">
                    User:
                  </span>
                  <span className="text-sm text-brand-text-primary flex-1">
                    {typedText}
                  </span>
                </motion.div>
                <motion.div
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/80 transition-all duration-300"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 0 10px rgba(126, 58, 242, 0.2)",
                    backgroundColor: "rgba(255, 255, 255, 1)",
                  }}
                >
                  <span className="text-sm font-medium text-brand-text-secondary">
                    AI:
                  </span>
                  <span className="text-sm text-brand-accent flex-1">
                    {displayMessage}
                  </span>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
