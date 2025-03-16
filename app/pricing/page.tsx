"use client";

import React from "react";
import { motion } from "framer-motion";
import Pricing from "../../components/Pricing";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-lavender-light/5 to-white pt-20">
      <Pricing />
    </div>
  );
}
