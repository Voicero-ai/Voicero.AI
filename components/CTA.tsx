"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaBuilding, FaGlobe, FaUsers, FaComments } from 'react-icons/fa';

interface FormData {
  name: string;
  email: string;
  company: string;
  website: string;
  employees: string;
  message: string;
}

export default function CTA() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    website: '',
    employees: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsModalOpen(false);
    // Reset form
    setFormData({
      name: '',
      email: '',
      company: '',
      website: '',
      employees: '',
      message: ''
    });
    alert('Thank you for your message! We will get back to you soon.');
  };

  return (
    <>
      <div className="bg-white">
        <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="relative isolate overflow-hidden bg-gradient-to-r from-brand-accent to-brand-lavender-dark px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Get started with Vocero.AI today
            </h2>
            <p className="text-white/90 text-lg md:text-xl mb-8">
              Contact us today to get started on your journey to success.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="btn-secondary"
            >
              Contact Us
            </motion.button>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Modal Container (Centered) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md md:max-w-lg"
            >
              {/* Modal Content */}
              <div className="bg-white rounded-2xl shadow-xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-brand-text-primary">
                      Get Started
                    </h3>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-brand-text-light hover:text-brand-text-primary"
                    >
                      <FaTimes className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, name: e.target.value }))
                          }
                          className="w-full px-4 py-2 rounded-lg border border-brand-lavender-light/20 
                                 focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, email: e.target.value }))
                          }
                          className="w-full px-4 py-2 rounded-lg border border-brand-lavender-light/20 
                                 focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                        />
                      </div>
                    </div>

                    {/* Company Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                          Company Name
                        </label>
                        <div className="relative">
                          <FaBuilding className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-light" />
                          <input
                            type="text"
                            value={formData.company}
                            onChange={e =>
                              setFormData(prev => ({ ...prev, company: e.target.value }))
                            }
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-brand-lavender-light/20 
                                   focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                          Website
                        </label>
                        <div className="relative">
                          <FaGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-light" />
                          <input
                            type="url"
                            value={formData.website}
                            onChange={e =>
                              setFormData(prev => ({ ...prev, website: e.target.value }))
                            }
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-brand-lavender-light/20 
                                   focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                            placeholder="https://"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Company Size */}
                    <div>
                      <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                        Number of Employees
                      </label>
                      <div className="relative">
                        <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-light" />
                        <select
                          value={formData.employees}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, employees: e.target.value }))
                          }
                          className="w-full pl-10 pr-4 py-2 rounded-lg border border-brand-lavender-light/20 
                                 focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                        >
                          <option value="">Select company size</option>
                          <option value="1-10">1-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201-500">201-500 employees</option>
                          <option value="501+">501+ employees</option>
                        </select>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                        How can we help? *
                      </label>
                      <div className="relative">
                        <FaComments className="absolute left-3 top-3 text-brand-text-light" />
                        <textarea
                          required
                          rows={4}
                          value={formData.message}
                          onChange={e =>
                            setFormData(prev => ({ ...prev, message: e.target.value }))
                          }
                          className="w-full pl-10 pr-4 py-2 rounded-lg border border-brand-lavender-light/20 
                                 focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                          placeholder="Tell us about your needs..."
                        />
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-primary"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </motion.button>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
