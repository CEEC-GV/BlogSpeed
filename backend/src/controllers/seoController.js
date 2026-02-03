import { analyzeSerp } from "../services/serpAnalysisService.js";
import { calculateSeoScore } from "../utils/seoScore.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * POST /api/seo/serp-analysis
 * Analyze SERP for a keyword and return benchmarks
 */
export const serpAnalysis = asyncHandler(async (req, res) => {
  const { keyword, location } = req.body;

  if (!keyword || !keyword.trim()) {
    return res.status(400).json({
      success: false,
      message: "Keyword is required"
    });
  }

  try {
    const analysis = await analyzeSerp(keyword.trim(), location || "United States");

    res.json({
      success: true,
      ...analysis
    });
  } catch (error) {
    console.error("SERP Analysis Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to analyze SERP"
    });
  }
});

/**
 * POST /api/seo/score
 * Calculate SEO score for content
 */
export const calculateScore = asyncHandler(async (req, res) => {
  const {
    title,
    metaDescription,
    content,
    slug,
    primaryKeyword,
    serpBenchmarks
  } = req.body;

  try {
    const result = calculateSeoScore({
      title: title || "",
      metaDescription: metaDescription || "",
      content: content || "",
      slug: slug || "",
      primaryKeyword: primaryKeyword || "",
      serpBenchmarks: serpBenchmarks || null
    });

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error("SEO Score Calculation Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to calculate SEO score"
    });
  }
});

