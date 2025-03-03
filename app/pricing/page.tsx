"use client";

import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Pricing from "../../components/Pricing";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="pt-20">
        <Pricing />
      </div>
      <Footer />
    </main>
  );
}
