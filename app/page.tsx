import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Pricing from "../components/Pricing";
import Footer from "../components/Footer";
import ScrollingLogos from "../components/ScrollingLogos";
import CTA from "../components/CTA";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <ScrollingLogos />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
