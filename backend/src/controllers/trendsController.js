import { getJson } from 'serpapi';
import { asyncHandler } from '../utils/asyncHandler.js';

const getSerpApiKey = () => {
  const key = process.env.SERPAPI_KEY;
  if (!key) {
    throw new Error('SERPAPI_KEY is not set in environment variables');
  }
  return key;
};


const TREND_CATEGORIES = {
  all: '',
  business: 'b',
  entertainment: 'e',
  health: 'm',
  'sci-tech': 't',
  sports: 's',
  design: 't', 
  product: 'b', 
  engineering: 't', 
  marketing: 'b', 
  research: 't' 
};

/**
 * Get trending searches by category
 * Returns top 10-20 trending topics
 */
export const getTrendingByCategory = asyncHandler(async (req, res) => {
  try {
    const { category = 'all', geo = 'US', hours = '' } = req.query;

    const categoryId = TREND_CATEGORIES[category.toLowerCase()] || '';

    const response = await getJson({
      engine: 'google_trends_trending_now',
      geo,
      category_id: categoryId,
      hours,
      api_key: getSerpApiKey()
    });

    // Parse and structure trending topics
    const trendingSearches = response.trending_searches || [];
    
    const structuredTrends = trendingSearches.map(trend => ({
      query: trend.query || trend.title,
      traffic: trend.traffic || 'N/A',
      exploredQuery: trend.explore_query,
      relatedQueries: trend.related_queries || [],
      articles: trend.articles?.slice(0, 3) || [] // Top 3 articles
    })).slice(0, 20); // Limit to top 20

    res.json({
      success: true,
      category,
      geo,
      trends: structuredTrends,
      total: structuredTrends.length
    });
  } catch (error) {
    console.error('Error fetching trending searches:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending searches',
      message: error.message
    });
  }
});

/**
 * Get related topics for a keyword
 * Shows what topics are related to the main keyword
 */
export const getRelatedTopics = asyncHandler(async (req, res) => {
  try {
    const { keyword, geo = 'US', date = 'today 12-m' } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: 'Keyword is required'
      });
    }

    const response = await getJson({
      engine: 'google_trends',
      api_key: getSerpApiKey(),
      q: keyword,
      data_type: 'RELATED_TOPICS',
      geo,
      date
    });

    // Parse related topics (rising and top)
    const risingTopics = response.related_topics?.rising || [];
    const topTopics = response.related_topics?.top || [];

    res.json({
      success: true,
      keyword,
      risingTopics: risingTopics.slice(0, 10),
      topTopics: topTopics.slice(0, 10)
    });
  } catch (error) {
    console.error('Error fetching related topics:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch related topics',
      message: error.message
    });
  }
});

/**
 * Get related queries for a keyword
 * Shows what people are searching for related to the keyword
 */
export const getRelatedQueries = asyncHandler(async (req, res) => {
  try {
    const { keyword, geo = 'US', date = 'today 12-m' } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: 'Keyword is required'
      });
    }

    const response = await getJson({
      engine: 'google_trends',
      api_key: getSerpApiKey(),
      q: keyword,
      data_type: 'RELATED_QUERIES',
      geo,
      date
    });
    console.log(response);

    // Parse related queries (rising and top)
    const risingQueries = response.related_queries?.rising || [];
    const topQueries = response.related_queries?.top || [];

    // Structure the data better
    const structuredRising = risingQueries.slice(0, 15).map(q => ({
      query: q.query,
      value: q.value,
      formattedValue: q.formattedValue || q.value,
      link: q.link
    }));

    const structuredTop = topQueries.slice(0, 15).map(q => ({
      query: q.query,
      value: q.value,
      formattedValue: q.formattedValue || q.value,
      link: q.link
    }));

    res.json({
      success: true,
      keyword,
      risingQueries: structuredRising,
      topQueries: structuredTop,
      totalRising: structuredRising.length,
      totalTop: structuredTop.length
    });
  } catch (error) {
    console.error('Error fetching related queries:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch related queries',
      message: error.message
    });
  }
});

/**
 * Get interest over time for a keyword
 */
