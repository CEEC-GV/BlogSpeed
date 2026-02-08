import slugify from "slugify";
import Blog from "../models/Blog.js";
import BlogAnalytics from "../models/BlogAnalytics.js";
import { sanitizeText, sanitizeUrl } from "../utils/sanitize.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Subscriber from "../models/Subscriber.js";
import Settings from "../models/Settings.js";
import { sendMail } from "../utils/sendMail.js";

/**
 * Send blog notification emails to all subscribed users
 * This function runs in the background and doesn't block the API response
 * @param {Object} blog - The blog object that was published
 */
async function sendBlogNotificationEmails(blog) {
  console.log(`\n📧 [EMAIL FLOW] Step 1: Starting email notification for blog: "${blog.title}" (ID: ${blog._id})`);
  
  try {
    // Step 2: Check settings
    console.log(`📧 [EMAIL FLOW] Step 2: Checking autoBlogEmail setting...`);
    const settings = await Settings.findOne({ user: req.admin.id });
    
    if (!settings || settings.autoBlogEmail !== true) {
      console.log(`📧 [EMAIL FLOW] ⚠️  Auto blog email is disabled in settings. Skipping email notification.`);
      return { success: false, reason: 'autoBlogEmail disabled' };
    }
    console.log(`📧 [EMAIL FLOW] ✅ Auto blog email is enabled`);

    // Step 3: Fetch subscribers
    console.log(`📧 [EMAIL FLOW] Step 3: Fetching subscribed users...`);
    const subscribers = await Subscriber.find({ status: "subscribed", user: req.admin.id });
    console.log(`📧 [EMAIL FLOW] Found ${subscribers.length} subscribed users`);

    if (subscribers.length === 0) {
      console.log(`📧 [EMAIL FLOW] ⚠️  No subscribed users found. Email notification skipped.`);
      return { success: false, reason: 'no subscribers', count: 0 };
    }

    // Step 4: Build email content
    console.log(`📧 [EMAIL FLOW] Step 4: Building email content...`);
    const blogUrl = `${process.env.FRONTEND_URL}/blog/${blog.slug}`;
    const subject = `🆕 New Blog Published: ${blog.title}`;

    const html = `
      <div style="font-family:Arial;line-height:1.6;max-width:600px;margin:0 auto;padding:20px;">
        <h2 style="color:#333;border-bottom:2px solid #eee;padding-bottom:10px;">${blog.title}</h2>
        <p><strong>Author:</strong> ${blog.author || "BlogSpeed Team"}</p>
        <p style="color:#666;line-height:1.8;">${blog.excerpt || blog.content.slice(0, 200) + '...'}</p>
        <a href="${blogUrl}"
           style="display:inline-block;margin-top:16px;padding:12px 24px;
           background:#7c3aed;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
          Read Full Blog →
        </a>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
        <p style="font-size:12px;color:#888;text-align:center;">
          You received this email because you subscribed to BlogSpeed.<br>
          <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color:#888;">Unsubscribe</a>
        </p>
      </div>
    `;

    // Step 5: Send emails with individual error handling
    console.log(`📧 [EMAIL FLOW] Step 5: Sending emails to ${subscribers.length} subscribers...`);
    const results = {
      sent: 0,
      failed: 0,
      errors: []
    };

    // Send emails in parallel with individual error handling
    const emailPromises = subscribers.map(async (subscriber) => {
      try {
        console.log(`📧 [EMAIL FLOW] Sending email to: ${subscriber.email}`);
        await sendMail({
          to: subscriber.email,
          subject,
          html
        });
        results.sent++;
        console.log(`📧 [EMAIL FLOW] ✅ Email sent successfully to: ${subscriber.email}`);
      } catch (error) {
        results.failed++;
        results.errors.push({
          email: subscriber.email,
          error: error.message
        });
        console.error(`📧 [EMAIL FLOW] ❌ Failed to send email to ${subscriber.email}:`, error.message);
      }
    });

    await Promise.all(emailPromises);

    // Step 6: Log final results
    console.log(`\n📧 [EMAIL FLOW] Step 6: Email sending completed!`);
    console.log(`📧 [EMAIL FLOW] ✅ Successfully sent: ${results.sent} emails`);
    if (results.failed > 0) {
      console.log(`📧 [EMAIL FLOW] ❌ Failed: ${results.failed} emails`);
      console.log(`📧 [EMAIL FLOW] Errors:`, results.errors);
    }
    console.log(`📧 [EMAIL FLOW] ==========================================\n`);

    return {
      success: true,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors
    };

  } catch (error) {
    console.error(`\n📧 [EMAIL FLOW] ❌ CRITICAL ERROR in email notification flow:`, error);
    console.error(`📧 [EMAIL FLOW] Error stack:`, error.stack);
    console.log(`📧 [EMAIL FLOW] ==========================================\n`);
    throw error; // Re-throw to be caught by caller
  }
}

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
  
  const blogs = await Blog.find({ user: req.admin.id }).sort({ createdAt: -1 });
  
  // Optionally include analytics summary
  if (includeAnalytics === "true") {
    const blogIds = blogs.map(b => b._id);
    
    // Fetch analytics for all blogs
    const analyticsData = await BlogAnalytics.find({ 
      blogId: { $in: blogIds },
      user: req.admin.id
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
  const category = sanitizeText(req.body.category || "")
  .toLowerCase()
  .trim();
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

  // Trigger email notification if blog is published (non-blocking)
  if (status?.toLowerCase() === "published") {
    sendBlogNotificationEmails(blog).catch(err => {
      console.error("❌ Background email sending failed:", err);
    });
  }

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

  // Capture previous status BEFORE modifying blog object
  const previousStatus = blog.status;

  const title = sanitizeText(req.body.title ?? blog.title);
  const content = req.body.content ?? blog.content;
  const excerpt = sanitizeText(buildExcerpt(content, req.body.excerpt ?? blog.excerpt));
  const coverImage = sanitizeUrl(req.body.coverImage ?? blog.coverImage);
  const category = sanitizeText(req.body.category ?? blog.category)
  .toLowerCase()
  .trim();
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

  // Trigger email notification if status changed from Draft to Published
  if (previousStatus?.toLowerCase() !== "published" && status?.toLowerCase() === "published") {
    console.log(`📧 Blog status changed to Published, triggering email notifications for blog: ${blog._id}`);
    sendBlogNotificationEmails(blog).catch(err => {
      console.error("❌ Background email sending failed:", err);
    });
  }

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