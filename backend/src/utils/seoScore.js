/**
 * Yoast-style SEO Scoring Utility
 * Analyzes content against SEO best practices and SERP benchmarks
 */

/**
 * Calculate SEO score and checks
 * @param {Object} params - Content parameters
 * @param {string} params.title - Page title
 * @param {string} params.metaDescription - Meta description
 * @param {string} params.content - Main content
 * @param {string} params.slug - URL slug
 * @param {string} params.primaryKeyword - Primary keyword
 * @param {Object} params.serpBenchmarks - SERP benchmarks (optional)
 * @returns {Object} Score and checks
 */
export function calculateSeoScore({
  title = "",
  metaDescription = "",
  content = "",
  slug = "",
  primaryKeyword = "",
  serpBenchmarks = null
}) {
  const checks = [];
  let score = 0;
  const maxScore = 100;

  // Normalize keyword for matching (case-insensitive)
  const normalizedKeyword = primaryKeyword.toLowerCase().trim();
  const keywordWords = normalizedKeyword.split(/\s+/).filter(Boolean);

  // Check 1: Title length (50-60 chars optimal)
  const titleLength = title.length;
  let titleScore = 0;
  if (titleLength >= 50 && titleLength <= 60) {
    checks.push({ label: "Title length is between 50-60 characters", status: "good" });
    titleScore = 10;
  } else if (titleLength >= 30 && titleLength < 50) {
    checks.push({ label: `Title length is ${titleLength} characters (aim for 50-60)`, status: "ok" });
    titleScore = 5;
  } else if (titleLength > 60) {
    checks.push({ label: `Title length is ${titleLength} characters (too long, aim for 50-60)`, status: "bad" });
    titleScore = 2;
  } else {
    checks.push({ label: `Title length is ${titleLength} characters (too short, aim for 50-60)`, status: "bad" });
    titleScore = 2;
  }
  score += titleScore;

  // Check 2: Meta description length (140-160 chars optimal)
  const metaLength = metaDescription.length;
  let metaScore = 0;
  if (metaLength >= 140 && metaLength <= 160) {
    checks.push({ label: "Meta description length is between 140-160 characters", status: "good" });
    metaScore = 10;
  } else if (metaLength >= 120 && metaLength < 140) {
    checks.push({ label: `Meta description length is ${metaLength} characters (aim for 140-160)`, status: "ok" });
    metaScore = 5;
  } else if (metaLength > 160) {
    checks.push({ label: `Meta description length is ${metaLength} characters (too long, aim for 140-160)`, status: "bad" });
    metaScore = 2;
  } else if (metaLength > 0) {
    checks.push({ label: `Meta description length is ${metaLength} characters (too short, aim for 140-160)`, status: "bad" });
    metaScore = 2;
  } else {
    checks.push({ label: "Meta description is missing", status: "bad" });
    metaScore = 0;
  }
  score += metaScore;

  // Check 3: Primary keyword in title
  if (normalizedKeyword && title) {
    const titleLower = title.toLowerCase();
    const keywordInTitle = keywordWords.every(word => titleLower.includes(word));
    if (keywordInTitle) {
      checks.push({ label: "Primary keyword appears in title", status: "good" });
      score += 15;
    } else {
      checks.push({ label: "Primary keyword is missing from title", status: "bad" });
      score += 0;
    }
  } else if (!normalizedKeyword) {
    checks.push({ label: "Primary keyword not set", status: "ok" });
  }

  // Check 4: Primary keyword in first paragraph
  if (normalizedKeyword && content) {
    const firstParagraph = content.split(/\n\n/)[0] || content.split(/\n/)[0] || "";
    const firstParaLower = firstParagraph.toLowerCase();
    const keywordInFirstPara = keywordWords.some(word => firstParaLower.includes(word));
    if (keywordInFirstPara) {
      checks.push({ label: "Primary keyword appears in first paragraph", status: "good" });
      score += 10;
    } else {
      checks.push({ label: "Primary keyword is missing from first paragraph", status: "bad" });
      score += 0;
    }
  }

  // Check 5: Primary keyword in slug
  if (normalizedKeyword && slug) {
    const slugLower = slug.toLowerCase();
    const keywordInSlug = keywordWords.some(word => slugLower.includes(word.replace(/\s+/g, "-")));
    if (keywordInSlug) {
      checks.push({ label: "Primary keyword appears in slug", status: "good" });
      score += 10;
    } else {
      checks.push({ label: "Primary keyword is missing from slug", status: "ok" });
      score += 5;
    }
  }

  // Check 6: Content length vs SERP average
  if (serpBenchmarks && serpBenchmarks.avgWordCount > 0) {
    const contentWordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    const avgWordCount = serpBenchmarks.avgWordCount;
    const ratio = contentWordCount / avgWordCount;

    if (ratio >= 0.9 && ratio <= 1.5) {
      checks.push({ 
        label: `Content length (${contentWordCount} words) matches SERP average (${avgWordCount} words)`, 
        status: "good" 
      });
      score += 15;
    } else if (ratio >= 0.7 && ratio < 0.9) {
      checks.push({ 
        label: `Content length (${contentWordCount} words) is below SERP average (${avgWordCount} words)`, 
        status: "ok" 
      });
      score += 8;
    } else if (ratio > 1.5) {
      checks.push({ 
        label: `Content length (${contentWordCount} words) is significantly longer than SERP average (${avgWordCount} words)`, 
        status: "ok" 
      });
      score += 10;
    } else {
      checks.push({ 
        label: `Content length (${contentWordCount} words) is much shorter than SERP average (${avgWordCount} words)`, 
        status: "bad" 
      });
      score += 3;
    }
  } else if (content) {
    const contentWordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (contentWordCount >= 300) {
      checks.push({ label: `Content length is ${contentWordCount} words (good)`, status: "good" });
      score += 10;
    } else if (contentWordCount >= 150) {
      checks.push({ label: `Content length is ${contentWordCount} words (aim for 300+)`, status: "ok" });
      score += 5;
    } else {
      checks.push({ label: `Content length is ${contentWordCount} words (too short, aim for 300+)`, status: "bad" });
      score += 2;
    }
  }

  // Check 7: Keyword density (0.5% - 2%)
  if (normalizedKeyword && content) {
    const contentLower = content.toLowerCase();
    const contentWords = contentLower.split(/\s+/).filter(word => word.length > 0);
    const totalWords = contentWords.length;

    if (totalWords > 0) {
      // Count keyword occurrences (handle multi-word keywords)
      let keywordCount = 0;
      if (keywordWords.length === 1) {
        // Single word keyword
        keywordCount = contentWords.filter(word => word === normalizedKeyword).length;
      } else {
        // Multi-word keyword - count phrase occurrences
        const keywordPhrase = normalizedKeyword;
        const regex = new RegExp(keywordPhrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = contentLower.match(regex);
        keywordCount = matches ? matches.length : 0;
      }

      const density = (keywordCount / totalWords) * 100;

      if (density >= 0.5 && density <= 2.0) {
        checks.push({ 
          label: `Keyword density is ${density.toFixed(2)}% (optimal: 0.5-2%)`, 
          status: "good" 
        });
        score += 15;
      } else if (density > 2.0) {
        checks.push({ 
          label: `Keyword density is ${density.toFixed(2)}% (too high, aim for 0.5-2%)`, 
          status: "bad" 
        });
        score += 3;
      } else if (density > 0) {
        checks.push({ 
          label: `Keyword density is ${density.toFixed(2)}% (too low, aim for 0.5-2%)`, 
          status: "ok" 
        });
        score += 5;
      } else {
        checks.push({ 
          label: "Primary keyword not found in content", 
          status: "bad" 
        });
        score += 0;
      }
    }
  }

  // Ensure score is between 0-100
  score = Math.min(Math.max(score, 0), maxScore);

  return {
    score: Math.round(score),
    checks
  };
}

