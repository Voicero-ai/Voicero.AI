"use client";

import React, { useState } from "react";
import { FaEnvelope, FaRocket, FaCheck } from "react-icons/fa";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/sendEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setMessage(data.error || "Failed to join waitlist");
        return;
      }

      setStatus("success");
      setMessage("You've been added to our waitlist!");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-brand-lavender-light/5 to-white flex flex-col items-center justify-center p-4 pt-20">
        <div className="max-w-xl w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-brand-text-primary">
              Join the Waitlist
            </h1>
            <p className="text-xl text-brand-text-secondary">
              Be the first to experience the future of AI-powered customer
              interactions
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="text-brand-accent w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-12 pr-4 py-3 border border-brand-lavender-light/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/20 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg text-white font-medium transition-all
                ${
                  status === "loading"
                    ? "bg-brand-accent/70 cursor-not-allowed"
                    : "bg-brand-accent hover:bg-brand-accent/90"
                }`}
              >
                {status === "loading" ? (
                  <>Processing...</>
                ) : (
                  <>
                    <FaRocket className="w-5 h-5" />
                    Join Waitlist
                  </>
                )}
              </button>
            </form>

            {status === "success" && (
              <div className="mt-4 flex items-center gap-2 text-green-600 justify-center">
                <FaCheck />
                <span>{message}</span>
              </div>
            )}

            {status === "error" && (
              <div className="mt-4 text-red-600">{message}</div>
            )}
          </div>

          <div className="text-brand-text-secondary space-y-2">
            <p className="font-medium">Why join our waitlist?</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-brand-lavender-light/20">
                <p>Early Access</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-brand-lavender-light/20">
                <p>Special Pricing</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-brand-lavender-light/20">
                <p>Priority Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
