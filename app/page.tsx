import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Demo from "@/components/Demo";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";
import CTA from "@/components/CTA";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import Process from "@/components/Process";
import ScrollingLogos from "@/components/ScrollingLogos";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <Hero />
      <ScrollingLogos />
      <Stats />
      <Features />
      <Process />
      <Demo />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
