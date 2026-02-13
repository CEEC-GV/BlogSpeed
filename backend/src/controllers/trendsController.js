import { getJson } from 'serpapi';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Free fallback: Fetch daily trends from Google Trends public RSS feed
 */
const fetchFreeTrends = async (geo = 'US') => {
  const url = `https://trends.google.com/trending/rss?geo=${geo}`;
  
  console.log(`🌐 Free fallback: Fetching ${url}`);
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'application/rss+xml, application/xml, text/xml',
    }
  });
  
  if (!response.ok) {
    throw new Error(`Google Trends RSS returned ${response.status}`);
  }
  
  const xml = await response.text();
  
  // Parse RSS XML with regex (lightweight, no dependency needed)
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = itemXml.match(/<title>(.*?)<\/title>/)?.[1] || 'Unknown';
    const traffic = itemXml.match(/<ht:approx_traffic>(.*?)<\/ht:approx_traffic>/)?.[1] || 'N/A';
    const newsCount = (itemXml.match(/<ht:news_item>/g) || []).length;
    
    // Parse traffic number for scoring
    const trafficNum = parseInt(String(traffic).replace(/[^0-9]/g, '')) || 0;
    
    items.push({
      keyword: title.replace(/&apos;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
      traffic,
      searchVolume: traffic,
      relatedQueries: [],
      newsArticles: newsCount,
      trendScore: Math.min(Math.round(trafficNum / 100), 100) || 10
    });
  }
  
  return items;
};

const getSerpApiKey = () => {
  const key = process.env.SERPAPI_KEY || process.env.SERP_API_KEY;
  if (!key) {
    console.error('❌ SERPAPI_KEY is missing in environment variables');
    throw new Error('SERPAPI_KEY is not set in environment variables. Contact administrator.');
  }
  if (key.length < 10) {
    console.error('❌ SERPAPI_KEY appears invalid (too short)');
    throw new Error('SERPAPI_KEY appears to be invalid');
  }
  console.log(`✅ SERPAPI_KEY is configured (length: ${key.length})`);
  return key;
};

const TREND_CATEGORIES = {
  all: '',
  autos_and_vehicles: 1,
  beauty_and_fashion: 2,
  business_and_finance: 3,
  entertainment: 4,
  food_and_drink: 5,
  games: 6,
  health: 7,
  hobbies_and_leisure: 8,
  jobs_and_education: 9,
  law_and_government: 10,
  pets_and_animals: 13,
  politics: 14,
  science: 15,
  shopping: 16,
  sports: 17,
  technology: 18,
  travel_and_transportation: 19,
  climate: 20
};
/**
 * Get trending searches by category
 * Returns top 10-20 trending topics
 */
export const getTrendingByCategory = asyncHandler(async (req, res) => {
  try {
    const { category = 'all', country, state, city, hours = '' } = req.query;

    // Use country for geo, default to US if not provided (for backward compatibility)
    const geo = country || 'US';

    const categoryId = TREND_CATEGORIES[category.toLowerCase()] ?? '';


    const response = await getJson({
      engine: 'google_trends_trending_now',
      geo,
      category_id: categoryId === '' ? undefined : categoryId,
      hours,
      api_key: getSerpApiKey()
    });

    // Check for SerpAPI error response
    if (response?.error) {
      return res.status(503).json({
        success: false,
        error: 'Trends API is temporarily unavailable',
        message: typeof response.error === 'string' ? response.error : JSON.stringify(response.error)
      });
    }

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
    const { keyword, country, state, city, date = 'today 12-m' } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: 'Keyword is required'
      });
    }

    // Use country for geo, default to US if not provided (for backward compatibility)
    const geo = country || 'US';

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
    const { keyword, country, state, city, date = 'today 12-m' } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: 'Keyword is required'
      });
    }

    // Use country for geo, default to US if not provided (for backward compatibility)
    const geo = country || 'US';

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
    const { keyword, country, state, city, date = 'today 12-m' } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: 'Keyword is required'
      });
    }

    // Use country for geo, default to US if not provided (for backward compatibility)
    const geo = country || 'US';

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
 * 🔥 Combined endpoint for blog topic discovery
 * Uses SerpAPI first, falls back to free google-trends-api if SerpAPI fails
 */
