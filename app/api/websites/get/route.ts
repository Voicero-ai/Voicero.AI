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

    // 2) Look up the Website record
    const website = await prisma.website.findUnique({
      where: { id: websiteId },
      include: {
        accessKeys: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!website) {
      return NextResponse.json(
        { error: "Website not found." },
        { status: 404 }
      );
    }

    // Convert "active" boolean to a string "active" | "inactive"
    const status = website.active ? "active" : "inactive";

    // 3) Prepare some placeholder or computed global stats
    // In a real app, you might sum up your AiMessage or AiThreads usage, etc.
    const globalStats = {
      totalAiRedirects: 0, // e.g. sum from DB if you track it
      totalVoiceChats: 0,
      totalTextChats: 0,
    };

    // 4) We'll store all content (products, blogPosts, pages) here
    let products = [];
    let blogPosts = [];
    let pages = [];

    // 5) Check website.type => If "wordpress", fetch from WordPress tables
    if (website.type.toLowerCase() === "wordpress") {
      // Fetching WordPress Products
      const wpProducts = await prisma.wordpressProduct.findMany({
        where: { websiteId },
        orderBy: { updatedAt: "desc" },
      });

      // Map them to your front-end shape
      products = wpProducts.map((prod) => ({
        id: String(prod.id),
        title: prod.name,
        url: `/products/${prod.slug}`, // or just prod.slug
        type: "product" as const,
        lastUpdated: prod.updatedAt.toISOString(),
        aiRedirects: 0, // if you have a separate tracking table, sum it here
        description: prod.description,
        price: prod.price,
      }));

      // Fetching WordPress Posts
      const wpPosts = await prisma.wordpressPost.findMany({
        where: { websiteId },
        orderBy: { updatedAt: "desc" },
        include: { author: true },
      });

      blogPosts = wpPosts.map((post) => ({
        id: String(post.id),
        title: post.title,
        url: `/blog/${post.slug}`,
        type: "post" as const,
        lastUpdated: post.updatedAt.toISOString(),
        aiRedirects: 0,
        content: post.excerpt ?? post.content,
        author: post.author?.name ?? "Unknown",
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
        aiRedirects: 0,
        content: p.content,
      }));

      // 6) If Shopify => fetch from Shopify tables
    } else if (website.type.toLowerCase() === "shopify") {
      // Shopify Products
      const shopifyProducts = await prisma.shopifyProduct.findMany({
        where: { websiteId },
        orderBy: { updatedAt: "desc" },
      });

      products = shopifyProducts.map((prod) => ({
        id: prod.id,
        title: prod.title,
        url: `/products/${prod.handle}`,
        type: "product" as const,
        lastUpdated: prod.updatedAt.toISOString(),
        aiRedirects: 0,
        description: prod.description,
      }));

      // Shopify Blog Posts => we have to join ShopifyBlog and ShopifyBlogPost
      // If you want them all, fetch them in one pass or multiple passes
      const shopifyBlogs = await prisma.shopifyBlog.findMany({
        where: { websiteId },
        include: {
          posts: {
            orderBy: { updatedAt: "desc" },
          },
        },
      });

      // Flatten all blog posts across all blogs
      const allShopifyPosts = shopifyBlogs.flatMap((blog) => blog.posts);

      blogPosts = allShopifyPosts.map((post) => ({
        id: post.id,
        title: post.title,
        url: `/blogs/${post.handle}`, // or however you form the URL
        type: "post" as const,
        lastUpdated: post.updatedAt.toISOString(),
        aiRedirects: 0,
        content: post.content,
        author: post.author,
      }));

      // Shopify Pages
      const shopifyPages = await prisma.shopifyPage.findMany({
        where: { websiteId },
        orderBy: { updatedAt: "desc" },
      });

      pages = shopifyPages.map((p) => ({
        id: p.id,
        title: p.title,
        url: `/${p.handle}`,
        type: "page" as const,
        lastUpdated: p.updatedAt.toISOString(),
        aiRedirects: 0,
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
      status,
      monthlyQueries: website.monthlyQueries,
      queryLimit: website.queryLimit,
      lastSync: website.lastSyncedAt?.toISOString() || null,
      accessKey: website.accessKeys[0]?.key || null,
      // globalStats: can be replaced with real sums if you track them
      globalStats,
      stats: {
        aiRedirects: 0,
        totalRedirects: 0,
        redirectRate: 0,
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
