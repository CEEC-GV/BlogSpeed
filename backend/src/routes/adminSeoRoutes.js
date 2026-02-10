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

// Generate SEO titles (1 credit deducted after successful generation)
router.post("/blogs/ai/titles", generateSeoTitles);

// Generate meta descriptions (1 credit deducted after successful generation)
router.post("/blogs/ai/meta", generateMetaDescriptions);

// Generate full blog content (2 credits deducted after successful generation)
router.post("/blogs/ai/content", generateBlogContent);

// Analyze content gaps (3 credits deducted after successful analysis)
router.post("/ai/content-gaps", analyzeContentGaps);

export default router;
