import crypto from "crypto";
import axios from "axios";
import { asyncHandler } from "../utils/asyncHandler.js";
import Blog from "../models/Blog.js";
import BlogAnalytics from "../models/BlogAnalytics.js";

/**
 * Generate visitor fingerprint from IP + User Agent
 */
function generateVisitorId(ipAddress, userAgent) {
  return crypto
    .createHash("md5")
    .update(`${ipAddress}-${userAgent}`)
    .digest("hex");
}

/**
 * Get country from IP address using ip-api.com (free, no key needed)
 * Falls back to "Unknown" if service fails
 */
async function getCountryFromIP(ipAddress) {
  try {
    // Skip for local/private IPs
    if (
      ipAddress === "unknown" ||
      ipAddress === "::1" ||
      ipAddress === "127.0.0.1" ||
      ipAddress.startsWith("192.168.") ||
      ipAddress.startsWith("10.") ||
      ipAddress.startsWith("172.")
    ) {
      return "Local/Private";
    }

    // Use ip-api.com (free, 45 requests/minute)
    const response = await axios.get(
      `http://ip-api.com/json/${ipAddress}?fields=status,country`,
      { timeout: 2000 }
    );

    if (response.data.status === "success") {
      return response.data.country || "Unknown";
    }

    return "Unknown";
  } catch (error) {
    console.error("IP geolocation error:", error.message);
    return "Unknown";
  }
}

/**
 * Track blog view middleware
 * Tracks analytics when a blog is viewed
 */
export const trackBlogView = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  // Find blog to get ID
  const blog = await Blog.findOne({ slug, status: "Published" });

  if (blog) {
    // Get IP address with better extraction
    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
      req.headers["x-real-ip"] ||
      req.socket.remoteAddress ||
      req.connection.remoteAddress ||
      req.ip ||
      "unknown";

    const userAgent = req.headers["user-agent"] || "";

    // Track view in background (don't wait for it)
    trackViewInBackground(blog._id, ipAddress, userAgent);
  }

  // Continue to next middleware/controller
  next();
});

/**
 * Background view tracking (non-blocking)
 * Uses atomic operations to prevent race conditions
 */
async function trackViewInBackground(blogId, ipAddress, userAgent) {
  try {
    // Generate visitor ID
    const visitorId = generateVisitorId(ipAddress, userAgent);

    // Get country
    const country = await getCountryFromIP(ipAddress);

    // Get today's date (midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find or create analytics document
    let analytics = await BlogAnalytics.findOne({ blogId });

    if (!analytics) {
      analytics = await BlogAnalytics.create({
        blogId,
        totalViews: 0,
        uniqueViews: 0,
        uniqueVisitorIds: [],
        viewsByCountry: [],
        dailyViews: [],
      });
    }

    // Check if visitor is unique
    const isUnique = !analytics.uniqueVisitorIds?.includes(visitorId);

    // Update analytics using atomic operations where possible
    const updates = {
      $inc: { totalViews: 1 },
      lastViewed: new Date(),
    };

    // Handle unique visitor
    if (isUnique) {
      updates.$inc.uniqueViews = 1;
      updates.$push = {
        uniqueVisitorIds: {
          $each: [visitorId],
          $slice: -1000, // Keep only last 1000
        },
      };
    }

    await BlogAnalytics.updateOne({ blogId }, updates);

    // Reload to update arrays (country and daily views)
    analytics = await BlogAnalytics.findOne({ blogId });

    // Update country stats
    let countryEntry = analytics.viewsByCountry.find(
      (c) => c.country === country
    );
    if (!countryEntry) {
      analytics.viewsByCountry.push({ country, views: 1 });
    } else {
      countryEntry.views += 1;
    }

    // Update daily views
    let dailyEntry = analytics.dailyViews.find(
      (d) => d.date.getTime() === today.getTime()
    );
    if (!dailyEntry) {
      analytics.dailyViews.push({ date: today, views: 1 });
      // Keep only last 90 days
      if (analytics.dailyViews.length > 90) {
        analytics.dailyViews.sort((a, b) => a.date - b.date);
        analytics.dailyViews = analytics.dailyViews.slice(-90);
      }
    } else {
      dailyEntry.views += 1;
    }

    await analytics.save();
  } catch (error) {
    // Log error but don't throw (tracking shouldn't break the app)
    console.error("Analytics tracking error:", error);
  }
}

