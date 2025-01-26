"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaGlobe,
  FaCreditCard,
  FaCamera,
  FaTrash,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

interface ConnectedSite {
  domain: string;
  type: "WordPress" | "Shopify";
  plan: "Basic" | "Pro";
  status: "active" | "expired";
  price: number;
  expiresAt: string;
  subscriptionId: string;
}

const connectedSites: ConnectedSite[] = [
  {
    domain: "mystore.shopify.com",
    type: "Shopify",
    plan: "Pro",
    status: "active",
    price: 10,
    expiresAt: "2024-12-31",
    subscriptionId: "sub_123",
  },
  {
    domain: "myblog.wordpress.com",
    type: "WordPress",
    plan: "Basic",
    status: "active",
    price: 5,
    expiresAt: "2024-01-31",
    subscriptionId: "sub_456",
  },
];

export default function Settings() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "john@example.com",
    username: "johndoe",
  });
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-brand-text-primary mb-2">
          Settings
        </h1>
        <p className="text-brand-text-secondary">
          Manage your account settings and preferences
        </p>
      </header>

      {/* Profile Section */}
      <section className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 overflow-hidden">
        <div className="p-6 border-b border-brand-lavender-light/20">
          <h2 className="text-xl font-semibold text-brand-text-primary">
            Profile Settings
          </h2>
        </div>

        <div className="p-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-brand-lavender-light/20 flex items-center justify-center">
                <FaUser className="w-12 h-12 text-brand-text-secondary/50" />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-brand-lavender-light/20">
                <FaCamera className="w-4 h-4 text-brand-text-secondary" />
              </button>
            </div>
            <div>
              <h3 className="font-medium text-brand-text-primary mb-1">
                Profile Picture
              </h3>
              <p className="text-sm text-brand-text-secondary mb-3">
                Upload a new profile picture
              </p>
              <button className="text-sm text-brand-accent hover:text-brand-accent/80 transition-colors">
                Upload new image
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                  className="block w-full px-4 py-2 border border-brand-lavender-light/20 
                           rounded-xl focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent 
                           transition-colors bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={profileData.username}
                  onChange={(e) =>
                    setProfileData({ ...profileData, username: e.target.value })
                  }
                  className="block w-full px-4 py-2 border border-brand-lavender-light/20 
                           rounded-xl focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent 
                           transition-colors bg-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  className="block w-full px-4 py-2 border border-brand-lavender-light/20 
                           rounded-xl focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent 
                           transition-colors bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 text-brand-text-secondary hover:text-brand-text-primary 
                         transition-colors rounded-xl"
                type="button"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-gradient-to-r from-brand-accent to-brand-lavender-dark 
                         text-white rounded-xl shadow-lg shadow-brand-accent/20
                         hover:shadow-xl hover:shadow-brand-accent/30 transition-shadow"
                type="submit"
              >
                Save Changes
              </motion.button>
            </div>
          </form>
        </div>
      </section>

      {/* Connected Websites Section */}
      <section className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 overflow-hidden">
        <div className="p-6 border-b border-brand-lavender-light/20 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-brand-text-primary">
              Connected Websites
            </h2>
            <p className="text-sm text-brand-text-secondary mt-1">
              Manage your website connections and subscriptions
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push("/app/websites/new")}
            className="px-4 py-2 bg-gradient-to-r from-brand-accent to-brand-lavender-dark 
                     text-white rounded-xl shadow-lg shadow-brand-accent/20
                     hover:shadow-xl hover:shadow-brand-accent/30 transition-shadow"
          >
            Add New Website
          </motion.button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {connectedSites.map((site) => (
              <div
                key={site.domain}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-brand-lavender-light/20 rounded-xl gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-brand-lavender-light/10 rounded-lg">
                    <FaGlobe className="w-6 h-6 text-brand-accent" />
                  </div>
                  <div>
                    <h3 className="font-medium text-brand-text-primary">
                      {site.domain}
                    </h3>
                    <p className="text-sm text-brand-text-secondary">
                      {site.type} • {site.plan} Plan (${site.price}/month)
                    </p>
                    <p className="text-sm text-brand-text-secondary">
                      Renews on {new Date(site.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-auto">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-3 py-1.5 text-sm text-brand-accent border border-brand-accent/20 
                             hover:bg-brand-accent/5 transition-colors rounded-lg"
                  >
                    Manage Subscription
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-brand-text-secondary hover:text-brand-accent 
                             transition-colors rounded-lg hover:bg-brand-lavender-light/5"
                  >
                    <FaExternalLinkAlt className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 text-red-500 hover:text-red-600 
                             transition-colors rounded-lg hover:bg-red-50"
                  >
                    <FaTrash className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            ))}
          </div>

          {connectedSites.length === 0 && (
            <div className="text-center py-8">
              <p className="text-brand-text-secondary mb-4">
                No websites connected yet
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/app/websites/new")}
                className="px-4 py-2 bg-gradient-to-r from-brand-accent to-brand-lavender-dark 
                         text-white rounded-xl shadow-lg shadow-brand-accent/20
                         hover:shadow-xl hover:shadow-brand-accent/30 transition-shadow"
              >
                Connect Your First Website
              </motion.button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
