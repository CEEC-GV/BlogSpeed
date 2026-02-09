import Blog from "../models/Blog.js";
import BlogAnalytics from "../models/BlogAnalytics.js";
import { sendBlogNotificationEmails } from "../controllers/adminBlogController.js";

/**
 * Auto-publish worker that checks for scheduled blogs and publishes them
 * Compares current UTC time with publishAt
 * Runs every 1 minute
 */
export async function checkAndPublishScheduledBlogs() {
  try {
    const now = new Date();
    const nowUTC = now.toISOString();
    
    console.log(`\n📅 [AUTO-PUBLISH] Checking scheduled blogs at UTC: ${nowUTC}`);
    
    // Find all blogs that are scheduled and their publishAt time has arrived
    // Query: status must be "Scheduled" AND publishAt must exist AND publishAt <= now
    const scheduledBlogs = await Blog.find({
      status: "Scheduled",
      publishAt: { $exists: true, $ne: null, $lte: now }
    });

    console.log(`📅 [AUTO-PUBLISH] Found ${scheduledBlogs.length} blog(s) ready to publish`);

    if (scheduledBlogs.length === 0) {
      return { checked: true, published: 0 };
    }

    let publishedCount = 0;
    const errors = [];

    for (const blog of scheduledBlogs) {
      try {
        const publishAtUTC = blog.publishAt.toISOString();
        console.log(`📅 [AUTO-PUBLISH] Processing blog: "${blog.title}" (ID: ${blog._id})`);
        console.log(`📅 [AUTO-PUBLISH]   Scheduled for: ${publishAtUTC}`);
        console.log(`📅 [AUTO-PUBLISH]   Current UTC: ${nowUTC}`);

        // Update blog to Published status and clear publishAt
        blog.status = "Published";
        blog.publishAt = null;
        await blog.save();

        // Create analytics after auto-publish (non-blocking)
        BlogAnalytics.create({
          blogId: blog._id,
          user: blog.user
        }).catch(err => {
          console.error("⚠️ Analytics failed on auto-publish:", err.message);
        });

        console.log(`📅 [AUTO-PUBLISH] ✅ Published blog: "${blog.title}" (ID: ${blog._id})`);

        // Trigger email notifications (non-blocking)
        sendBlogNotificationEmails(blog).catch(err => {
          console.error(`📅 [AUTO-PUBLISH] ❌ Email notification failed for blog ${blog._id}:`, err);
        });

        publishedCount++;
      } catch (error) {
        console.error(`📅 [AUTO-PUBLISH] ❌ Failed to publish blog ${blog._id}:`, error);
        errors.push({ blogId: blog._id, error: error.message });
      }
    }

    console.log(`📅 [AUTO-PUBLISH] Completed: ${publishedCount} blog(s) published automatically`);
    if (errors.length > 0) {
      console.log(`📅 [AUTO-PUBLISH] Errors encountered:`, errors);
    }
    console.log(`📅 [AUTO-PUBLISH] ==========================================\n`);

    return {
      checked: true,
      published: publishedCount,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error(`📅 [AUTO-PUBLISH] ❌ CRITICAL ERROR:`, error);
    return {
      checked: false,
      error: error.message
    };
  }
}

/**
 * Start the auto-publish worker with a set interval
 * @param {number} intervalMinutes - How often to check (default: 1 minute)
 */
export function startAutoPublishWorker(intervalMinutes = 1) {
  console.log(`📅 [AUTO-PUBLISH] Starting worker (checking every ${intervalMinutes} minute(s))`);
  
  // Run immediately on startup
  checkAndPublishScheduledBlogs();

  // Then run at the specified interval
  const intervalMs = intervalMinutes * 60 * 1000;
  setInterval(() => {
    checkAndPublishScheduledBlogs();
  }, intervalMs);
}

