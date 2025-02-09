"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "../../components/Navbar";
import {
  FaRocket,
  FaLightbulb,
  FaUsers,
  FaGlobe,
  FaCode,
  FaHeart,
  FaAward,
  FaMedal,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const teamMembers = [
  {
    name: "Sarah Johnson",
    role: "CEO & Founder",
    image: "https://source.unsplash.com/random/400x400?portrait=1",
    bio: "Visionary leader with 15+ years in AI and machine learning.",
  },
  {
    name: "Michael Chen",
    role: "CTO",
    image: "https://source.unsplash.com/random/400x400?portrait=2",
    bio: "Former Google AI researcher, passionate about innovation.",
  },
  {
    name: "Emma Williams",
    role: "Head of Product",
    image: "https://source.unsplash.com/random/400x400?portrait=3",
    bio: "Product strategist focused on user-centric solutions.",
  },
  {
    name: "David Kim",
    role: "Lead Engineer",
    image: "https://source.unsplash.com/random/400x400?portrait=4",
    bio: "Full-stack expert specializing in AI integration.",
  },
];

const achievements = [
  { number: "500K+", label: "Active Users" },
  { number: "50M+", label: "Searches Processed" },
  { number: "98%", label: "Customer Satisfaction" },
  { number: "120+", label: "Countries Served" },
];

const values = [
  {
    icon: FaRocket,
    title: "Innovation First",
    description: "Pushing boundaries in AI and search technology.",
  },
  {
    icon: FaUsers,
    title: "Customer Focused",
    description: "Building solutions that truly serve our users.",
  },
  {
    icon: FaGlobe,
    title: "Global Impact",
    description: "Making technology accessible worldwide.",
  },
  {
    icon: FaHeart,
    title: "Passion Driven",
    description: "Loving what we do, doing what matters.",
  },
];

const initiatives = [
  {
    title: "E-commerce Success",
    image: "https://source.unsplash.com/random/800x600?ecommerce-success",
    description: "Built and scaled multiple e-commerce stores to 7-figures through AI-driven optimization.",
  },
  {
    title: "Conversion Mastery",
    image: "https://source.unsplash.com/random/800x600?data-analytics",
    description: "Developed proven strategies that consistently achieve 3-5x industry average conversion rates.",
  },
  {
    title: "AI Innovation",
    image: "https://source.unsplash.com/random/800x600?artificial-intelligence",
    description: "Pioneering AI solutions that make enterprise-level optimization accessible to all stores.",
  },
];

const testimonials = [
  {
    name: "John Smith",
    role: "CTO at TechCorp",
    image: "https://source.unsplash.com/random/100x100?portrait=5",
    quote: "Voicero.AI has transformed how we handle customer inquiries. The AI-powered search is simply revolutionary.",
  },
  {
    name: "Lisa Chen",
    role: "CEO at InnovateCo",
    image: "https://source.unsplash.com/random/100x100?portrait=6",
    quote: "Implementation was seamless, and the results were immediate. Our conversion rates have increased by 40%.",
  },
  {
    name: "Mark Johnson",
    role: "Product Lead at StartupX",
    image: "https://source.unsplash.com/random/100x100?portrait=7",
    quote: "The most intuitive AI search solution we've ever used. It's like having a mind-reading search engine.",
  },
];

export default function AboutPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentInitiative, setCurrentInitiative] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextInitiative = () => {
    setCurrentInitiative((prev) => (prev + 1) % initiatives.length);
  };

  const prevInitiative = () => {
    setCurrentInitiative((prev) => (prev - 1 + initiatives.length) % initiatives.length);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-brand-lavender-light/20 via-white to-white pt-32">
        {/* Hero Section - Updated with split design */}
        <section className="container mx-auto px-4 mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-xl"
            >
              <h1 className="text-4xl lg:text-5xl font-bold text-brand-dark mb-8 leading-tight">
                Revolutionizing{" "}
                <span className="text-brand-accent whitespace-nowrap">
                  E-commerce Conversions
                </span>{" "}
                with AI
              </h1>
              <p className="text-lg lg:text-xl text-brand-dark/70 mb-8 leading-relaxed">
                As a founder who's built and scaled multiple 7-figure e-commerce stores, I understand the challenges of achieving exceptional conversion rates. Through years of testing and optimization, I've developed AI-powered solutions that consistently outperform traditional methods by 3-5x. My mission is to make these enterprise-level optimization tools accessible to every e-commerce store owner. Let me help you transform your store's performance with the power of AI-driven conversions.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-r from-brand-accent to-[#9F5EF0] text-white rounded-xl px-8 py-4 font-medium"
              >
                Learn More
              </motion.button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl"
            >
              <img
                src="https://source.unsplash.com/random/1920x1080?artificial-intelligence"
                alt="AI Innovation"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </section>

        {/* Interactive Initiative Carousel - Updated to Experience */}
        <section className="bg-gradient-to-r from-brand-accent/5 to-[#9F5EF0]/5 py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12 max-w-3xl mx-auto"
            >
              <h2 className="text-4xl font-bold text-brand-dark mb-4">Our Experience</h2>
              <p className="text-xl text-brand-dark/70">
                From building successful e-commerce stores to developing cutting-edge AI solutions, 
                we bring real-world expertise to every client.
              </p>
            </motion.div>
            <div className="relative">
              <motion.div
                key={currentInitiative}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              >
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src={initiatives[currentInitiative].image}
                    alt={initiatives[currentInitiative].title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-brand-dark mb-4">
                    {initiatives[currentInitiative].title}
                  </h3>
                  <p className="text-xl text-brand-dark/70">
                    {initiatives[currentInitiative].description}
                  </p>
                </div>
              </motion.div>
              <button
                onClick={prevInitiative}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full shadow-lg hover:bg-white transition-colors"
              >
                <FaChevronLeft className="w-6 h-6 text-brand-accent" />
              </button>
              <button
                onClick={nextInitiative}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-3 rounded-full shadow-lg hover:bg-white transition-colors"
              >
                <FaChevronRight className="w-6 h-6 text-brand-accent" />
              </button>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-brand-dark mb-4">Our Values</h2>
            <p className="text-xl text-brand-dark/70">
              The principles that guide our innovation and growth.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="text-brand-accent mb-4">
                  <value.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-2">{value.title}</h3>
                <p className="text-brand-dark/70">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Achievements Section */}
        <section className="bg-gradient-to-r from-brand-accent to-[#9F5EF0] py-20 text-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="text-center"
                >
                  <h3 className="text-4xl font-bold mb-2">{achievement.number}</h3>
                  <p className="text-white/80">{achievement.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonials Carousel */}
        <section className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-brand-dark mb-4">What Our Clients Say</h2>
            <p className="text-xl text-brand-dark/70">
              Success stories from businesses using our AI-powered search.
            </p>
          </motion.div>
          <div className="max-w-3xl mx-auto">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl p-8 shadow-xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={testimonials[currentTestimonial].image}
                  alt={testimonials[currentTestimonial].name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-bold text-brand-dark">
                    {testimonials[currentTestimonial].name}
                  </h3>
                  <p className="text-brand-accent">{testimonials[currentTestimonial].role}</p>
                </div>
              </div>
              <p className="text-xl text-brand-dark/70 italic">
                "{testimonials[currentTestimonial].quote}"
              </p>
            </motion.div>
          </div>
        </section>

        {/* Team Section */}
        <section className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-brand-dark mb-4">Our Team</h2>
            <p className="text-xl text-brand-dark/70">
              Meet the innovators behind our success.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-xl mb-4">
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                    src={member.image}
                    alt={member.name}
                    className="w-full aspect-square object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-brand-dark mb-1">{member.name}</h3>
                <p className="text-brand-accent mb-2">{member.role}</p>
                <p className="text-brand-dark/70">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-brand-accent/10 to-[#9F5EF0]/10 rounded-2xl p-12 text-center"
          >
            <h2 className="text-4xl font-bold text-brand-dark mb-6">
              Ready to Transform Your Search Experience?
            </h2>
            <p className="text-xl text-brand-dark/70 mb-8">
              Join thousands of businesses already using our AI-powered solutions.
            </p>
            <motion.button
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 10px 30px -10px rgba(126, 58, 242, 0.4)"
              }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-brand-accent to-[#9F5EF0] text-white rounded-xl text-lg px-8 py-4 font-medium"
            >
              Get Started Today
            </motion.button>
          </motion.div>
        </section>
      </main>
    </>
  );
} 