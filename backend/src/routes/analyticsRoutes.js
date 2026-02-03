import express from "express";
import {
  getAnalytics,
  getOverview,
  listBlogsWithAnalytics
} from "../controllers/analyticsController.js";

const router = express.Router();

// ============================================
// ADMIN ROUTES - Analytics dashboard
// Add your auth middleware here in production
// ============================================

// Get analytics for specific blog
router.get("/blogs/:id/analytics", getAnalytics);

// Get analytics overview
router.get("/overview", getOverview);

// Get blogs with analytics
router.get("/blogs", listBlogsWithAnalytics);

export default router;