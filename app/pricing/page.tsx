"use client";

import React from "react";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Pricing from "../../components/Pricing";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-lavender-light/5 to-white">
      <Navbar />
      <div className="pt-20">
        <Pricing />
      </div>
      <Footer />
    </div>
  );
}
