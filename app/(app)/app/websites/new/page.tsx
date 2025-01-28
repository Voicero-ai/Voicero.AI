"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaGlobe,
  FaWordpress,
  FaShopify,
  FaKey,
  FaCheck,
  FaCrown,
  FaCopy,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

interface NewWebsiteForm {
  name: string;
  url: string;
  type: "WordPress" | "Shopify" | "";
  plan: "Free" | "Pro" | "";
}

export default function NewWebsite() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<NewWebsiteForm>({
    name: "",
    url: "",
    type: "",
    plan: "",
  });
  const [generatedKey] = useState<string>(() => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const length = 32;
    return Array.from(crypto.getRandomValues(new Uint8Array(length)))
      .map((x) => chars[x % chars.length])
      .join("");
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormErrors({});

    // Validate all required fields
    const errors: { [key: string]: string } = {};
    if (!form.name) errors.name = "Required";
    if (!form.url) errors.url = "Required";
    if (!form.type) errors.type = "Required";
    if (!form.plan) errors.plan = "Required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create website
      const response = await fetch("/api/websites/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          accessKey: generatedKey,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create website");
      }

      // If Pro plan, redirect to Stripe
      if (form.plan === "Pro") {
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          throw new Error("Failed to create Stripe checkout session");
        }
      } else {
        // Redirect to websites page
        router.push("/app/websites");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (field: keyof NewWebsiteForm, value: string) => {
    setForm({ ...form, [field]: value });
    // Clear the error for this field when it gets a value
    if (value) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-brand-text-primary mb-2">
          Connect New Website
        </h1>
        <p className="text-brand-text-secondary">
          Enter your website details to get started
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 overflow-hidden">
          <div className="p-6 border-b border-brand-lavender-light/20">
            <h2 className="text-xl font-semibold text-brand-text-primary">
              Website Details
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Website Name */}
            <div>
              <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                Website Name
                {formErrors.name && (
                  <span className="text-red-500 ml-2 text-sm">
                    {formErrors.name}
                  </span>
                )}
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                className="block w-full px-4 py-2 border border-brand-lavender-light/20 
                         rounded-xl focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent 
                         transition-colors"
                placeholder="My Awesome Website"
              />
            </div>

            {/* Website URL */}
            <div>
              <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                Website URL
                {formErrors.url && (
                  <span className="text-red-500 ml-2 text-sm">
                    {formErrors.url}
                  </span>
                )}
              </label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => handleFormChange("url", e.target.value)}
                className="block w-full px-4 py-2 border border-brand-lavender-light/20 
                         rounded-xl focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent 
                         transition-colors"
                placeholder="https://example.com"
              />
            </div>

            {/* Website Type */}
            <div>
              <label className="block text-sm font-medium text-brand-text-secondary mb-4">
                Website Type
                {formErrors.type && (
                  <span className="text-red-500 ml-2 text-sm">
                    {formErrors.type}
                  </span>
                )}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleFormChange("type", "WordPress")}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors
                           ${
                             form.type === "WordPress"
                               ? "border-brand-accent bg-brand-accent/5"
                               : "border-brand-lavender-light/20 hover:border-brand-accent/20"
                           }`}
                >
                  <FaWordpress
                    className={`w-6 h-6 ${
                      form.type === "WordPress"
                        ? "text-brand-accent"
                        : "text-brand-text-secondary"
                    }`}
                  />
                  <span
                    className={
                      form.type === "WordPress"
                        ? "text-brand-accent"
                        : "text-brand-text-secondary"
                    }
                  >
                    WordPress
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFormChange("type", "Shopify")}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors
                           ${
                             form.type === "Shopify"
                               ? "border-brand-accent bg-brand-accent/5"
                               : "border-brand-lavender-light/20 hover:border-brand-accent/20"
                           }`}
                >
                  <FaShopify
                    className={`w-6 h-6 ${
                      form.type === "Shopify"
                        ? "text-brand-accent"
                        : "text-brand-text-secondary"
                    }`}
                  />
                  <span
                    className={
                      form.type === "Shopify"
                        ? "text-brand-accent"
                        : "text-brand-text-secondary"
                    }
                  >
                    Shopify
                  </span>
                </button>
              </div>
            </div>

            {/* Access Key Option */}
            <div className="flex items-center justify-between p-4 bg-brand-lavender-light/5 rounded-xl">
              <div className="flex items-center gap-3">
                <FaKey className="w-5 h-5 text-brand-text-secondary" />
                <div>
                  <h3 className="text-brand-text-primary font-medium">
                    Your Access Key
                  </h3>
                  <p className="text-sm text-brand-text-secondary">
                    This is your secure key to access the Voicero.AI API
                  </p>
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium mb-2">
                      ⚠️ Save this key now! You won't be able to see it again.
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono bg-white px-2 py-1 rounded border border-yellow-200">
                        {generatedKey}
                      </code>
                      <button
                        type="button"
                        onClick={() =>
                          navigator.clipboard.writeText(generatedKey)
                        }
                        className="p-1.5 text-yellow-800 hover:bg-yellow-100 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        <FaCopy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 overflow-hidden">
          <div className="p-6 border-b border-brand-lavender-light/20">
            <h2 className="text-xl font-semibold text-brand-text-primary">
              Choose Your Plan
              {formErrors.plan && (
                <span className="text-red-500 ml-2 text-sm">
                  {formErrors.plan}
                </span>
              )}
            </h2>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Free Plan */}
              <button
                type="button"
                onClick={() => handleFormChange("plan", "Free")}
                className={`p-6 rounded-xl border-2 text-left transition-colors
                         ${
                           form.plan === "Free"
                             ? "border-brand-accent bg-brand-accent/5"
                             : "border-brand-lavender-light/20 hover:border-brand-accent/20"
                         }`}
              >
                <h3 className="text-xl font-semibold text-brand-text-primary mb-2">
                  Free Plan
                </h3>
                <p className="text-brand-text-secondary mb-4">
                  Perfect for getting started
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-brand-text-secondary">
                    <FaCheck className="w-4 h-4 text-green-500" />
                    10,000 monthly queries
                  </li>
                  <li className="flex items-center gap-2 text-sm text-brand-text-secondary">
                    <FaCheck className="w-4 h-4 text-green-500" />
                    Basic support
                  </li>
                </ul>
              </button>

              {/* Pro Plan */}
              <button
                type="button"
                onClick={() => handleFormChange("plan", "Pro")}
                className={`p-6 rounded-xl border-2 text-left transition-colors
                         ${
                           form.plan === "Pro"
                             ? "border-brand-accent bg-brand-accent/5"
                             : "border-brand-lavender-light/20 hover:border-brand-accent/20"
                         }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold text-brand-text-primary">
                    Pro Plan
                  </h3>
                  <FaCrown className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-brand-text-secondary mb-1">
                  For growing businesses
                </p>
                <p className="text-2xl font-bold text-brand-accent mb-4">
                  $10
                  <span className="text-sm font-normal text-brand-text-secondary">
                    /month
                  </span>
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-brand-text-secondary">
                    <FaCheck className="w-4 h-4 text-green-500" />
                    50,000 monthly queries
                  </li>
                  <li className="flex items-center gap-2 text-sm text-brand-text-secondary">
                    <FaCheck className="w-4 h-4 text-green-500" />
                    Priority support
                  </li>
                  <li className="flex items-center gap-2 text-sm text-brand-text-secondary">
                    <FaCheck className="w-4 h-4 text-green-500" />
                    Advanced analytics
                  </li>
                </ul>
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.back()}
            className="px-6 py-2 text-brand-text-secondary hover:text-brand-text-primary 
                     transition-colors rounded-xl"
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSubmitting}
            className="px-6 py-2 bg-gradient-to-r from-brand-accent to-brand-lavender-dark 
                     text-white rounded-xl shadow-lg shadow-brand-accent/20
                     hover:shadow-xl hover:shadow-brand-accent/30 transition-shadow
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating..." : "Create Website"}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