export const discoverBlogTopics = asyncHandler(async (req, res) => {
  try {
    const { category = 'all', country, state, city } = req.query;

    console.log('🔥 discoverBlogTopics called');
    console.log('📦 Query params:', { category, country, state, city });

    if (!country) {
      return res.status(400).json({
        success: false,
        error: 'Country is required to fetch localized trends'
      });
    }

    const categoryId = TREND_CATEGORIES[category.toLowerCase()] ?? '';
    const geo = country;

    // ===== TRY SerpAPI FIRST =====
    let topics = [];
    let source = 'serpapi';
    
    try {
      console.log(`🔍 Trying SerpAPI - Category: ${category}, Geo: ${geo}`);
      const trendsResponse = await getJson({
        engine: 'google_trends_trending_now',
        geo,
        category_id: categoryId === '' ? undefined : categoryId,
        api_key: getSerpApiKey()
      });

      if (trendsResponse?.error) {
        throw new Error(typeof trendsResponse.error === 'string' ? trendsResponse.error : JSON.stringify(trendsResponse.error));
      }

      if (trendsResponse?.trending_searches?.length > 0) {
        topics = trendsResponse.trending_searches
          .map(trend => ({
            keyword: trend.query || trend.title,
            traffic: trend.increase_percentage || 'N/A',
            searchVolume: trend.search_volume || 'N/A',
            relatedQueries: trend.related_queries || [],
            newsArticles: trend.articles?.length || 0,
            trendScore: calculateTrendScore(trend)
          }))
          .sort((a, b) => b.trendScore - a.trendScore)
          .slice(0, 15);
        console.log(`✅ SerpAPI returned ${topics.length} topics`);
      } else {
        throw new Error('SerpAPI returned empty data');
      }
    } catch (serpErr) {
      const serpMsg = serpErr?.message || (typeof serpErr === 'object' ? JSON.stringify(serpErr) : String(serpErr));
      console.warn(`⚠️ SerpAPI failed: ${serpMsg}. Falling back to free Google Trends...`);
      source = 'google-trends-api';
      
      // ===== FALLBACK: Free Google Trends direct fetch =====
      try {
        const allTrends = await fetchFreeTrends(geo);
        topics = allTrends.slice(0, 15);
        console.log(`✅ Free fallback returned ${topics.length} topics`);
      } catch (freeErr) {
        console.error('❌ Free fallback also failed:', freeErr.message);
        return res.status(503).json({
          success: false,
          error: 'All trends providers are unavailable',
          message: `SerpAPI: ${serpMsg}. Fallback: ${freeErr.message}`,
          suggestion: 'Please try again later.'
        });
      }
    }

    // Build location label
    let locationLabel = country;
    if (state) locationLabel = state + ', ' + locationLabel;
    if (city) locationLabel = city + ', ' + locationLabel;

    const response = {
      success: true,
      category,
      geo: country,
      locationLabel,
      source,
      topics,
      totalTopics: topics.length,
      recommendation: topics[0] ? `"${topics[0].keyword}" is trending with high search volume` : 'No trending topics found'
    };

    console.log(`✅ Sending response with ${topics.length} topics (source: ${source})`);
    res.json(response);

  } catch (err) {
    console.error("FULL ERROR:", err);
    console.error("STACK:", err?.stack);
    const message = err?.message || (typeof err === 'object' ? JSON.stringify(err) : String(err));
    res.status(500).json({ 
      success: false,
      error: 'Failed to discover trending topics',
      message 
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
    const { keyword, country, state, city } = req.body;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: 'Keyword is required'
      });
    }

    // Use country for geo, default to US if not provided (for backward compatibility)
    const geo = country || 'US';

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
