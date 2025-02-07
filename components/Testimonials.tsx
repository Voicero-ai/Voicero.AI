"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CTO at TechCorp",
    image: "/testimonials/avatar1.jpg",
    quote: "This platform has revolutionized how we handle our data. The insights we've gained are invaluable.",
  },
  {
    name: "Michael Chen",
    role: "Product Manager at InnovateCo",
    image: "/testimonials/avatar2.jpg",
    quote: "The ease of use and powerful features make this a must-have tool for any serious business.",
  },
  {
    name: "Emily Rodriguez",
    role: "Data Scientist at DataFlow",
    image: "/testimonials/avatar3.jpg",
    quote: "I'm impressed by the accuracy and speed of the analytics. It's become an essential part of our workflow.",
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrent((current + newDirection + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      paginate(1);
    }, 5000);
    return () => clearInterval(timer);
  }, [current]);

  return (
    <section className="py-20 bg-gradient-to-b from-brand-lavender-light/20 to-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-brand-dark mb-4">
            What Our Clients Say
          </h2>
          <p className="text-xl text-brand-dark/70">
            Trusted by industry leaders worldwide
          </p>
        </motion.div>

        <div className="relative h-[400px] max-w-4xl mx-auto">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={1}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = swipePower(offset.x, velocity.x);
                if (swipe < -swipeConfidenceThreshold) {
                  paginate(1);
                } else if (swipe > swipeConfidenceThreshold) {
                  paginate(-1);
                }
              }}
              className="absolute w-full"
            >
              <div className="bg-white rounded-xl p-8 shadow-lg">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 relative mb-4 rounded-full overflow-hidden">
                    <Image
                      src={testimonials[current].image}
                      alt={testimonials[current].name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="text-xl text-brand-dark/90 mb-6 italic">
                    "{testimonials[current].quote}"
                  </p>
                  <h3 className="text-lg font-bold text-brand-dark">
                    {testimonials[current].name}
                  </h3>
                  <p className="text-brand-dark/70">{testimonials[current].role}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setDirection(index > current ? 1 : -1);
                setCurrent(index);
              }}
              className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                index === current ? "bg-brand-accent" : "bg-brand-accent/30"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
} 