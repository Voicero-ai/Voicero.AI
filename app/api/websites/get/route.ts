import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma"; // Adjust this path as needed

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
    const website = await prisma.website.findUnique({
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
    });

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

    // After the website query and before the stats calculation
    const rawThreads = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM AiThread 
      WHERE websiteId = ${websiteId}`;

    console.log("Raw SQL thread count:", rawThreads);

    // Also check a few threads directly
    const sampleThreads = await prisma.$queryRaw`
      SELECT id, threadId, websiteId 
      FROM AiThread 
      WHERE websiteId = ${websiteId} 
      LIMIT 5`;

    console.log("Sample threads:", sampleThreads);

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
    website.aiThreads.forEach((thread) => {
      let hasVoiceMessage = false;
      let hasTextMessage = false;

      console.log("Thread messages:", thread.messages.length);

      thread.messages.forEach((message) => {
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

        // Check for redirects (keep existing redirect counting logic)
        try {
          const contentJson = JSON.parse(message.content);
          if (contentJson.redirect_url) {
            globalStats.totalAiRedirects++;
            const url = new URL(contentJson.redirect_url);
            const normalizedUrl = url.pathname.replace(/\/$/, "");
            urlRedirectCounts.set(
              normalizedUrl,
              (urlRedirectCounts.get(normalizedUrl) || 0) + 1
            );
          }
        } catch (e) {
          if (message.pageUrl) {
            globalStats.totalAiRedirects++;
            const url = new URL(message.pageUrl);
            const normalizedUrl = url.pathname.replace(/\/$/, "");
            urlRedirectCounts.set(
              normalizedUrl,
              (urlRedirectCounts.get(normalizedUrl) || 0) + 1
            );
          }
        }
      });

      if (hasVoiceMessage) {
        globalStats.totalVoiceChats++;
        console.log("Incrementing voice chats");
      }
      if (hasTextMessage) {
        globalStats.totalTextChats++;
        console.log("Incrementing text chats");
      }
    });

    // After counting
    console.log("Final stats:", globalStats);

    // Helper function to get redirect count for a URL - normalize input URL
    const getRedirectCount = (url: string) => {
      const normalizedUrl = url.replace(/\/$/, ""); // Remove trailing slash
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

      products = wpProducts.map((prod) => ({
        id: String(prod.id),
        title: prod.name,
        url: `/products/${prod.slug}`,
        type: "product" as const,
        lastUpdated: prod.updatedAt.toISOString(),
        aiRedirects: getRedirectCount(`/products/${prod.slug}`),
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
      }));

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

      blogPosts = wpPosts.map((post) => ({
        id: String(post.id),
        title: post.title,
        url: `/blog/${post.slug}`,
        type: "post" as const,
        lastUpdated: post.updatedAt.toISOString(),
        aiRedirects: getRedirectCount(`/blog/${post.slug}`),
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
      }));

      // Fetching WordPress Pages
      const wpPages = await prisma.wordpressPage.findMany({
        where: { websiteId },
        orderBy: { updatedAt: "desc" },
      });

      pages = wpPages.map((p) => ({
        id: String(p.id),
        title: p.title,
        url: `/${p.slug}`, // or p.link
        type: "page" as const,
        lastUpdated: p.updatedAt.toISOString(),
        aiRedirects: getRedirectCount(`/${p.slug}`),
        content: p.content,
      }));

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

      products = shopifyProducts.map((prod) => ({
        id: prod.id,
        title: prod.title,
        url: `/products/${prod.handle}`,
        type: "product" as const,
        lastUpdated: prod.updatedAt.toISOString(),
        aiRedirects: getRedirectCount(`/products/${prod.handle}`),
        description: prod.description,
        // Add more product details
        vendor: prod.vendor,
        productType: prod.productType,
        // Format price from first variant
        price: prod.variants[0]?.price || 0,
        // Include all variants
        variants: prod.variants.map((v) => ({
          id: v.id,
          title: v.title,
          price: v.price,
          sku: v.sku,
          inventory: v.inventory,
        })),
        // Include reviews
        reviews: prod.reviews.map((r) => ({
          id: r.id,
          reviewer: r.reviewer,
          rating: r.rating,
          review: r.body,
          title: r.title,
          verified: r.verified,
          date: r.createdAt.toISOString(),
        })),
        // Include images
        images: prod.images.map((img) => ({
          id: img.id,
          url: img.url,
          altText: img.altText,
          caption: img.caption,
        })),
      }));

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

      blogPosts = shopifyBlogs.flatMap((blog) =>
        blog.posts.map((post) => ({
          id: post.id,
          title: post.title,
          url: `/blogs/${blog.handle}/${post.handle}`,
          type: "post" as const,
          lastUpdated: post.updatedAt.toISOString(),
          aiRedirects: getRedirectCount(`/blogs/${blog.handle}/${post.handle}`),
          content: post.content,
          author: post.author,
          image: post.image,
          // Include blog info
          blog: {
            id: blog.id,
            title: blog.title,
            handle: blog.handle,
          },
          // Include comments
          comments: post.comments.map((c) => ({
            id: c.id,
            author: c.author,
            content: c.body,
            email: c.email,
            status: c.status,
            date: c.createdAt.toISOString(),
          })),
        }))
      );

      // Shopify Pages
      const shopifyPages = await prisma.shopifyPage.findMany({
        where: { websiteId },
        orderBy: { updatedAt: "desc" },
      });

      pages = shopifyPages.map((p) => ({
        id: p.id,
        title: p.title,
        url: `/pages/${p.handle}`,
        type: "page" as const,
        lastUpdated: p.updatedAt.toISOString(),
        aiRedirects: getRedirectCount(`/pages/${p.handle}`),
        content: p.content,
      }));
    } else {
      return NextResponse.json(
        { error: `Unsupported website type: ${website.type}` },
        { status: 400 }
      );
    }

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
