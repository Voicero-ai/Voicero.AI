"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaSync,
  FaCreditCard,
  FaShoppingBag,
  FaNewspaper,
  FaFile,
  FaExternalLinkAlt,
  FaCheck,
  FaPowerOff,
} from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// Type for each content item
interface ContentItem {
  id: string;
  title: string;
  url: string;
  type: "product" | "post" | "page";
  lastUpdated: string;
  aiRedirects: number;
  categories?: Array<{ id: number; name: string }>;
  tags?: Array<{ id: number; name: string }>;
  comments?: Array<{
    id: number;
    author: string;
    content: string;
    date: string;
    status: string;
    parentId?: number;
  }>;
  reviews?: Array<{
    id: number;
    reviewer: string;
    rating: number;
    review: string;
    verified: boolean;
    date: string;
  }>;
  customFields?: Record<string, string>;
  price?: number;
  regularPrice?: number;
  salePrice?: number;
  stockQuantity?: number;
  [key: string]: any;
}

// Data shape from the new API route
interface WebsiteData {
  id: string;
  domain: string;
  type: string;
  plan: string;
  name: string;
  active: boolean;
  status: "active" | "inactive";
  monthlyQueries: number;
  queryLimit: number;
  lastSync: string | null;
  accessKey: string | null;
  globalStats: {
    totalAiRedirects: number;
    totalVoiceChats: number;
    totalTextChats: number;
  };
  stats: {
    aiRedirects: number;
    totalRedirects: number;
    redirectRate: number;
  };
  content: {
    products: ContentItem[];
    blogPosts: ContentItem[];
    pages: ContentItem[];
  };
  stripeId?: string;
  customInstructions: string | null;
  popUpQuestions: Array<{
    id: string;
    question: string;
    createdAt: string;
  }>;
}

// Add these interfaces at the top with your other interfaces
interface SetupInstructions {
  wordpress: {
    steps: string[];
    pluginUrl: string;
    appUrl?: never;
  };
  shopify: {
    steps: string[];
    appUrl: string;
    pluginUrl?: never;
  };
}

// Add this helper function at the top of the file
function countWords(str: string): number {
  return str.trim().split(/\s+/).length;
}

