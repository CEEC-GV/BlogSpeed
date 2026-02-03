import express from "express";
import {
  getPublishedBlogs,
  getBlogBySlug,
  getBlogCategories
} from "../controllers/blogController.js";
import { trackBlogView } from "../controllers/analyticsController.js";

const router = express.Router();

// 🔥 IMPORTANT: Order matters! More specific routes MUST come before generic ones

// Most specific routes first
router.get("/:app_id/categories", getBlogCategories);

// Then parameterized routes
router.get("/:app_id/:slug", trackBlogView, getBlogBySlug);

// Generic routes last
router.get("/:app_id", getPublishedBlogs);

export default router;