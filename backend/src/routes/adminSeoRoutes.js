import express from "express";
import { generateSeoTitles, generateMetaDescriptions, generateBlogContent, analyzeContentGaps } from "../controllers/seoAiController.js";
import { serpAnalysis, calculateScore } from "../controllers/seoController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Protect all SEO routes
router.use(protect);

router.post("/seo/serp-analysis", serpAnalysis);

// Calculate SEO score for content
router.post("/seo/score", calculateScore);

router.post("/blogs/ai/titles", generateSeoTitles);

// Generate meta descriptions for a specific title
router.post("/blogs/ai/meta", generateMetaDescriptions);

// Generate full blog content with SERP + Trends data
router.post("/blogs/ai/content", generateBlogContent);

// Analyze content gaps vs SERP
router.post("/ai/content-gaps", analyzeContentGaps);

export default router;