export default function WebsiteSettings() {
  const searchParams = useSearchParams();
  const websiteId = searchParams.get("id");

  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Active tab
  const [activeTab, setActiveTab] = useState<"products" | "posts" | "pages">(
    "products"
  );

  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Add this state to track the toggle operation
  const [isToggling, setIsToggling] = useState(false);

  // Add this state for syncing status
  const [isSyncingInstructions, setIsSyncingInstructions] = useState(false);

  const setupInstructions: SetupInstructions = {
    wordpress: {
      steps: [
        "Download and install our WordPress plugin",
        "Go to plugin settings",
        "Enter your access key if it is not already set",
        "Click 'Sync Content Now'",
      ],
      pluginUrl: "https://wordpress.org/plugins/your-plugin", // Replace with actual URL
    },
    shopify: {
      steps: [
        "Install our Shopify app from the Shopify App Store",
        "Go to app settings",
        "Enter your access key if it is not already set",
        "Click 'Sync Content Now'",
      ],
      appUrl: "https://apps.shopify.com/your-app", // Replace with actual URL
    },
  };

  // 1) Fetch the data from our new route: /api/website/get?id=<websiteId>
  useEffect(() => {
    if (!websiteId) return;
    setIsLoading(true);

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/websites/get?id=${websiteId}`, {
          method: "GET",
        });
        if (!res.ok) {
          console.error("Failed to fetch website data:", res.status);
          return;
        }
        const data = await res.json();
        console.log("Website data:", data);
        setWebsiteData(data);
      } catch (error) {
        console.error("Error fetching website data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [websiteId]);

  // Check if setup is needed when data loads
  useEffect(() => {
    if (websiteData && !websiteData.lastSync) {
      setShowSetupModal(true);
    }
  }, [websiteData]);

  // 2) Handle sync
  const handleSync = async () => {
    if (!websiteData) return;

    setIsSyncing(true);
    try {
      const type = websiteData.type?.toLowerCase() || "";
      const isWordPress =
        type === "wordpress" || type === "wp" || type.includes("wordpress");

      if (isWordPress) {
        // WordPress logic remains the same
        const adminUrl = `${websiteData.domain}/wp-admin/admin.php?page=ai-website-admin`;
        window.open(adminUrl, "_blank");
      } else if (type === "shopify") {
        // Extract store name from domain - handle both myshopify.com and custom domains
        const storeName = websiteData.domain
          .replace(/^https?:\/\//, "") // Remove http:// or https://
          .split(".")[0]; // Get the first part of the domain

        // Redirect to Shopify admin app page
        const shopifyAdminUrl = `https://admin.shopify.com/store/${storeName}/apps/voicero-app-shop/app`;
        window.open(shopifyAdminUrl, "_blank");
      }
    } catch (error) {
      console.error("Error during sync:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Add subscription management functions
  const handleManageSubscription = async () => {
    if (!websiteData) return;

    try {
      const type = websiteData.type?.toLowerCase() || "";

      if (type === "shopify") {
        // Extract store name from domain - handle both myshopify.com and custom domains
        const storeName = websiteData.domain
          .replace(/^https?:\/\//, "") // Remove http:// or https://
          .split(".")[0]; // Get the first part of the domain

        // Redirect to Shopify admin pricing page
        const shopifyPricingUrl = `https://admin.shopify.com/store/${storeName}/apps/voicero-app-shop/app/pricing`;
        window.open(shopifyPricingUrl, "_blank");
        return;
      }

      // Original logic for non-Shopify websites
      if (websiteData.plan === "Pro") {
        const response = await fetch("/api/stripe/portal", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            websiteId: websiteData.id,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Portal session error:", data);
          throw new Error(data.error || "Failed to create portal session");
        }

        window.location.href = data.url;
      } else {
        setShowSubscriptionModal(true);
      }
    } catch (error) {
      console.error("Error managing subscription:", error);
    }
  };

  // Add this function inside WebsiteSettings component
  const handleToggleStatus = async () => {
    if (!websiteData || isToggling) return;

    // Prevent activation if never synced
    if (!websiteData.lastSync) {
      setShowSetupModal(true);
      return;
    }

    const currentActive = websiteData.active;
    const newStatus = !currentActive;

    setIsToggling(true);

    try {
      // Optimistically update the UI
      setWebsiteData({
        ...websiteData,
        active: newStatus,
        status: newStatus ? "active" : "inactive",
      } as WebsiteData);

      const response = await fetch("/api/websites/toggle-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          websiteId: websiteData.id,
        }),
      });

      if (!response.ok) {
        // Revert using the stored original state
        setWebsiteData({
          ...websiteData,
          active: currentActive,
          status: currentActive ? "active" : "inactive",
        } as WebsiteData);
        throw new Error("Failed to toggle status");
      }

      const data = await response.json();
      // Update with server response to ensure sync
      setWebsiteData({
        ...websiteData,
        active: data.status === "active",
        status: data.status,
      } as WebsiteData);
    } catch (error) {
      console.error("Error toggling status:", error);
    } finally {
      setIsToggling(false);
    }
  };

  // Add this function to handle syncing instructions with OpenAI assistants
  const handleSyncInstructions = async () => {
    if (!websiteData) return;

    setIsSyncingInstructions(true);
    try {
      const response = await fetch("/api/websites/sync-instructions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          websiteId: websiteData.id,
          instructions: websiteData.customInstructions,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to sync instructions");
      }

      // Show success toast or message
    } catch (error) {
      console.error("Error syncing instructions:", error);
      // Show error toast or message
    } finally {
      setIsSyncingInstructions(false);
    }
  };

  // 3) If loading or no data yet, show a loading state
  if (isLoading || !websiteData) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <p className="text-brand-text-secondary">Loading website data...</p>
      </div>
    );
  }

  // 4) We have the data now. Let's destructure
  const {
    domain,
    status,
    type,
    plan,
    name,
    monthlyQueries,
    queryLimit,
    globalStats,
    content,
  } = websiteData;

  // For convenience in the tab content
  const { products, blogPosts, pages } = content;

  // 5) We reuse your ContentList component for each tab
  const ContentList = ({ items }: { items: ContentItem[] }) => {
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [showReviews, setShowReviews] = useState<Record<string, boolean>>({});
    const [showComments, setShowComments] = useState<Record<string, boolean>>(
      {}
    );
    const [showVariants, setShowVariants] = useState<Record<string, boolean>>(
      {}
    );
    const [showImages, setShowImages] = useState<Record<string, boolean>>({});

    const toggleExpand = (itemId: string) => {
      setExpandedItems((prev) =>
        prev.includes(itemId)
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId]
      );
    };

    const toggleReviews = (itemId: string) => {
      setShowReviews((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
    };

    const toggleComments = (itemId: string) => {
      setShowComments((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
    };

    const toggleVariants = (itemId: string) => {
      setShowVariants((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
    };

    const toggleImages = (itemId: string) => {
      setShowImages((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
    };

    return (
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-white rounded-lg border border-brand-lavender-light/20"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-brand-text-primary">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm text-brand-text-secondary">
                  {domain}
                  {item.url}
                </p>
              </div>
              <a
                href={`https://${domain}${item.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-brand-text-secondary hover:text-brand-accent 
                           transition-colors rounded-lg hover:bg-brand-lavender-light/5"
              >
                <FaExternalLinkAlt className="w-4 h-4" />
              </a>
            </div>

            {/* Categories and Tags */}
            {((item.categories?.length ?? 0) > 0 ||
              (item.tags?.length ?? 0) > 0) && (
              <div className="flex flex-wrap gap-2 mb-3">
                {item.categories?.map((cat) => (
                  <span
                    key={cat.id}
                    className="px-2 py-1 text-xs bg-brand-lavender-light/10 rounded-full"
                  >
                    {cat.name}
                  </span>
                ))}
                {item.tags?.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-2 py-1 text-xs bg-brand-accent/10 rounded-full"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Product-specific information */}
            {item.type === "product" && (
              <div className="mb-3 space-y-2">
                <div className="flex items-center gap-4">
                  {item.price && (
                    <span className="text-lg font-semibold text-brand-accent">
                      ${item.price}
                    </span>
                  )}
                  {item.salePrice && item.regularPrice && (
                    <span className="text-sm text-brand-text-secondary line-through">
                      ${item.regularPrice}
                    </span>
                  )}
                  {item.stockQuantity !== undefined && (
                    <span className="text-sm text-brand-text-secondary">
                      Stock: {item.stockQuantity}
                    </span>
                  )}
                  {item.vendor && (
                    <span className="text-sm text-brand-text-secondary">
                      Vendor: {item.vendor}
                    </span>
                  )}
                  {item.productType && (
                    <span className="text-sm text-brand-text-secondary">
                      Type: {item.productType}
                    </span>
                  )}
                </div>

                {/* Product Variants */}
                {item.variants && item.variants.length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => toggleVariants(item.id)}
                      className="text-brand-accent hover:text-brand-accent/80 transition-colors"
                    >
                      {showVariants[item.id]
                        ? "Hide Variants"
                        : `Show Variants (${item.variants.length})`}
                    </button>
                    {showVariants[item.id] && (
                      <div className="mt-2 grid gap-2">
                        {item.variants.map((variant: any) => (
                          <div
                            key={variant.id}
                            className="p-2 bg-brand-lavender-light/5 rounded-lg"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">
                                {variant.title}
                              </span>
                              <span className="text-brand-accent">
                                ${variant.price}
                              </span>
                            </div>
                            {variant.sku && (
                              <span className="text-sm text-brand-text-secondary">
                                SKU: {variant.sku}
                              </span>
                            )}
                            {variant.inventory !== null && (
                              <span className="text-sm text-brand-text-secondary ml-4">
                                Stock: {variant.inventory}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Product Images */}
                {item.images && item.images.length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => toggleImages(item.id)}
                      className="text-brand-accent hover:text-brand-accent/80 transition-colors"
                    >
                      {showImages[item.id]
                        ? "Hide Images"
                        : `Show Images (${item.images.length})`}
                    </button>
                    {showImages[item.id] && (
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                        {item.images.map((image: any) => (
                          <div
                            key={image.id}
                            className="relative aspect-square rounded-lg overflow-hidden"
                          >
                            <img
                              src={image.url}
                              alt={image.altText || item.title}
                              className="object-cover w-full h-full"
                            />
                            {image.caption && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-1 text-xs">
                                {image.caption}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Blog post specific information */}
            {item.type === "post" && item.blog && (
              <div className="mb-2 text-sm text-brand-text-secondary">
                <span>Blog: {item.blog.title}</span>
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="mt-2 rounded-lg max-h-48 object-cover"
                  />
                )}
              </div>
            )}

            {/* Description / content snippet */}
            <div className="text-sm text-brand-text-secondary mb-3">
              <p
                className={
                  expandedItems.includes(item.id) ? "" : "line-clamp-2"
                }
              >
                {item.content ?? item.description}
              </p>
              <button
                onClick={() => toggleExpand(item.id)}
                className="text-brand-accent hover:text-brand-accent/80 transition-colors mt-1"
              >
                {expandedItems.includes(item.id) ? "Show less" : "Read more..."}
              </button>
            </div>

            {/* Reviews section for products */}
            {item.type === "product" && (item.reviews?.length ?? 0) > 0 && (
              <div className="mt-4 border-t border-brand-lavender-light/20 pt-4">
                <button
                  onClick={() => toggleReviews(item.id)}
                  className="text-brand-accent hover:text-brand-accent/80 transition-colors"
                >
                  {showReviews[item.id]
                    ? "Hide Reviews"
                    : `Show Reviews (${item.reviews?.length ?? 0})`}
                </button>

                {showReviews[item.id] && (
                  <div className="mt-3 space-y-3">
                    {item.reviews?.map((review) => (
                      <div
                        key={review.id}
                        className="p-3 bg-brand-lavender-light/5 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{review.reviewer}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-yellow-400">
                              {"★".repeat(review.rating)}
                              {"☆".repeat(5 - review.rating)}
                            </span>
                            {review.verified && (
                              <span className="text-xs text-green-500">
                                Verified Purchase
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm">{review.review}</p>
                        <span className="text-xs text-brand-text-secondary mt-2 block">
                          {new Date(review.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Comments section for posts */}
            {item.type === "post" && (item.comments?.length ?? 0) > 0 && (
              <div className="mt-4 border-t border-brand-lavender-light/20 pt-4">
                <button
                  onClick={() => toggleComments(item.id)}
                  className="text-brand-accent hover:text-brand-accent/80 transition-colors"
                >
                  {showComments[item.id]
                    ? "Hide Comments"
                    : `Show Comments (${item.comments?.length ?? 0})`}
                </button>

                {showComments[item.id] && (
                  <div className="mt-3 space-y-3">
                    {item.comments?.map((comment) => (
                      <div
                        key={comment.id}
                        className={`p-3 bg-brand-lavender-light/5 rounded-lg ${
                          comment.parentId ? "ml-8" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{comment.author}</span>
                          <span className="text-xs text-brand-text-secondary">
                            {new Date(comment.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-brand-text-secondary border-t border-brand-lavender-light/20 pt-3">
              <div className="flex items-center gap-4">
                <span>
                  Last updated:{" "}
                  {new Date(item.lastUpdated).toLocaleDateString()}
                </span>
                {item.type === "product" && item.price && (
                  <span className="font-medium">${item.price}</span>
                )}
                {/* If it's a post and has an 'author' field */}
                {item.type === "post" && item.author && (
                  <span>By {item.author}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium text-brand-accent">
                  {item.aiRedirects.toLocaleString()}
                </span>
                <span>AI redirects</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Setup Modal Component
  const SetupModal = () => {
    // Fix the type check to be case-insensitive and more robust
    const type = websiteData?.type?.toLowerCase() || "";
    const isWordPress =
      type === "wordpress" || type === "wp" || type.includes("wordpress");
    const instructions = isWordPress
      ? setupInstructions.wordpress
      : setupInstructions.shopify;

    if (!showSetupModal) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-brand-text-primary">
              Setup Required
            </h2>
            <button
              onClick={() => setShowSetupModal(false)}
              className="text-brand-text-secondary hover:text-brand-text-primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <p className="text-brand-text-secondary mb-4">
              To start syncing your {isWordPress ? "WordPress" : "Shopify"}{" "}
              content, please follow these steps:
            </p>

            <ol className="space-y-3">
              {instructions.steps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="text-brand-accent font-medium">
                    {index + 1}.
                  </span>
                  <span className="text-brand-text-secondary">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-4">
            <a
              href={isWordPress ? instructions.pluginUrl : instructions.appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-4 py-2 bg-brand-accent text-white 
                       rounded-lg text-center hover:bg-brand-accent/90 
                       transition-colors"
            >
              {isWordPress ? "Download Plugin" : "Install App"}
            </a>

            <div className="p-4 bg-brand-lavender-light/5 rounded-lg">
              <p className="text-sm text-brand-text-secondary mb-2">
                Your Access Key:
              </p>
              <code className="block p-2 bg-gray-100 rounded text-sm font-mono break-all">
                {websiteData?.accessKey || "Loading..."}
              </code>
            </div>

            <button
              onClick={() => setShowSetupModal(false)}
              className="block w-full px-4 py-2 border border-brand-accent/20 
                       text-brand-accent rounded-lg text-center 
                       hover:bg-brand-accent/5 transition-colors"
            >
              I&apos;ll do this later
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Subscription Modal Component
  const SubscriptionModal = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleUpgrade = async () => {
      if (!websiteData) return;

      setIsLoading(true);
      try {
        const response = await fetch("/api/stripe/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            websiteId: websiteData.id,
            plan: "Pro",
            successUrl: `${window.location.origin}/app/websites/new/complete?session_id={CHECKOUT_SESSION_ID}&id=${websiteData.id}`,
            cancelUrl: `${window.location.origin}/app/websites/website?id=${websiteData.id}&canceled=true`,
          }),
        });

        if (!response.ok) throw new Error("Failed to create checkout session");

        const { url } = await response.json();
        window.location.href = url;
      } catch (error) {
        console.error("Error upgrading plan:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!showSubscriptionModal) return null;

    // Don't show upgrade modal for Pro users
    if (websiteData?.plan === "Pro") return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-brand-text-primary">
              Upgrade to Pro
            </h2>
            <button
              onClick={() => setShowSubscriptionModal(false)}
              className="text-brand-text-secondary hover:text-brand-text-primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <p className="text-brand-text-secondary mb-4">
              Upgrade to Pro to unlock:
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-brand-text-secondary">
                <FaCheck className="w-4 h-4 text-green-500" />
                <span>50,000 monthly queries</span>
              </li>
              <li className="flex items-center gap-2 text-brand-text-secondary">
                <FaCheck className="w-4 h-4 text-green-500" />
                <span>Priority support</span>
              </li>
              <li className="flex items-center gap-2 text-brand-text-secondary">
                <FaCheck className="w-4 h-4 text-green-500" />
                <span>Advanced analytics</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="block w-full px-4 py-2 bg-brand-accent text-white 
                       rounded-lg text-center hover:bg-brand-accent/90 
                       transition-colors disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Upgrade Now - $10/month"}
            </button>
            <button
              onClick={() => setShowSubscriptionModal(false)}
              className="block w-full px-4 py-2 border border-brand-accent/20 
                       text-brand-accent rounded-lg text-center 
                       hover:bg-brand-accent/5 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <SetupModal />
      <SubscriptionModal />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-brand-text-primary">
              {name}
            </h1>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                status === "active"
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {status}
            </span>
            <a
              href={`${domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-brand-text-secondary hover:text-brand-accent 
                         transition-colors rounded-lg hover:bg-brand-lavender-light/5"
            >
              <FaExternalLinkAlt className="w-4 h-4" />
            </a>
          </div>
          <p className="text-brand-text-secondary">
            {domain} • {type} • {plan} Plan
          </p>
        </div>
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: !websiteData.lastSync ? 1 : 1.02 }}
            whileTap={{ scale: !websiteData.lastSync ? 1 : 0.98 }}
            onClick={handleToggleStatus}
            disabled={isToggling || !websiteData.lastSync}
            title={
              !websiteData.lastSync
                ? "Please sync your content before activating"
                : ""
            }
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
              status === "active"
                ? "bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/20"
                : "bg-brand-lavender-dark text-white hover:bg-brand-lavender-dark/90"
            } ${
              isToggling || !websiteData.lastSync
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <FaPowerOff
              className={`w-4 h-4 ${isToggling ? "animate-spin" : ""}`}
            />
            {isToggling
              ? "Updating..."
              : status === "active"
              ? "Deactivate"
              : "Activate"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSync}
            disabled={isSyncing}
            className="px-4 py-2 text-brand-accent border border-brand-accent/20 
                       rounded-xl hover:bg-brand-accent/5 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSync
              className={`inline-block mr-2 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Syncing..." : "Sync Content"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleManageSubscription}
            className="px-4 py-2 bg-gradient-to-r from-brand-accent to-brand-lavender-dark 
                       text-white rounded-xl shadow-lg shadow-brand-accent/20
                       hover:shadow-xl hover:shadow-brand-accent/30 transition-shadow"
          >
            <FaCreditCard className="inline-block mr-2" />
            {plan === "Pro" ? "Manage Subscription" : "Upgrade Plan"}
          </motion.button>
        </div>
      </div>

      {/* Usage */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 p-6">
        <h2 className="text-xl font-semibold text-brand-text-primary mb-4">
          Usage
        </h2>
        <div className="bg-brand-lavender-light/5 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-brand-text-secondary">
              Monthly Queries
            </span>
            <span className="text-sm font-medium text-brand-text-primary">
              {monthlyQueries.toLocaleString()} / {queryLimit.toLocaleString()}
            </span>
          </div>
          <div className="w-full bg-brand-lavender-light/20 rounded-full h-2">
            <div
              className="bg-brand-accent h-2 rounded-full transition-all"
              style={{
                width: `${(monthlyQueries / queryLimit) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Custom Instructions */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-brand-text-primary">
            AI Assistant Instructions
          </h2>
          <div className="flex items-center gap-4">
            <span
              className={`text-sm ${
                countWords(websiteData?.customInstructions || "") > 300
                  ? "text-red-500"
                  : "text-brand-text-secondary"
              }`}
            >
              {countWords(websiteData?.customInstructions || "")} / 300 words
            </span>
            <button
              onClick={handleSyncInstructions}
              disabled={isSyncingInstructions}
              className="px-3 py-1 text-sm bg-brand-accent text-white rounded-lg 
                        hover:bg-brand-accent/90 transition-colors disabled:opacity-50"
            >
              {isSyncingInstructions ? (
                <>
                  <FaSync className="inline-block mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <FaSync className="inline-block mr-2" />
                  Sync with AI
                </>
              )}
            </button>
          </div>
        </div>
        <div className="space-y-4">
          <textarea
            value={websiteData?.customInstructions || ""}
            onChange={async (e) => {
              // Check word count
              if (countWords(e.target.value) > 300) {
                return; // Don't update if exceeding limit
              }

              // Optimistically update
              setWebsiteData({
                ...websiteData!,
                customInstructions: e.target.value,
              } as WebsiteData);

              // Update in database
              try {
                const response = await fetch(
                  "/api/websites/update-instructions",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      websiteId: websiteData?.id,
                      instructions: e.target.value,
                    }),
                  }
                );

                if (!response.ok) {
                  const data = await response.json();
                  throw new Error(
                    data.error || "Failed to update instructions"
                  );
                }
              } catch (error) {
                console.error("Error updating instructions:", error);
                // Revert on error
                setWebsiteData({
                  ...websiteData!,
                  customInstructions: websiteData?.customInstructions,
                } as WebsiteData);
              }
            }}
            placeholder="Add custom instructions for how the AI assistant should behave when chatting with your customers..."
            className={`w-full h-32 p-3 rounded-lg border 
                       ${
                         countWords(websiteData?.customInstructions || "") > 300
                           ? "border-red-500"
                           : "border-brand-lavender-light/20"
                       }
                       focus:outline-none focus:ring-2 focus:ring-brand-accent/20`}
          />
          <div className="flex items-center justify-between">
            <p className="text-sm text-brand-text-secondary">
              These instructions will guide how the AI assistant interacts with
              your customers.
            </p>
            {countWords(websiteData?.customInstructions || "") > 300 && (
              <p className="text-sm text-red-500">
                Instructions cannot exceed 300 words
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Pop-up Questions */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-brand-text-primary">
            Pop-up Questions
          </h2>
          <span className="text-sm text-brand-text-secondary">
            {websiteData?.popUpQuestions?.length || 0} / 5 questions
          </span>
        </div>

        <div className="space-y-4">
          {websiteData?.popUpQuestions?.map((question, index) => (
            <div key={question.id} className="flex items-center gap-3">
              <input
                type="text"
                value={question.question}
                onChange={async (e) => {
                  const newQuestions = [...(websiteData?.popUpQuestions || [])];
                  newQuestions[index] = {
                    ...question,
                    question: e.target.value,
                  };

                  // Optimistically update
                  setWebsiteData({
                    ...websiteData!,
                    popUpQuestions: newQuestions,
                  } as WebsiteData);

                  // Update in database
                  try {
                    const response = await fetch(
                      "/api/websites/update-question",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          questionId: question.id,
                          question: e.target.value,
                        }),
                      }
                    );

                    if (!response.ok)
                      throw new Error("Failed to update question");
                  } catch (error) {
                    console.error("Error updating question:", error);
                    // Revert on error
                    setWebsiteData({
                      ...websiteData!,
                      popUpQuestions: websiteData?.popUpQuestions,
                    } as WebsiteData);
                  }
                }}
                className="flex-1 p-2 rounded-lg border border-brand-lavender-light/20 
                           focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
              />
              <button
                onClick={async () => {
                  // Optimistically update
                  setWebsiteData({
                    ...websiteData!,
                    popUpQuestions: websiteData?.popUpQuestions?.filter(
                      (q) => q.id !== question.id
                    ),
                  } as WebsiteData);

                  // Delete from database
                  try {
                    const response = await fetch(
                      "/api/websites/delete-question",
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                          questionId: question.id,
                        }),
                      }
                    );

                    if (!response.ok)
                      throw new Error("Failed to delete question");
                  } catch (error) {
                    console.error("Error deleting question:", error);
                    // Revert on error
                    setWebsiteData({
                      ...websiteData!,
                      popUpQuestions: websiteData?.popUpQuestions,
                    } as WebsiteData);
                  }
                }}
                className="p-2 text-red-500 hover:text-red-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}

          {(websiteData?.popUpQuestions?.length || 0) < 5 && (
            <button
              onClick={async () => {
                try {
                  const response = await fetch("/api/websites/add-question", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      websiteId: websiteData?.id,
                      question: "New Question",
                    }),
                  });

                  if (!response.ok) throw new Error("Failed to add question");

                  const newQuestion = await response.json();

                  setWebsiteData({
                    ...websiteData!,
                    popUpQuestions: [
                      ...(websiteData?.popUpQuestions || []),
                      newQuestion,
                    ],
                  } as WebsiteData);
                } catch (error) {
                  console.error("Error adding question:", error);
                }
              }}
              className="w-full p-2 border-2 border-dashed border-brand-lavender-light/20 
                         rounded-lg text-brand-text-secondary hover:text-brand-accent 
                         hover:border-brand-accent/20 transition-colors"
            >
              + Add Question
            </button>
          )}

          <p className="text-sm text-brand-text-secondary">
            These questions will be shown to users in a pop-up when they first
            visit your website.
          </p>
        </div>
      </div>

      {/* Global Statistics */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 p-6">
        <h2 className="text-xl font-semibold text-brand-text-primary mb-6">
          Global Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm text-brand-text-secondary mb-2">
              Total AI Redirects
            </h3>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-brand-accent">
                {globalStats.totalAiRedirects.toLocaleString()}
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-sm text-brand-text-secondary mb-2">
              Voice Chats
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-brand-text-primary">
                {globalStats.totalVoiceChats.toLocaleString()}
              </span>
              <Link
                href={`/app/chats?website=${websiteData.id}&type=voice`}
                className="text-sm text-brand-accent hover:text-brand-accent/80 transition-colors"
              >
                View chats →
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm text-brand-text-secondary mb-2">
              Text Chats
            </h3>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-brand-text-primary">
                {globalStats.totalTextChats.toLocaleString()}
              </span>
              <Link
                href={`/app/chats?website=${websiteData.id}&type=text`}
                className="text-sm text-brand-accent hover:text-brand-accent/80 transition-colors"
              >
                View chats →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-brand-lavender-light/20 overflow-hidden">
        <div className="border-b border-brand-lavender-light/20">
          <div className="flex">
            <button
              onClick={() => setActiveTab("products")}
              className={`px-6 py-4 text-sm font-medium transition-colors relative
                ${
                  activeTab === "products"
                    ? "text-brand-accent"
                    : "text-brand-text-secondary"
                }`}
            >
              <FaShoppingBag className="inline-block mr-2" />
              Products
              {activeTab === "products" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`px-6 py-4 text-sm font-medium transition-colors relative
                ${
                  activeTab === "posts"
                    ? "text-brand-accent"
                    : "text-brand-text-secondary"
                }`}
            >
              <FaNewspaper className="inline-block mr-2" />
              Blog Posts
              {activeTab === "posts" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("pages")}
              className={`px-6 py-4 text-sm font-medium transition-colors relative
                ${
                  activeTab === "pages"
                    ? "text-brand-accent"
                    : "text-brand-text-secondary"
                }`}
            >
              <FaFile className="inline-block mr-2" />
              Pages
              {activeTab === "pages" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent"
                />
              )}
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "products" && <ContentList items={products} />}
          {activeTab === "posts" && <ContentList items={blogPosts} />}
          {activeTab === "pages" && <ContentList items={pages} />}
        </div>
      </div>
    </div>
  );
}
