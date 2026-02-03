
import express from "express";
import { discoverBlogTopics, getRelatedTopics, getTrendingByCategory, generateTitlesFromTrend, getInterestOverTime, getRelatedQueries } from '../controllers/trendsController.js';

const router = express.Router();



router.get("/discover", discoverBlogTopics);

// Get trending searches by category (detailed)
// GET /api/trends/trending?category=tech&geo=US
router.get("/trending", getTrendingByCategory);

// Get related topics for a keyword
// GET /api/trends/related-topics?keyword=product+onboarding&geo=US
router.get("/related-topics", getRelatedTopics);

// Get related queries for a keyword
// GET /api/trends/related-queries?keyword=product+onboarding&geo=US
router.get("/related-queries", getRelatedQueries);

// Get interest over time for a keyword
// GET /api/trends/interest?keyword=product+onboarding&geo=US&date=today+12-m
router.get("/interest", getInterestOverTime);
// Generate blog titles from a trending keyword
// POST /api/trends/generate-titles
router.post("/generate-titles", generateTitlesFromTrend);

export default router;