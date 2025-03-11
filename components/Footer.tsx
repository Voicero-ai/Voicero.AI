"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaEnvelope,
} from "react-icons/fa";
import Logo from "./Logo";

const footerLinks = {
  product: [
    { name: "Features", href: "/#features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Waitlist", href: "/waitlist" },
    { name: "FAQs", href: "/faqs" },
  ],
  resources: [
    { name: "Documentation", href: "/docs" },
    { name: "Changelog", href: "/changelog" },
    { name: "Support", href: "/contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
  ],
};

const socialLinks = [
  {
    name: "Twitter",
    href: "https://twitter.com/voicero_ai",
    icon: FaTwitter,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/voicero-ai",
    icon: FaLinkedin,
  },
  {
    name: "GitHub",
    href: "https://github.com/voicero-ai",
    icon: FaGithub,
  },
  {
    name: "Email",
    href: "mailto:info@voicero.ai",
    icon: FaEnvelope,
  },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-brand-lavender-light/30">
      <div className="container mx-auto px-4 py-12">
        {/* Logo and Description */}
        <div className="flex flex-col items-center mb-12 space-y-4">
          <Logo />
          <p className="text-brand-dark/70 text-center max-w-md">
            Transforming digital experiences with AI-powered solutions that drive engagement and boost productivity.
          </p>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-lg font-semibold text-brand-dark mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-brand-dark/70 hover:text-brand-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-brand-dark mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-brand-dark/70 hover:text-brand-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-brand-dark mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-brand-dark/70 hover:text-brand-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-brand-dark mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-brand-dark/70 hover:text-brand-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-brand-lavender-light/30">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-dark/70 hover:text-brand-accent transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <social.icon className="w-6 h-6" />
                </motion.a>
              ))}
            </div>
            <p className="text-brand-dark/70 text-sm">
              © {new Date().getFullYear()} Pronewer LLC. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
