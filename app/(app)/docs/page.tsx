"use client";

import React from "react";
import Link from "next/link";
import {
  FaShopify,
  FaWordpress,
  FaRocket,
  FaBook,
  FaEnvelope,
  FaArrowRight,
  FaPhone,
} from "react-icons/fa";

export default function Docs() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-brand-text-primary">
          Get Started with AI Chat
        </h1>
        <p className="text-xl text-brand-text-secondary max-w-2xl mx-auto">
          Add powerful AI chat capabilities to your website in minutes. Choose
          your platform below to get started.
        </p>
      </div>

      {/* Quick Start */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-brand-lavender-light/10 rounded-lg">
            <FaRocket className="w-6 h-6 text-brand-accent" />
          </div>
          <h2 className="text-2xl font-semibold text-brand-text-primary">
            Quick Start Guide
          </h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-brand-text-primary">
              1. Choose Your Platform
            </h3>
            <p className="text-brand-text-secondary">
              Select either WordPress or Shopify based on your website platform.
              We provide specialized integration guides for each.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-brand-text-primary">
              2. Install the Plugin/App
            </h3>
            <p className="text-brand-text-secondary">
              Follow the platform-specific installation steps to add our AI chat
              widget to your site. No coding required!
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-brand-text-primary">
              3. Configure Settings
            </h3>
            <p className="text-brand-text-secondary">
              Customize the chat widget appearance, behavior, and AI responses
              to match your brand and requirements.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-brand-text-primary">
              4. Test and Launch
            </h3>
            <p className="text-brand-text-secondary">
              Preview the chat widget on your site, test interactions, and go
              live when you're ready!
            </p>
          </div>
        </div>
      </div>

      {/* Platform Selection */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* WordPress */}
        <Link
          href="/docs/wordpress"
          className="group bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 p-6 
                   hover:border-brand-lavender-light/40 transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-brand-lavender-light/10 rounded-xl">
              <FaWordpress className="w-8 h-8 text-brand-accent" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-brand-text-primary mb-1">
                WordPress
              </h3>
              <p className="text-brand-text-secondary">
                Plugin installation guide
              </p>
            </div>
          </div>
          <p className="text-brand-text-secondary mb-4">
            Learn how to install and configure our WordPress plugin for seamless
            AI chat integration.
          </p>
          <span className="text-brand-accent group-hover:gap-2 flex items-center gap-1 transition-all">
            View guide <FaArrowRight className="w-4 h-4" />
          </span>
        </Link>

        {/* Shopify */}
        <Link
          href="/docs/shopify"
          className="group bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 p-6 
                   hover:border-brand-lavender-light/40 transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-brand-lavender-light/10 rounded-xl">
              <FaShopify className="w-8 h-8 text-brand-accent" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-brand-text-primary mb-1">
                Shopify
              </h3>
              <p className="text-brand-text-secondary">
                App installation guide
              </p>
            </div>
          </div>
          <p className="text-brand-text-secondary mb-4">
            Follow our step-by-step guide to add AI chat capabilities to your
            Shopify store.
          </p>
          <span className="text-brand-accent group-hover:gap-2 flex items-center gap-1 transition-all">
            View guide <FaArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>

      {/* Additional Resources */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-brand-lavender-light/10 rounded-lg">
            <FaBook className="w-6 h-6 text-brand-accent" />
          </div>
          <h2 className="text-2xl font-semibold text-brand-text-primary">
            Additional Resources
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/contact"
            className="flex items-center gap-3 p-4 rounded-lg hover:bg-brand-lavender-light/5 transition-colors"
          >
            <FaEnvelope className="w-5 h-5 text-brand-accent" />
            <div>
              <h3 className="font-medium text-brand-text-primary">
                Contact Us
              </h3>
              <p className="text-sm text-brand-text-secondary">
                Send us a message
              </p>
            </div>
          </Link>

          <a
            href="tel:+1234567890"
            className="flex items-center gap-3 p-4 rounded-lg hover:bg-brand-lavender-light/5 transition-colors"
          >
            <FaPhone className="w-5 h-5 text-brand-accent" />
            <div>
              <h3 className="font-medium text-brand-text-primary">
                Call Support
              </h3>
              <p className="text-sm text-brand-text-secondary">
                +1 (234) 567-890
              </p>
            </div>
          </a>

          <a
            href="mailto:support@example.com"
            className="flex items-center gap-3 p-4 rounded-lg hover:bg-brand-lavender-light/5 transition-colors"
          >
            <FaEnvelope className="w-5 h-5 text-brand-accent" />
            <div>
              <h3 className="font-medium text-brand-text-primary">
                Email Support
              </h3>
              <p className="text-sm text-brand-text-secondary">
                support@example.com
              </p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