export const getInterestOverTime = asyncHandler(async (req, res) => {
  try {
    const { keyword, geo = 'US', date = 'today 12-m' } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: 'Keyword is required'
      });
    }

    const response = await getJson({
      engine: 'google_trends',
      api_key: getSerpApiKey(),
      q: keyword,
      data_type: 'TIMESERIES',
      geo,
      date
    });

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching interest over time:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch interest data',
      message: error.message
    });
  }
});

/**
 * 🔥 NEW: Combined endpoint for blog topic discovery
 * Returns trending topics + related queries in one call
 */
export const discoverBlogTopics = asyncHandler(async (req, res) => {
  try {
    const { category = 'all', geo = 'US' } = req.query;

    const categoryId = TREND_CATEGORIES[category.toLowerCase()] || '';

    // Fetch trending searches
    const trendsResponse = await getJson({
      engine: 'google_trends_trending_now',
      geo,
      category_id: categoryId,
      api_key: getSerpApiKey()
    });


    const trendingSearches = trendsResponse.trending_searches || [];

    console.log('Trends Response:', trendingSearches);
    
    // Structure trending topics with SEO potential
    const topics = trendingSearches.slice(0, 15).map(trend => ({
      keyword: trend.query || trend.title,
      traffic: trend.increase_percentage || 'N/A',
      searchVolume: trend.search_volume || 'N/A',
      relatedQueries: trend.related_queries || [],
      newsArticles: trend.articles?.length || 0,
      trendScore: calculateTrendScore(trend)
    }));

    res.json({
      success: true,
      category,
      geo,
      topics,
      totalTopics: topics.length,
      recommendation: topics[0] ? `"${topics[0].keyword}" is trending with high search volume` : 'No trending topics found'
    });
  } catch (error) {
    console.error('Error discovering blog topics:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to discover topics',
      message: error.message
    });
  }
});

/**
 * Calculate trend score (higher = better blog opportunity)
 */
function calculateTrendScore(trend) {
  const volume = trend.search_volume || 0; // monthly searches
  const growth = trend.increase_percentage || 0; // % increase
  const volumeScore = Math.min(volume / 1000, 100); // Normalize
  const growthScore = Math.min(growth, 100); // Cap at 100%

  // weighted blend
  const score = (volumeScore * 0.6) + (growthScore * 0.4);

  return Math.round(score);
}


/**
 * 🔥 NEW: Generate blog titles from trending keyword
 * Fetches related queries and uses them to generate multiple title angles
 */
export const generateTitlesFromTrend = asyncHandler(async (req, res) => {
  try {
    const { keyword, geo = 'US' } = req.body;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: 'Keyword is required'
      });
    }

    // Fetch related queries
    const relatedQueriesResponse = await getJson({
      engine: 'google_trends',
      api_key: getSerpApiKey(),
      q: keyword,
      data_type: 'RELATED_QUERIES',
      geo,
      date: 'today 3-m'
    });

    const risingQueries = relatedQueriesResponse.related_queries?.rising || [];
    const topQueries = relatedQueriesResponse.related_queries?.top || [];

    // Extract query strings
    const relatedKeywords = [
      ...risingQueries.slice(0, 10).map(q => q.query),
      ...topQueries.slice(0, 10).map(q => q.query)
    ].filter(Boolean);

    // Also get related topics for additional context
    const relatedTopicsResponse = await getJson({
      engine: 'google_trends',
      api_key: getSerpApiKey(),
      q: keyword,
      data_type: 'RELATED_TOPICS',
      geo,
      date: 'today 3-m'
    });

    const risingTopics = relatedTopicsResponse.related_topics?.rising || [];
    const additionalKeywords = risingTopics.slice(0, 5).map(t => t.topic?.title).filter(Boolean);

    res.json({
      success: true,
      keyword,
      relatedQueries: relatedKeywords.slice(0, 20),
      relatedTopics: additionalKeywords,
      contentAngles: [
        `${keyword}: Complete Guide`,
        `How to ${keyword.includes('how') ? keyword.split('how to ')[1] : keyword}`,
        `${keyword} - Everything You Need to Know`,
        `Top ${keyword} Tips and Tricks`,
        `${keyword} Explained (2025 Guide)`
      ]
    });
  } catch (error) {
    console.error('Error generating titles from trend:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate titles',
      message: error.message
    });
  }
});