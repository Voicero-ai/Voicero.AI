"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const logos = [
  "/logos/logo1.svg",
  "/logos/logo2.svg",
  "/logos/logo3.svg",
  "/logos/logo4.svg",
  "/logos/logo5.svg",
  "/logos/logo6.svg",
];

export default function ScrollingLogos() {
  return (
    <div className="w-full py-10 overflow-hidden bg-white">
      <div className="relative">
        <div className="flex space-x-16">
          <motion.div
            className="flex space-x-16"
            animate={{
              x: [0, -1035],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 20,
                ease: "linear",
              },
            }}
          >
            {[...logos, ...logos].map((logo, index) => (
              <div
                key={index}
                className="flex items-center justify-center min-w-[150px] h-16 grayscale hover:grayscale-0 transition-all duration-200"
              >
                <Image
                  src={logo}
                  alt={`Partner logo ${index + 1}`}
                  width={120}
                  height={60}
                  className="object-contain"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
} 