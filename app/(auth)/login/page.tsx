"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface FormData {
  login: string;
  password: string;
}

export default function Login() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormData>({
    login: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams, setSearchParams] = useState("");

  useEffect(() => {
    setSearchParams(window.location.search);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const params = new URLSearchParams(searchParams);
      const callbackUrl = params.get("callbackUrl");

      const result = await signIn("credentials", {
        login: formData.login,
        password: formData.password,
        callbackUrl: callbackUrl || "/app",
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push(callbackUrl || "/app");
      }
    } catch (error) {
      setError("An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-brand-lavender-light/20 to-white">
      <Navbar />
      <div className="container mx-auto px-4 py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/">
              <h1
                className="text-4xl font-bold bg-clip-text text-transparent 
                            bg-gradient-to-r from-brand-accent to-brand-lavender-dark 
                            inline-block mb-4"
              >
                Voicero.AI
              </h1>
            </Link>
            <p className="text-lg text-brand-text-secondary">
              Welcome back! Sign in to your account
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-brand-lavender-light/20">
            <form
              onSubmit={handleSubmit}
              className="grid gap-6 max-w-xl mx-auto"
            >
              {error && (
                <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                  Email or Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="h-5 w-5 text-brand-text-secondary/50" />
                  </div>
                  <input
                    type="text"
                    name="login"
                    value={formData.login}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 border border-brand-lavender-light/20 
                             rounded-xl focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent 
                             transition-colors bg-white"
                    placeholder="Email or username"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-brand-text-secondary">
                    Password
                  </label>
                  <Link
                    href="/forgotPassword"
                    className="text-sm text-brand-accent hover:text-brand-accent/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="h-5 w-5 text-brand-text-secondary/50" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-12 py-2 border border-brand-lavender-light/20 
                             rounded-xl focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent 
                             transition-colors bg-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-text-secondary/50 hover:text-brand-text-secondary"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 px-4 bg-gradient-to-r from-brand-accent to-brand-lavender-dark 
                         text-white rounded-xl font-medium shadow-lg shadow-brand-accent/20
                         hover:shadow-xl hover:shadow-brand-accent/30 transition-shadow
                         disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </motion.button>
            </form>

            {/* Sign Up Link */}
            <p className="mt-8 text-center text-sm text-brand-text-secondary">
              Don&apos;t have an account?{" "}
              <Link
                href={`/getStarted${searchParams}`}
                className="font-medium text-brand-accent hover:text-brand-accent/80 transition-colors"
              >
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </main>
  );
}
