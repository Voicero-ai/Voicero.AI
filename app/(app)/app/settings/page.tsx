"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { useUser } from "@/contexts/UserContext";

interface Website {
  id: string;
  url: string;
  name: string | null;
  type: string;
  plan: string;
  active: boolean;
  renewsOn: string;
  stripeId: string;
  monthlyQueries: number;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  username: string;
  profilePicture: string | null;
}

export default function Settings() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user, updateUser } = useUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        const profileRes = await fetch("/api/user/me");
        const profileData = await profileRes.json();
        setProfile(profileData);

        // Fetch websites
        const websitesRes = await fetch("/api/websites");
        const websitesData = await websitesRes.json();
        setWebsites(websitesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profile.name,
          username: profile.username,
          email: profile.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setProfile(data);
      updateUser(data);
      setIsEditing(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setError(""); // Clear any previous errors

      // Get presigned URL
      const response = await fetch("/api/upload/s3-url");
      if (!response.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, key, bucketUrl } = await response.json();

      // Upload to S3
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) throw new Error("Failed to upload image");

      // Update user profile with new image URL
      const imageUrl = `${bucketUrl}/${key}`;

      const updateResponse = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: profile?.name, // Include existing profile data
          email: profile?.email,
          username: profile?.username,
          profilePicture: imageUrl,
        }),
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        throw new Error(error.error || "Failed to update profile picture");
      }

      const updatedProfile = await updateResponse.json();
      setProfile(updatedProfile);
      updateUser(updatedProfile);

      // Optional: Show success message
      // setSuccessMessage("Profile picture updated successfully");
    } catch (error) {
      console.error("Upload error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

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
              {profile?.profilePicture ? (
                <div className="relative">
                  <img
                    src={profile.profilePicture}
                    alt="Profile"
                    className={`w-24 h-24 rounded-full object-cover transition-opacity duration-200 ${
                      isUploading ? "opacity-50" : "opacity-100"
                    }`}
                    onError={(e) => {
                      e.currentTarget.src = "";
                      setProfile((prev) =>
                        prev ? { ...prev, profilePicture: null } : null
                      );
                    }}
                  />
                  {isUploading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-accent"></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-brand-lavender-light/20 flex items-center justify-center">
                  <FaUser className="w-12 h-12 text-brand-text-secondary/50" />
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-brand-lavender-light/20
                         hover:bg-brand-lavender-light/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file);
                  }
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-sm text-brand-accent hover:text-brand-accent/80 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? "Uploading..." : "Upload new image"}
              </button>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profile?.name || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`block w-full px-4 py-2 border border-brand-lavender-light/20 
                           rounded-xl focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent 
                           transition-colors bg-white ${
                             !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
                           }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={profile?.username || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`block w-full px-4 py-2 border border-brand-lavender-light/20 
                           rounded-xl focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent 
                           transition-colors bg-white ${
                             !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
                           }`}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-brand-text-secondary mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={profile?.email || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`block w-full px-4 py-2 border border-brand-lavender-light/20 
                           rounded-xl focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent 
                           transition-colors bg-white ${
                             !isEditing ? "bg-gray-50 cursor-not-allowed" : ""
                           }`}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              {isEditing ? (
                <>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsEditing(false);
                      // Reset form to original values
                      setProfile(profile);
                      setError("");
                    }}
                    className="px-4 py-2 text-brand-text-secondary hover:text-brand-text-primary 
                             transition-colors rounded-xl"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-gradient-to-r from-brand-accent to-brand-lavender-dark 
                             text-white rounded-xl shadow-lg shadow-brand-accent/20
                             hover:shadow-xl hover:shadow-brand-accent/30 transition-shadow
                             disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </motion.button>
                </>
              ) : (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-brand-accent border border-brand-accent/20 
                           hover:bg-brand-accent/5 transition-colors rounded-xl"
                >
                  Edit Profile
                </motion.button>
              )}
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
            Connect Website
          </motion.button>
        </div>

        <div className="p-6">
          {websites.length > 0 ? (
            <div className="space-y-4">
              {websites.map((site) => (
                <div
                  key={site.id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-brand-lavender-light/20 rounded-xl gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-lavender-light/10 rounded-lg">
                      <FaGlobe className="w-6 h-6 text-brand-accent" />
                    </div>
                    <div>
                      <h3 className="font-medium text-brand-text-primary">
                        {site.url}
                      </h3>
                      <p className="text-sm text-brand-text-secondary">
                        {site.type} • {site.plan} Plan
                      </p>
                      <p className="text-sm text-brand-text-secondary">
                        Renews on {new Date(site.renewsOn).toLocaleDateString()}
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
          ) : (
            <div className="text-center py-12">
              <FaGlobe className="w-12 h-12 text-brand-text-secondary/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-brand-text-primary mb-2">
                No Websites Connected
              </h3>
              <p className="text-brand-text-secondary mb-6">
                Connect your first website to start using Voicero.AI
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/app/websites/new")}
                className="px-6 py-3 bg-gradient-to-r from-brand-accent to-brand-lavender-dark 
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
