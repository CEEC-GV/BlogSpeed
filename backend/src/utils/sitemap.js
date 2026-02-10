import express from "express";
import { SitemapStream, streamToPromise } from "sitemap";
import Blog from "../models/Blog.js";

const router = express.Router();
let sitemapCache = null;

router.get("/sitemap.xml", async (req, res) => {
  try {
    res.header("Content-Type", "application/xml");

    // Serve from cache if exists
    if (sitemapCache) {
      return res.send(sitemapCache);
    }

    const sitemap = new SitemapStream({
      hostname: "https://blogspeed.io",
    });

    // 🔹 Static pages
    sitemap.write({ url: "/", changefreq: "daily", priority: 1.0 });
    sitemap.write({ url: "/blog", changefreq: "daily", priority: 0.9 });

    // 🔹 Blog posts (dynamic)
    const blogs = await Blog.find({ published: true })
      .select("slug updatedAt");

    blogs.forEach(blog => {
      sitemap.write({
        url: `/blog/${blog.slug}`,
        lastmod: blog.updatedAt,
        changefreq: "weekly",
        priority: 0.8,
      });
    });

    sitemap.end();

    sitemapCache = (await streamToPromise(sitemap)).toString();
    res.send(sitemapCache);
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

export default router;
