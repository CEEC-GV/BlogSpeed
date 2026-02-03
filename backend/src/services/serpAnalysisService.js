import axios from "axios";
import { JSDOM } from "jsdom";

/**
 * SERP Analysis Service
 * Fetches real Google SERP data and analyzes top-ranking pages
 */

/**
 * Fetch top 10 Google organic results using SerpAPI
 * @param {string} keyword - Search keyword
 * @param {string} location - Location (e.g., "United States")
 * @returns {Promise<Array>} Array of SERP results
 */
async function fetchSerpResults(keyword, location = "United States") {
  if (!process.env.SERPAPI_KEY) {
    throw new Error("SERPAPI_KEY is not configured. Please set it in .env file.");
  }

  try {
    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        api_key: process.env.SERPAPI_KEY,
        q: keyword,
        location: location,
        num: 10,
        engine: "google"
      }
    });

    const organicResults = response.data?.organic_results || [];
    
    return organicResults.slice(0, 10).map(result => ({
      title: result.title || "",
      url: result.link || "",
      metaDescription: result.snippet || ""
    }));
  } catch (error) {
    console.error("SerpAPI Error:", error.response?.data || error.message);
    
    // Fallback: Try Zenserp if SerpAPI fails
    if (process.env.ZENSERP_API_KEY) {
      return await fetchZenserpResults(keyword, location);
    }
    
    throw new Error(`SERP fetch failed: ${error.response?.data?.error || error.message}`);
  }
}

/**
 * Fallback: Fetch using Zenserp API
 */
async function fetchZenserpResults(keyword, location = "United States") {
  try {
    const response = await axios.get("https://app.zenserp.com/api/v2/search", {
      params: {
        apikey: process.env.ZENSERP_API_KEY,
        q: keyword,
        location: location,
        num: 10
      }
    });

    const organicResults = response.data?.organic_results || [];
    
    return organicResults.slice(0, 10).map(result => ({
      title: result.title || "",
      url: result.url || "",
      metaDescription: result.description || ""
    }));
  } catch (error) {
    console.error("Zenserp Error:", error.response?.data || error.message);
    throw new Error(`SERP fetch failed: ${error.response?.data?.error || error.message}`);
  }
}

/**
 * Fetch and parse HTML content from a URL
 * @param {string} url - URL to fetch
 * @returns {Promise<Object>} Parsed content data
 */
async function fetchPageContent(url) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      }
    });

    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    // Extract headings
    const h1 = Array.from(document.querySelectorAll("h1")).map(el => el.textContent.trim()).filter(Boolean);
    const h2 = Array.from(document.querySelectorAll("h2")).map(el => el.textContent.trim()).filter(Boolean);
    const h3 = Array.from(document.querySelectorAll("h3")).map(el => el.textContent.trim()).filter(Boolean);

    // Extract main content (try common content selectors)
    const contentSelectors = [
      "article",
      "main",
      ".content",
      "#content",
      ".post-content",
      ".entry-content"
    ];

    let mainContent = "";
    for (const selector of contentSelectors) {
      const element = document.querySelector(selector);
      if (element) {
        mainContent = element.textContent || "";
        break;
      }
    }

    // Fallback to body if no content found
    if (!mainContent) {
      mainContent = document.body?.textContent || "";
    }

    // Count words (simple whitespace split)
    const wordCount = mainContent.trim().split(/\s+/).filter(word => word.length > 0).length;

    // Check for images and lists
    const hasImages = document.querySelectorAll("img").length > 0;
    const hasLists = document.querySelectorAll("ul, ol").length > 0;

    return {
      headings: {
        h1,
        h2,
        h3
      },
      wordCount,
      hasImages,
      hasLists
    };
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    return {
      headings: { h1: [], h2: [], h3: [] },
      wordCount: 0,
      hasImages: false,
      hasLists: false
    };
  }
}

/**
 * Compute SERP benchmarks from top-ranking pages
 * @param {Array} serpResults - SERP results
 * @param {Array} pageContents - Page content data
 * @returns {Object} Benchmarks
 */
function computeBenchmarks(serpResults, pageContents) {
  // Average word count
  const wordCounts = pageContents.map(p => p.wordCount).filter(c => c > 0);
  const avgWordCount = wordCounts.length > 0
    ? Math.round(wordCounts.reduce((a, b) => a + b, 0) / wordCounts.length)
    : 0;

  // Collect all headings
  const allH1 = [];
  const allH2 = [];
  const allH3 = [];

  pageContents.forEach(content => {
    allH1.push(...content.headings.h1);
    allH2.push(...content.headings.h2);
    allH3.push(...content.headings.h3);
  });

  // Find common headings (appear in 2+ pages)
  const headingFrequency = {};
  [...allH1, ...allH2, ...allH3].forEach(heading => {
    const normalized = heading.toLowerCase().trim();
    headingFrequency[normalized] = (headingFrequency[normalized] || 0) + 1;
  });

  const commonHeadings = Object.entries(headingFrequency)
    .filter(([_, count]) => count >= 2)
    .map(([heading, _]) => heading)
    .slice(0, 10);

  // Extract title patterns
  const serpTitles = serpResults.map(r => r.title);

  // Extract meta description patterns
  const serpMetaPatterns = serpResults
    .map(r => r.metaDescription)
    .filter(Boolean);

  return {
    avgWordCount,
    commonHeadings,
    serpTitles,
    serpMetaPatterns
  };
}

/**
 * Main SERP analysis function
 * @param {string} keyword - Search keyword
 * @param {string} location - Location (optional)
 * @returns {Promise<Object>} Analysis results
 */
export async function analyzeSerp(keyword, location = "United States") {
  if (!keyword || !keyword.trim()) {
    throw new Error("Keyword is required");
  }

  try {
    // Step 1: Fetch top 10 SERP results
    const serpResults = await fetchSerpResults(keyword, location);

    if (serpResults.length === 0) {
      return {
        avgWordCount: 0,
        commonHeadings: [],
        contentGaps: [],
        serpTitles: [],
        serpMetaPatterns: []
      };
    }

    // Step 2: Fetch HTML for top 5 results
    const top5Results = serpResults.slice(0, 5);
    const pageContents = await Promise.all(
      top5Results.map(result => fetchPageContent(result.url))
    );

    // Step 3: Compute benchmarks
    const benchmarks = computeBenchmarks(serpResults, pageContents);

    // Step 4: Identify content gaps (common headings that might be missing)
    // This is a simplified version - in production, you'd compare against user's content
    const contentGaps = benchmarks.commonHeadings.slice(0, 5);

    return {
      avgWordCount: benchmarks.avgWordCount,
      commonHeadings: benchmarks.commonHeadings,
      contentGaps,
      serpTitles: benchmarks.serpTitles,
      serpMetaPatterns: benchmarks.serpMetaPatterns
    };
  } catch (error) {
    console.error("SERP Analysis Error:", error);
    throw error;
  }
}

