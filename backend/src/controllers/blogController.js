import Blog from "../models/Blog.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sanitizeText } from "../utils/sanitize.js";

export const getPublishedBlogs = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(parseInt(req.query.limit || "6", 10), 20);
  const skip = (page - 1) * limit;
  const category = sanitizeText(req.query.category || "").trim();
  const exclude = sanitizeText(req.query.exclude || "").trim();

  const filter = { status: "Published", user: req.params.app_id };
  if (category) filter.category = category;
  if (exclude) filter.slug = { $ne: exclude };

  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("title slug excerpt coverImage category author createdAt"),
    Blog.countDocuments(filter)
  ]);

  res.json({
    data: blogs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

export const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug, status: "Published", user: req.params.app_id });
  if (!blog) {
    return res.status(404).json({ message: "Blog not found" });
  }
  res.json(blog);
});

export const getBlogCategories = asyncHandler(async (req, res) => {
  try {
    const categories = await Blog.distinct("category", { status: "Published", user: req.params.app_id });
    res.json({ data: categories.sort() });
  } catch (error) {
    console.error('Error fetching blog categories:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch blog categories',
      message: error.message
    });
  }
  
});