/**
 * Get analytics for a specific blog
 * GET /api/admin/analytics/blogs/:id/analytics
 */
export const getAnalytics = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);
  if (!blog) {
    return res.status(404).json({ message: "Blog not found" });
  }

  const analytics = await BlogAnalytics.findOne({ blogId: id });

  if (!analytics) {
    return res.json({
      blogId: id,
      blogTitle: blog.title,
      totalViews: 0,
      uniqueViews: 0,
      viewsByCountry: [],
      dailyViews: [],
      lastViewed: null,
    });
  }

  // Sort countries by views
  const topCountries = analytics.viewsByCountry
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // Sort daily views by date
  const sortedDailyViews = analytics.dailyViews.sort((a, b) => a.date - b.date);

  res.json({
    blogId: id,
    blogTitle: blog.title,
    totalViews: analytics.totalViews,
    uniqueViews: analytics.uniqueViews,
    viewsByCountry: topCountries,
    dailyViews: sortedDailyViews,
    lastViewed: analytics.lastViewed,
  });
});

/**
 * Get analytics overview for all blogs
 * GET /api/admin/analytics/overview
 */
export const getOverview = asyncHandler(async (req, res) => {
  const analytics = await BlogAnalytics.find()
    .populate("blogId", "title slug category status")
    .sort({ totalViews: -1 });

  // Filter out null blogIds (deleted blogs)
  const validAnalytics = analytics.filter((a) => a.blogId);

  const totalViews = validAnalytics.reduce((sum, a) => sum + a.totalViews, 0);
  const totalUnique = validAnalytics.reduce((sum, a) => sum + a.uniqueViews, 0);

  const topBlogs = validAnalytics.slice(0, 10).map((a) => ({
    id: a.blogId._id,
    title: a.blogId.title,
    slug: a.blogId.slug,
    category: a.blogId.category,
    status: a.blogId.status,
    views: a.totalViews,
    uniqueViews: a.uniqueViews,
    lastViewed: a.lastViewed,
  }));

  // Aggregate daily views across all blogs
  const dailyViewsMap = new Map();
  validAnalytics.forEach((a) => {
    a.dailyViews.forEach((dv) => {
      const dateKey = new Date(dv.date).toISOString().split("T")[0];
      dailyViewsMap.set(dateKey, (dailyViewsMap.get(dateKey) || 0) + dv.views);
    });
  });

  const aggregatedDailyViews = Array.from(dailyViewsMap.entries())
    .map(([date, views]) => ({ date: new Date(date), views }))
    .sort((a, b) => a.date - b.date)
    .slice(-30); // Last 30 days

  // Top countries across all blogs
  const countryMap = new Map();
  validAnalytics.forEach((a) => {
    a.viewsByCountry.forEach((cv) => {
      countryMap.set(cv.country, (countryMap.get(cv.country) || 0) + cv.views);
    });
  });

  const topCountries = Array.from(countryMap.entries())
    .map(([country, views]) => ({ country, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  res.json({
    summary: {
      totalBlogs: validAnalytics.length,
      totalViews,
      totalUnique,
      avgViewsPerBlog: validAnalytics.length > 0 
        ? Math.round(totalViews / validAnalytics.length) 
        : 0,
    },
    topBlogs,
    dailyViews: aggregatedDailyViews,
    topCountries,
  });
});

/**
 * Get blog list with analytics (for admin)
 * GET /api/admin/analytics/blogs
 */
export const listBlogsWithAnalytics = asyncHandler(async (req, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });

  // Fetch all analytics
  const blogIds = blogs.map((b) => b._id);
  const analyticsData = await BlogAnalytics.find({
    blogId: { $in: blogIds },
  });

  // Create map
  const analyticsMap = new Map();
  analyticsData.forEach((a) => {
    analyticsMap.set(a.blogId.toString(), {
      totalViews: a.totalViews,
      uniqueViews: a.uniqueViews,
      lastViewed: a.lastViewed,
    });
  });

  // Merge
  const blogsWithAnalytics = blogs.map((blog) => ({
    ...blog.toObject(),
    analytics: analyticsMap.get(blog._id.toString()) || {
      totalViews: 0,
      uniqueViews: 0,
      lastViewed: null,
    },
  }));

  res.json(blogsWithAnalytics);
});