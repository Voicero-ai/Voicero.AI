"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      // Reset form
      setFormData({ name: "", email: "", company: "", message: "" });
      alert("Thank you for your message! We will get back to you soon.");
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to send message. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />

      <section className="flex-1 pt-24 pb-16 bg-gradient-to-b from-brand-lavender-light/20 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-brand-accent to-brand-lavender-dark">
              Get in Touch
            </h1>
            <p className="text-lg text-brand-text-secondary text-center mb-12">
              Ready to transform your website with AI-powered voice navigation?
              We&apos;d love to hear from you.
            </p>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                { icon: FaEnvelope, title: "Email", info: "info@voicero.ai" },
                { icon: FaPhone, title: "Phone", info: "+1 (720) 612-2979" },
                {
                  icon: FaMapMarkerAlt,
                  title: "Location",
                  info: "Phoenix, AZ",
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 rounded-xl bg-white shadow-sm border border-brand-lavender-light/20"
                >
                  <item.icon className="w-6 h-6 text-brand-accent mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-brand-text-primary mb-2">
                    {item.title}
                  </h3>
                  <p className="text-brand-text-secondary">{item.info}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-xl border border-brand-lavender-light/20 p-8"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 rounded-lg border border-brand-lavender-light/20 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 rounded-lg border border-brand-lavender-light/20 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 bg-gray-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        company: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 rounded-lg border border-brand-lavender-light/20 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                    Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 rounded-lg border border-brand-lavender-light/20 focus:outline-none focus:ring-2 focus:ring-brand-accent/20 bg-gray-100"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-4 text-lg"
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
