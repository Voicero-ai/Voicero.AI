import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma"; // Adjust this path as needed

interface Message {
  id: string;
  createdAt: Date;
  content: string;
  type: string | null;
  threadId: string;
  role: string;
  pageUrl: string | null;
  scrollToText: string | null;
}

interface Thread {
  id: string;
  messages: Message[];
}

interface Website {
  id: string;
  url: string;
  name: string | null;
  type: string;
  plan: string;
  active: boolean;
  monthlyQueries: number;
  queryLimit: number;
  lastSyncedAt: Date | null;
  customInstructions: string | null;
  aiThreads: Thread[];
  accessKeys: Array<{ key: string }>;
  popUpQuestions: Array<{
    id: string;
    question: string;
    createdAt: Date;
  }>;
}

export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  try {
    // 1) Extract the 'id' query param => e.g. /api/website/get?id=<websiteId>
    const { searchParams } = new URL(request.url);
    const websiteId = searchParams.get("id");

    if (!websiteId) {
      return NextResponse.json(
        { error: "Missing 'id' query parameter." },
        { status: 400 }
      );
    }

    // Fetch website with aiThreads and messages
    const website = (await prisma.website.findUnique({
      where: { id: websiteId },
      include: {
        accessKeys: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        aiThreads: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            messages: {
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        },
        popUpQuestions: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })) as Website | null;

    if (!website) {
      return NextResponse.json(
        { error: "Website not found." },
        { status: 404 }
      );
    }

    // Let's also log the raw count from the database
    const threadCount = await prisma.aiThread.count({
      where: { websiteId },
    });

    console.log("Raw thread count from database:", threadCount);

    // After the website query
    console.log("Website data:", {
      id: website.id,
      url: website.url,
      threadCount: website.aiThreads.length,
      threads: website.aiThreads.map((thread) => ({
        id: thread.id,
        messageCount: thread.messages.length,
        messages: thread.messages.map((msg) => ({
          role: msg.role,
          type: msg.type,
          content: msg.content.substring(0, 30),
        })),
      })),
    });

    // Calculate global stats and content-specific redirects
    const globalStats = {
      totalAiRedirects: 0,
      totalVoiceChats: 0,
      totalTextChats: 0,
    };

    // Create a map to track redirects per URL
    const urlRedirectCounts = new Map<string, number>();

    // At the start of the counting logic
    console.log("Total threads:", website.aiThreads.length);

    // Iterate through all threads and their messages
    website.aiThreads.forEach((thread: Thread) => {
      let hasVoiceMessage = false;
      let hasTextMessage = false;

      console.log("Thread messages:", thread.messages.length);

      thread.messages.forEach((message: Message) => {
        console.log("Message:", {
          role: message.role,
          type: message.type,
          content: message.content.substring(0, 50) + "...", // First 50 chars
        });

        // Only count user messages for voice/text stats
        if (message.role === "user") {
          if (message.type === "voice") {
            hasVoiceMessage = true;
            console.log("Found voice message");
          }
          if (message.type === "text" || !message.type) {
            hasTextMessage = true;
            console.log("Found text message");
          }
        }

        // Check for redirects in assistant messages
        if (message.role === "assistant") {
          console.log("\n=== Processing Assistant Message ===");
          console.log("Message content:", message.content);

          // Helper function to normalize URLs
          const normalizeUrl = (url: string) => {
            try {
              // If it's a full URL, parse it with URL constructor
              let normalized = url;
              if (url.startsWith("http")) {
                const urlObj = new URL(url);
                normalized = urlObj.pathname;
              }
              // Remove trailing slash and period
              normalized = normalized.replace(/[\/\.]$/, "");
              // Ensure leading slash
              if (!normalized.startsWith("/")) {
                normalized = "/" + normalized;
              }

              // Handle /pages/ prefix for Shopify pages
              if (website.type === "Shopify") {
                if (normalized.startsWith("/pages/")) {
                  return normalized;
                } else if (
                  !normalized.startsWith("/products/") &&
                  !normalized.startsWith("/blogs/")
                ) {
                  return "/pages" + normalized;
                }
              }
              return normalized;
            } catch (e) {
              console.error("Error normalizing URL:", url, e);
              return url;
            }
          };

          // First try to find redirect in pageUrl
          if (message.pageUrl) {
            globalStats.totalAiRedirects++;
            const normalizedUrl = normalizeUrl(message.pageUrl);
            urlRedirectCounts.set(
              normalizedUrl,
              (urlRedirectCounts.get(normalizedUrl) || 0) + 1
            );
          }

          // Try to find URLs in the content first - this is more reliable
          const urlRegex =
            /https?:\/\/[^\s)]+|(?:\/(?:pages|products|blogs)\/[^\s)]+)/g;
          const urls = message.content.match(urlRegex);
          if (urls && urls.length > 0) {
            urls.forEach((url) => {
              globalStats.totalAiRedirects++;
              const normalizedUrl = normalizeUrl(url);
              urlRedirectCounts.set(
                normalizedUrl,
                (urlRedirectCounts.get(normalizedUrl) || 0) + 1
              );
            });
          } else {
            // If no URLs found, try to parse content as JSON as fallback
            try {
              const contentObj = JSON.parse(message.content);
              if (contentObj.redirect_url) {
                globalStats.totalAiRedirects++;
                const normalizedUrl = normalizeUrl(contentObj.redirect_url);
                urlRedirectCounts.set(
                  normalizedUrl,
                  (urlRedirectCounts.get(normalizedUrl) || 0) + 1
                );
              }
            } catch (e) {
              // JSON parsing failed, but that's okay
            }
          }
        }
      });

      if (hasVoiceMessage) {
        globalStats.totalVoiceChats++;
      }
      if (hasTextMessage) {
        globalStats.totalTextChats++;
      }
    });

    // After counting

    // Helper function to get redirect count for a URL - normalize input URL
    const getRedirectCount = (url: string) => {
      // First normalize by removing trailing slash
      let normalizedUrl = url.replace(/\/$/, "");

      // For Shopify pages, we need to check both with and without /pages/ prefix
      if (website.type === "Shopify") {
        // If it's a pages URL without the prefix, add it
        if (
          !normalizedUrl.startsWith("/pages/") &&
          !normalizedUrl.startsWith("/products/") &&
          !normalizedUrl.startsWith("/blogs/")
        ) {
          normalizedUrl = "/pages/" + normalizedUrl;
        }

        // Also check for trailing periods that might have been captured
        normalizedUrl = normalizedUrl.replace(/\.$/, "");
      }

      return urlRedirectCounts.get(normalizedUrl) || 0;
    };

    // 4) We'll store all content (products, blogPosts, pages) here
    let products = [];
    let blogPosts = [];
    let pages = [];

    // 5) Check website.type => If "wordpress", fetch from WordPress tables
    if (website.type === "WordPress") {
      // Fetch WordPress Products with reviews
      const wpProducts = await prisma.wordpressProduct.findMany({
        where: { websiteId },
        orderBy: { updatedAt: "desc" },
        include: {
          reviews: true,
          categories: true,
          tags: true,
          customFields: true,
        },
      });

      console.log("\n=== Processing WordPress Products ===");
      products = wpProducts.map((prod) => {
        const productUrl = `/products/${prod.slug}`;
        console.log(`\nChecking WordPress product: ${prod.name}`, {
          url: productUrl,
        });
        return {
          id: String(prod.id),
          title: prod.name,
          url: productUrl,
          type: "product" as const,
          lastUpdated: prod.updatedAt.toISOString(),
          aiRedirects: getRedirectCount(productUrl),
          description: prod.description,
          price: prod.price,
          regularPrice: prod.regularPrice,
          salePrice: prod.salePrice,
          stockQuantity: prod.stockQuantity,
          categories: prod.categories.map((c) => ({ id: c.id, name: c.name })),
          tags: prod.tags.map((t) => ({ id: t.id, name: t.name })),
          reviews: prod.reviews.map((r) => ({
            id: r.id,
            reviewer: r.reviewer,
            rating: r.rating,
            review: r.review,
            verified: r.verified,
            date: r.date.toISOString(),
          })),
          customFields: prod.customFields.reduce(
            (acc, field) => ({
              ...acc,
              [field.metaKey]: field.metaValue,
            }),
            {}
          ),
        };
      });

      // Fetch WordPress Posts with more relations
      const wpPosts = await prisma.wordpressPost.findMany({
        where: { websiteId },
        orderBy: { updatedAt: "desc" },
        include: {
          author: true,
          categories: true,
          tags: true,
          comments: true,
          customFields: true,
        },
      });

      console.log("\n=== Processing WordPress Posts ===");
      blogPosts = wpPosts.map((post) => {
        const postUrl = `/blog/${post.slug}`;
        console.log(`\nChecking WordPress post: ${post.title}`, {
          url: postUrl,
        });
        return {
          id: String(post.id),
          title: post.title,
          url: postUrl,
          type: "post" as const,
          lastUpdated: post.updatedAt.toISOString(),
          aiRedirects: getRedirectCount(postUrl),
          content: post.excerpt ?? post.content,
          author: post.author?.name ?? "Unknown",
          categories: post.categories.map((c) => ({ id: c.id, name: c.name })),
          tags: post.tags.map((t) => ({ id: t.id, name: t.name })),
          comments: post.comments.map((c) => ({
            id: c.id,
            author: c.authorName,
            content: c.content,
            date: c.date.toISOString(),
            status: c.status,
            parentId: c.parentId,
          })),
          customFields: post.customFields.reduce(
            (acc, field) => ({
              ...acc,
              [field.metaKey]: field.metaValue,
            }),
            {}
          ),
        };
      });

      // Fetching WordPress Pages
      const wpPages = await prisma.wordpressPage.findMany({
        where: { websiteId },
        orderBy: { updatedAt: "desc" },
      });

      console.log("\n=== Processing WordPress Pages ===");
      pages = wpPages.map((p) => {
        const pageUrl = `/${p.slug}`;
        console.log(`\nChecking WordPress page: ${p.title}`, {
          url: pageUrl,
        });
        return {
          id: String(p.id),
          title: p.title,
          url: pageUrl,
          type: "page" as const,
          lastUpdated: p.updatedAt.toISOString(),
          aiRedirects: getRedirectCount(pageUrl),
          content: p.content,
        };
      });

      // 6) If Shopify => fetch from Shopify tables
    } else if (website.type === "Shopify") {
      // Shopify Products with variants, reviews, and images
      const shopifyProducts = await prisma.shopifyProduct.findMany({
        where: { websiteId },
        orderBy: { updatedAt: "desc" },
        include: {
          variants: true,
          reviews: true,
          images: true,
        },
      });

      console.log("\n=== Processing Shopify Products ===");
      products = shopifyProducts.map((prod) => {
        const productUrl = `/products/${prod.handle}`;
        console.log(`\nChecking Shopify product: ${prod.title}`, {
          url: productUrl,
        });
        return {
          id: prod.id,
          title: prod.title,
          url: productUrl,
          type: "product" as const,
          lastUpdated: prod.updatedAt.toISOString(),
          aiRedirects: getRedirectCount(productUrl),
          description: prod.description,
          vendor: prod.vendor,
          productType: prod.productType,
          price: prod.variants[0]?.price || 0,
          variants: prod.variants.map((v) => ({
            id: v.id,
            title: v.title,
            price: v.price,
            sku: v.sku,
            inventory: v.inventory,
          })),
          reviews: prod.reviews.map((r) => ({
            id: r.id,
            reviewer: r.reviewer,
            rating: r.rating,
            review: r.body,
            title: r.title,
            verified: r.verified,
            date: r.createdAt.toISOString(),
          })),
          images: prod.images.map((img) => ({
            id: img.id,
            url: img.url,
            altText: img.altText,
            caption: img.caption,
          })),
        };
      });

      // Shopify Blog Posts with comments
      const shopifyBlogs = await prisma.shopifyBlog.findMany({
        where: { websiteId },
        include: {
          posts: {
            include: {
              comments: true,
            },
            orderBy: { updatedAt: "desc" },
          },
        },
      });

      console.log("\n=== Processing Shopify Blog Posts ===");
      blogPosts = shopifyBlogs.flatMap((blog) =>
        blog.posts.map((post) => {
          const postUrl = `/blogs/${blog.handle}/${post.handle}`;
          console.log(`\nChecking Shopify blog post: ${post.title}`, {
            url: postUrl,
          });
          return {
            id: post.id,
            title: post.title,
            url: postUrl,
            type: "post" as const,
            lastUpdated: post.updatedAt.toISOString(),
            aiRedirects: getRedirectCount(postUrl),
            content: post.content,
            author: post.author,
            image: post.image,
            blog: {
              id: blog.id,
              title: blog.title,
              handle: blog.handle,
            },
            comments: post.comments.map((c) => ({
              id: c.id,
              author: c.author,
              content: c.body,
              email: c.email,
              status: c.status,
              date: c.createdAt.toISOString(),
            })),
          };
        })
      );

      // Shopify Pages
      const shopifyPages = await prisma.shopifyPage.findMany({
        where: { websiteId },
        orderBy: { updatedAt: "desc" },
      });

      console.log("\n=== Processing Shopify Pages ===");
      pages = shopifyPages.map((p) => {
        const pageUrl = `/pages/${p.handle}`;
        console.log(`\nChecking Shopify page: ${p.title}`, {
          url: pageUrl,
        });
        return {
          id: p.id,
          title: p.title,
          url: pageUrl,
          type: "page" as const,
          lastUpdated: p.updatedAt.toISOString(),
          aiRedirects: getRedirectCount(pageUrl),
          content: p.content,
        };
      });
    } else {
      return NextResponse.json(
        { error: `Unsupported website type: ${website.type}` },
        { status: 400 }
      );
    }

    // After processing all messages, log the final counts
    console.log("\n=== Final URL Redirect Counts ===");
    console.log("Global redirects total:", globalStats.totalAiRedirects);
    console.log("URL-specific counts:");
    urlRedirectCounts.forEach((count, url) => {
      console.log(`${url}: ${count} redirects`);
    });

    // 7) Finally, return a structure matching your front-end:
    //    domain, type, plan, status, monthlyQueries, queryLimit, etc.
    //    plus lastSync (from website.lastSyncedAt)
    //    plus globalStats, plus stats (if needed), plus content
    const responseData = {
      id: website.id,
      domain: website.url,
      type: website.type, // 'WordPress' or 'Shopify'
      plan: website.plan,
      name: website.name,
      status: website.active ? "active" : "inactive",
      monthlyQueries: website.monthlyQueries,
      queryLimit: website.queryLimit,
      lastSync: website.lastSyncedAt?.toISOString() || null,
      accessKey: website.accessKeys[0]?.key || null,
      // Add custom instructions
      customInstructions: website.customInstructions,
      // Add pop-up questions
      popUpQuestions: website.popUpQuestions.map((q) => ({
        id: q.id,
        question: q.question,
        createdAt: q.createdAt.toISOString(),
      })),
      globalStats,
      stats: {
        aiRedirects: globalStats.totalAiRedirects,
        totalRedirects: globalStats.totalAiRedirects,
        redirectRate:
          website.monthlyQueries > 0
            ? (globalStats.totalAiRedirects / website.monthlyQueries) * 100
            : 0,
      },
      content: {
        products,
        blogPosts,
        pages,
      },
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (err) {
    console.error("Failed to retrieve website data:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
