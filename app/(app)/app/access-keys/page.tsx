"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaKey,
  FaPlus,
  FaCopy,
  FaTrash,
  FaTimes,
  FaGlobe,
} from "react-icons/fa";

interface AccessKey {
  id: string;
  name: string;
  websiteDomain: string;
  createdAt: string;
  lastUsed?: string;
}

interface Website {
  id: string;
  domain: string;
  type: "WordPress" | "Shopify";
  activeKeys: number;
}

const websites: Website[] = [
  { id: "1", domain: "mystore.shopify.com", type: "Shopify", activeKeys: 2 },
  { id: "2", domain: "myblog.wordpress.com", type: "WordPress", activeKeys: 1 },
];

const accessKeys: AccessKey[] = [
  {
    id: "key1",
    name: "Production Key",
    websiteDomain: "mystore.shopify.com",
    createdAt: "2024-01-01",
    lastUsed: "2024-01-15",
  },
  {
    id: "key2",
    name: "Development Key",
    websiteDomain: "mystore.shopify.com",
    createdAt: "2024-01-10",
  },
  {
    id: "key3",
    name: "Main Key",
    websiteDomain: "myblog.wordpress.com",
    createdAt: "2024-01-05",
    lastUsed: "2024-01-14",
  },
];

export default function AccessKeys() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);

  const handleCreateKey = (website: Website) => {
    setSelectedWebsite(website);
    setNewKeyName("");
    setNewKey(null);
    setIsCreateModalOpen(true);
  };

  const handleGenerateKey = () => {
    if (!newKeyName.trim()) return;
    // Simulate key generation
    const key = `vk_${Math.random().toString(36).substring(2, 15)}`;
    setNewKey(key);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-brand-text-primary mb-2">
          Access Keys
        </h1>
        <p className="text-brand-text-secondary">
          Manage API keys for your connected websites
        </p>
      </header>

      {/* Website Sections */}
      {websites.map((website) => (
        <section
          key={website.id}
          className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 overflow-hidden"
        >
          <div className="p-6 border-b border-brand-lavender-light/20 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-lavender-light/10 rounded-lg">
                <FaGlobe className="w-6 h-6 text-brand-accent" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-brand-text-primary">
                  {website.domain}
                </h2>
                <p className="text-sm text-brand-text-secondary">
                  {website.activeKeys} of 5 keys active
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCreateKey(website)}
              disabled={website.activeKeys >= 5}
              className="px-4 py-2 bg-gradient-to-r from-brand-accent to-brand-lavender-dark 
                       text-white rounded-xl shadow-lg shadow-brand-accent/20
                       hover:shadow-xl hover:shadow-brand-accent/30 transition-shadow
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPlus className="inline-block mr-2" />
              New Key
            </motion.button>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {accessKeys
                .filter((key) => key.websiteDomain === website.domain)
                .map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-4 border border-brand-lavender-light/20 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-brand-lavender-light/10 rounded-lg">
                        <FaKey className="w-4 h-4 text-brand-accent" />
                      </div>
                      <div>
                        <h3 className="font-medium text-brand-text-primary">
                          {key.name}
                        </h3>
                        <p className="text-sm text-brand-text-secondary">
                          Created on{" "}
                          {new Date(key.createdAt).toLocaleDateString()}
                          {key.lastUsed &&
                            ` • Last used ${new Date(
                              key.lastUsed
                            ).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-red-500 hover:text-red-600 
                               transition-colors rounded-lg hover:bg-red-50"
                    >
                      <FaTrash className="w-4 h-4" />
                    </motion.button>
                  </div>
                ))}
            </div>
          </div>
        </section>
      ))}

      {/* Create Key Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-brand-text-primary">
                  Create New Access Key
                </h3>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-brand-text-secondary hover:text-brand-text-primary"
                >
                  <FaTimes />
                </button>
              </div>

              {!newKey ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                      Key Name
                    </label>
                    <input
                      type="text"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g., Production Key"
                      className="block w-full px-4 py-2 border border-brand-lavender-light/20 
                               rounded-xl focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent 
                               transition-colors bg-white"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerateKey}
                    disabled={!newKeyName.trim()}
                    className="w-full py-3 px-4 bg-gradient-to-r from-brand-accent to-brand-lavender-dark 
                             text-white rounded-xl font-medium shadow-lg shadow-brand-accent/20
                             hover:shadow-xl hover:shadow-brand-accent/30 transition-shadow
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Key
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                      Your New Access Key
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newKey}
                        readOnly
                        className="block w-full px-4 py-2 bg-brand-lavender-light/5 border 
                                 border-brand-lavender-light/20 rounded-xl"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigator.clipboard.writeText(newKey)}
                        className="p-2 text-brand-accent hover:text-brand-accent/80 
                                 transition-colors rounded-lg hover:bg-brand-lavender-light/5"
                      >
                        <FaCopy className="w-5 h-5" />
                      </motion.button>
                    </div>
                    <p className="mt-2 text-sm text-red-500">
                      Copy this key now! You won't be able to see it again.
                    </p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsCreateModalOpen(false)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-brand-accent to-brand-lavender-dark 
                             text-white rounded-xl font-medium shadow-lg shadow-brand-accent/20
                             hover:shadow-xl hover:shadow-brand-accent/30 transition-shadow"
                  >
                    Done
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
