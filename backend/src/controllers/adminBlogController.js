import slugify from "slugify";
import Blog from "../models/Blog.js";
import BlogAnalytics from "../models/BlogAnalytics.js";
import { sanitizeText, sanitizeUrl } from "../utils/sanitize.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const buildExcerpt = (content, excerpt) => {
  if (excerpt && excerpt.trim()) return excerpt.trim();
  return (content || "").slice(0, 150);
};

/**
 * List all blogs
 * GET /admin/blogs?includeAnalytics=true
 */
export const listBlogs = asyncHandler(async (req, res) => {
  const { includeAnalytics } = req.query;
  
  const blogs = await Blog.find().sort({ createdAt: -1 });
  
  // Optionally include analytics summary
  if (includeAnalytics === "true") {
    const blogIds = blogs.map(b => b._id);
    
    // Fetch analytics for all blogs
    const analyticsData = await BlogAnalytics.find({ 
      blogId: { $in: blogIds } 
    });
    
    // Create a map for quick lookup
    const analyticsMap = new Map();
    analyticsData.forEach(a => {
      analyticsMap.set(a.blogId.toString(), {
        totalViews: a.totalViews,
        uniqueViews: a.uniqueViews,
        lastViewed: a.lastViewed
      });
    });
    
    // Attach analytics to each blog
    const blogsWithAnalytics = blogs.map(blog => {
      const blogObj = blog.toObject();
      const analytics = analyticsMap.get(blog._id.toString());
      
      return {
        ...blogObj,
        analytics: analytics || {
          totalViews: 0,
          uniqueViews: 0,
          lastViewed: null
        }
      };
    });
    
    return res.json(blogsWithAnalytics);
  }
  
  res.json(blogs);
});

/**
 * Get single blog by ID
 * GET /admin/blogs/:id
 */
export const getBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return res.status(404).json({ message: "Blog not found" });
  }
  res.json(blog);
});

/**
 * Get blog by slug (for public view)
 * GET /blogs/slug/:slug
 */
export const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug });
  if (!blog) {
    return res.status(404).json({ message: "Blog not found" });
  }
  
  // Get analytics summary
  const analytics = await BlogAnalytics.findOne({ blogId: blog._id });
  
  res.json({
    ...blog.toObject(),
    analytics: analytics ? {
      totalViews: analytics.totalViews,
      uniqueViews: analytics.uniqueViews
    } : {
      totalViews: 0,
      uniqueViews: 0
    }
  });
});

/**
 * Create new blog
 * POST /admin/blogs
 */
export const createBlog = asyncHandler(async (req, res) => {
  const title = sanitizeText(req.body.title);
  const content = req.body.content || "";
  const excerpt = sanitizeText(buildExcerpt(content, req.body.excerpt));
  const coverImage = sanitizeUrl(req.body.coverImage || "");
  const category = sanitizeText(req.body.category || "");
  const author = sanitizeText(req.body.author || "");
  const status = req.body.status || "Draft";

  
  // Use provided SEO slug or generate from title
  const slug = req.body.slug && req.body.slug.trim() 
    ? sanitizeText(req.body.slug.trim().toLowerCase().replace(/\s+/g, "-"))
    : slugify(title, { lower: true, strict: true });

  const blog = await Blog.create({
    title,
    content,
    excerpt, // meta description
    coverImage,
    category,
    author,
    status,
    slug,
    user: req.admin.id, // Associate blog with admin user

    // SEO fields (WordPress-style)
    seo: {
      metaDescription: excerpt,
      primaryKeyphrase: req.body.primaryKeyphrase || "",
      secondaryKeyphrases: req.body.secondaryKeyphrases || [],
    }
  });

  // Initialize analytics for this blog
  await BlogAnalytics.create({ blogId: blog._id });

  res.status(201).json(blog);
});

/**
 * Update existing blog
 * PUT /admin/blogs/:id
 */
export const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return res.status(404).json({ message: "Blog not found" });
  }

  const title = sanitizeText(req.body.title ?? blog.title);
  const content = req.body.content ?? blog.content;
  const excerpt = sanitizeText(buildExcerpt(content, req.body.excerpt ?? blog.excerpt));
  const coverImage = sanitizeUrl(req.body.coverImage ?? blog.coverImage);
  const category = sanitizeText(req.body.category ?? blog.category);
  const author = sanitizeText(req.body.author ?? blog.author);
  const status = req.body.status ?? blog.status;

  blog.title = title;
  blog.content = content;
  blog.excerpt = excerpt;
  blog.coverImage = coverImage;
  blog.category = category;
  blog.author = author;
  blog.status = status;
  
  // Use provided SEO slug or generate from title
  blog.slug = req.body.slug && req.body.slug.trim()
    ? sanitizeText(req.body.slug.trim().toLowerCase().replace(/\s+/g, "-"))
    : slugify(title, { lower: true, strict: true });
    
  // Update SEO fields if provided
  if (req.body.primaryKeyphrase || req.body.secondaryKeyphrases) {
    blog.seo = {
      metaDescription: blog.excerpt,
      primaryKeyphrase: req.body.primaryKeyphrase || blog.seo?.primaryKeyphrase || "",
      secondaryKeyphrases: req.body.secondaryKeyphrases || blog.seo?.secondaryKeyphrases || [],
    };
  }

  await blog.save();
  res.json(blog);
});

/**
 * Delete blog
 * DELETE /admin/blogs/:id
 */
export const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return res.status(404).json({ message: "Blog not found" });
  }
  
  // Delete associated analytics
  await BlogAnalytics.deleteOne({ blogId: blog._id });
  
  await blog.deleteOne();
  res.json({ message: "Blog deleted" });
});