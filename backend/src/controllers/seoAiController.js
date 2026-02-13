import { VertexAI } from "@google-cloud/vertexai";
import { analyzeSerp } from "../services/serpAnalysisService.js";
import { getJson } from 'serpapi';
import { consumeCredits } from "../services/creditService.js";
import { CREDIT_COSTS } from "../config/creditCosts.js";

// Lazy initialization of Vertex AI to avoid startup failures
let vertexAI = null;
let model = null;
let initError = null;

const initializeVertexAI = () => {
  if (model) return model; // Already initialized
  if (initError) throw initError; // Previous init failed
  
  try {
    // Check if credentials are configured
    if (!process.env.GOOGLE_CLOUD_PROJECT) {
      throw new Error('GOOGLE_CLOUD_PROJECT environment variable is not set');
    }
    
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable is not set');
    }
    
    console.log('🚀 Initializing Vertex AI...');
    console.log('   Project:', process.env.GOOGLE_CLOUD_PROJECT);
    console.log('   Location:', process.env.GOOGLE_CLOUD_LOCATION || 'us-central1');
    console.log('   Credentials:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    
    vertexAI = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT,
      location: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
    });
    
    model = vertexAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });
    
    console.log('✅ Vertex AI initialized successfully');
    return model;
  } catch (error) {
    initError = error;
    console.error('❌ Vertex AI initialization failed:', error.message);
    throw error;
  }
};

// Caches
const seoCache = new Map();
const contentCache = new Map();
const metaDescCache = new Map();

const getSerpApiKey = () => {
  const key = process.env.SERPAPI_KEY;
  if (!key) {
    throw new Error('SERPAPI_KEY is not set in environment variables');
  }
  return key;
};

// Add this helper function at the top of your file, after the caches
const parseAIResponse = (aiText, fallbackExtract = false) => {
  let jsonText = aiText.trim();
  
  // Remove markdown code blocks
  jsonText = jsonText.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '');
  
  // Extract JSON object
  const firstBrace = jsonText.indexOf('{');
  const lastBrace = jsonText.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    jsonText = jsonText.substring(firstBrace, lastBrace + 1);
  }
  
  try {
    return JSON.parse(jsonText);
  } catch (e) {
    if (!fallbackExtract) throw e;
    
    // Fallback: Try to extract fields manually
    console.warn('⚠️ JSON parse failed, attempting manual extraction...');
    
    const excerptMatch = jsonText.match(/"excerpt"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
    const contentMatch = jsonText.match(/"content"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/s);
    
    if (!excerptMatch || !contentMatch) {
      throw new Error('Could not extract required fields from malformed JSON');
    }
    
    return {
      excerpt: excerptMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'),
      content: contentMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
    };
  }
};


export const generateSeoTitles = async (req, res) => {
  try {
    console.log('🚀 generateSeoTitles called');
    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));
    console.log('👤 req.admin:', req.admin ? 'EXISTS' : 'NULL');
    console.log('👤 req.user:', req.user ? 'EXISTS' : 'NULL');
    
    const { 
      input,                    // The selected related query
      trendingTopic,           // 🔥 NEW: The original trending topic
      force, 
      useRelatedQueries = false, 
      geo = 'US' 
    } = req.body;
    
    if (force === true) {
      seoCache.delete(input);
    }
    
    if (seoCache.has(input)) {
      console.log('✅ Returning cached result');
      return res.json(seoCache.get(input));
    }

    if (!input) {
      return res.status(400).json({ message: "Input is required" });
    }

    // Initialize Vertex AI on first use
    let aiModel;
    try {
      aiModel = initializeVertexAI();
    } catch (initErr) {
      console.error('❌ Vertex AI initialization failed:', initErr.message);
      return res.status(500).json({
        success: false,
        message: "Google Cloud AI is not properly configured. Please contact administrator.",
        error: initErr.message,
        details: "Missing or invalid Google Cloud credentials"
      });
    }

    let relatedQueries = [];
    let relatedTopics = [];
    
    // 🔥 UPDATED: Fetch related queries for BOTH the input and trending topic
    if (useRelatedQueries && process.env.SERPAPI_KEY) {
      try {
        console.log(`🔍 Fetching Google Trends data for: "${input}"`);
        if (trendingTopic) {
          console.log(`🔥 Using trending topic context: "${trendingTopic}"`);
        }
        
        // Fetch for the selected related query
        const queriesResponse = await getJson({
          engine: 'google_trends',
          api_key: getSerpApiKey(),
          q: input,
          data_type: 'RELATED_QUERIES',
          geo,
          date: 'today 3-m'
        });

        const risingQueries = queriesResponse.related_queries?.rising || [];
        const topQueries = queriesResponse.related_queries?.top || [];
        
        relatedQueries = [
          ...risingQueries.slice(0, 10).map(q => q.query),
          ...topQueries.slice(0, 10).map(q => q.query)
        ].filter(Boolean);

        // Fetch topics for the selected query
        const topicsResponse = await getJson({
          engine: 'google_trends',
          api_key: getSerpApiKey(),
          q: input,
          data_type: 'RELATED_TOPICS',
          geo,
          date: 'today 3-m'
        });

        const risingTopics = topicsResponse.related_topics?.rising || [];
        relatedTopics = risingTopics.slice(0, 5).map(t => t.topic?.title).filter(Boolean);

        // 🔥 NEW: If we have a trending topic, fetch its related queries too
        if (trendingTopic && trendingTopic !== input) {
          const trendingQueriesResponse = await getJson({
            engine: 'google_trends',
            api_key: getSerpApiKey(),
            q: trendingTopic,
            data_type: 'RELATED_QUERIES',
            geo,
            date: 'today 3-m'
          });

          const trendingRising = trendingQueriesResponse.related_queries?.rising || [];
          const trendingTop = trendingQueriesResponse.related_queries?.top || [];
          
          // Merge with existing queries (avoid duplicates)
          const trendingQueries = [
            ...trendingRising.slice(0, 5).map(q => q.query),
            ...trendingTop.slice(0, 5).map(q => q.query)
          ].filter(Boolean);

          relatedQueries = [
            ...new Set([...relatedQueries, ...trendingQueries])
          ];
        }

        console.log(`✅ Google Trends: Found ${relatedQueries.length} related queries`);
      } catch (trendsError) {
        console.warn("⚠️ Google Trends fetch failed:", trendsError.message);
      }
    }

    // Analyze SERP
    let serpContext = null;
    try {
      console.log(`🔍 Analyzing SERP for: "${input}"`);
      const serpData = await analyzeSerp(input, "United States");
      serpContext = {
        avgWordCount: serpData.avgWordCount,
        commonHeadings: serpData.commonHeadings,
        serpTitles: serpData.serpTitles,
        serpMetaPatterns: serpData.serpMetaPatterns
      };
      console.log(`✅ SERP Analysis Complete`);
    } catch (serpError) {
      console.warn("⚠️ SERP analysis failed:", serpError.message);
    }

    // 🔥 UPDATED: Enhanced prompt with both contexts
    const prompt = `You are an advanced SEO engine.

    Generate SEO-optimized blog metadata for this topic: "${input}"
    
    ${trendingTopic ? `
    🔥 TRENDING TOPIC CONTEXT: "${trendingTopic}"
    This is the broader trending topic that led to the specific query above.
    Consider both contexts when generating titles.
    ` : ''}

    ${relatedQueries.length > 0 ? `
    TRENDING SEARCHES (from Google Trends):
    ${relatedQueries.slice(0, 15).map((q, i) => `${i + 1}. ${q}`).join('\n')}

    Use these trending queries to create compelling, search-optimized titles!
    ${trendingTopic ? `Focus on how "${input}" relates to the broader topic "${trendingTopic}"` : ''}
    ` : ''}

    ${serpContext ? `
    TOP-RANKING TITLE PATTERNS:
    ${serpContext.serpTitles?.slice(0, 3).join('\n') || 'N/A'}
    ` : ''}

    REQUIREMENTS:

    1. PRIMARY KEYWORD:
      - Choose the best 2-4 word keyword for this topic
      - Must appear in ALL titles and slug
      ${trendingTopic ? `- Consider variations that bridge "${input}" and "${trendingTopic}"` : ''}

    2. TITLES (5 options):
      - EXACTLY 50-60 characters each
      - Include primary keyword
      - Use numbers and power words (Best, Ultimate, Complete, Proven)
      ${relatedQueries.length > 0 ? `- Incorporate trending queries like "${relatedQueries[0]}"` : ''}
      ${trendingTopic ? `- Show connection to "${trendingTopic}" where relevant` : ''}

    3. META DESCRIPTIONS (5 options):
      - EXACTLY 140-160 characters each
      - Include primary keyword in first 50 characters
      - Add call-to-action (Discover, Learn, Get)
      ${trendingTopic ? `- Reference the trending topic "${trendingTopic}" when relevant` : ''}

    4. SLUG:
      - Include primary keyword
      - Lowercase, hyphen-separated, 3-6 words max

    5. KEYPHRASES:
      - Primary: main target keyword
      - Secondary: 4-6 LSI keywords
      ${trendingTopic ? `- Include variations connecting "${input}" and "${trendingTopic}"` : ''}

    6. SERP INSIGHTS:
      - Content angle that ranks best
      - 5-8 H2 section recommendations
      - Target word count: ${serpContext?.avgWordCount || 1500}
      ${trendingTopic ? `- Sections that bridge the specific query and broader trend` : ''}

    OUTPUT FORMAT (MUST be valid JSON with no markdown):
    {
      "titles": ["title1", "title2", "title3", "title4", "title5"],
      "metaDescriptions": ["desc1", "desc2", "desc3", "desc4", "desc5"],
      "slug": "keyword-slug",
      "keyphrases": {
        "primary": "main keyword",
        "secondary": ["keyword1", "keyword2", "keyword3", "keyword4"]
      },
      "serpInsights": {
        "contentAngle": "what type ranks",
        "recommendedSections": ["section1", "section2", "section3", "section4", "section5"],
        "targetWordCount": ${serpContext?.avgWordCount || 1500}
      }
    }

    Return ONLY the JSON object. No markdown, no code blocks, no explanations.`;

    console.log('📤 Sending request to Vertex AI...');
    const response = await aiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { 
        maxOutputTokens: 3000, 
        temperature: 0.7,
        responseMimeType: "application/json"
      }
    });

    console.log('✅ Received response from Vertex AI');
    const aiText = response.response.candidates[0].content.parts[0].text;
    
    let jsonText = aiText.trim();
    jsonText = jsonText.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '');
    
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    }
    
    console.log('Attempting to parse JSON...');
    const json = JSON.parse(jsonText);

    const legacyData = json.titles.map((title) => ({
      title,
      keywords: [json.keyphrases.primary, ...json.keyphrases.secondary]
    }));

    // ✅ AI generation successful - now deduct credits
    let updatedUser;
    try {
      updatedUser = await consumeCredits(req.user._id, CREDIT_COSTS.TITLE);
    } catch (creditError) {
      if (creditError.message === "Insufficient credits") {
        return res.status(403).json({
          success: false,
          message: "Insufficient credits. Please top up."
        });
      }
      throw creditError;
    }

    const payload = {
      success: true,
      data: legacyData,
      titles: json.titles,
      metaDescriptions: json.metaDescriptions,
      slug: json.slug,
      keyphrases: json.keyphrases,
      serpInsights: json.serpInsights,
      trendsData: relatedQueries.length > 0 ? {
        relatedQueries: relatedQueries.slice(0, 20),
        relatedTopics: relatedTopics,
        trendingTopic: trendingTopic || null  // 🔥 NEW: Include in response
      } : null,
      remainingCredits: updatedUser.creditBalance
    };

    seoCache.set(input, payload);
    
    // ✅ STEP 3: Deduct credits after successful AI generation
    try {
      const account = req.admin || req.user;
      if (account) {
        const updatedUser = await consumeCredits(
          account._id,
          CREDIT_COSTS.TITLE_GENERATION,
          "seo_title"
        );
        payload.creditBalance = updatedUser.creditBalance;
      }
    } catch (creditError) {
      console.error(`❌ Credit deduction failed: ${creditError.message}`);
      if (creditError.statusCode === 403) {
        return res.status(403).json({
          success: false,
          message: "Insufficient credits. Please top up.",
          required: CREDIT_COSTS.TITLE_GENERATION,
          currentBalance: creditError.currentBalance,
          data: payload.data // Still return generated data
        });
      }
      // Other credit errors - continue but log
      console.warn(`⚠️ Continue despite credit error: ${creditError.message}`);
    }
    
    return res.json(payload);

  } catch (error) {
    console.error("SEO Titles ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "AI generation failed",
      error: error.message,
    });
  }
};

export const generateMetaDescriptions = async (req, res) => {
  try {
    const { title, force } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (force === true) {
      metaDescCache.delete(title);
    }

    if (metaDescCache.has(title)) {
      return res.json(metaDescCache.get(title));
    }

    // Initialize Vertex AI on first use
    let aiModel;
    try {
      aiModel = initializeVertexAI();
    } catch (initErr) {
      console.error('❌ Vertex AI initialization failed:', initErr.message);
      return res.status(500).json({
        success: false,
        message: "Google Cloud AI is not properly configured. Please contact administrator.",
        error: initErr.message,
        details: "Missing or invalid Google Cloud credentials"
      });
    }

    // 🔥 SIMPLIFIED: Ask for array directly since that's what we need
    const prompt = `Generate exactly 5 SEO-optimized meta descriptions for this article title:

"${title}"

REQUIREMENTS:
- Each description must be between 140-160 characters
- Include the main keyword from the title
- Include a call-to-action (Discover, Learn, Get, Find out, etc.)
- Make them compelling and click-worthy
- Each should have a unique angle

Return ONLY a JSON array of 5 strings. No explanations, no markdown, no code blocks.

Example format:
["Description 1 here with CTA...", "Description 2 here with CTA...", "Description 3 here with CTA...", "Description 4 here with CTA...", "Description 5 here with CTA..."]`;

    let retryCount = 0;
    let metaDescriptions = [];
    const maxRetries = 2;

    while (retryCount <= maxRetries && metaDescriptions.length === 0) {
      try {
        console.log(`📝 Generating meta descriptions (attempt ${retryCount + 1}/${maxRetries + 1})...`);

        const response = await aiModel.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { 
            maxOutputTokens: 1000, 
            temperature: 0.7,
          }
        });

        const aiText = response.response.candidates[0].content.parts[0].text;
        console.log('🤖 Raw AI response:', aiText.substring(0, 200));
        
        // Clean up the response
        let jsonText = aiText.trim();
        
        // Remove markdown code blocks
        jsonText = jsonText.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '');
        
        // Remove any leading/trailing text before JSON
        const firstBracket = jsonText.indexOf('[');
        const lastBracket = jsonText.lastIndexOf(']');
        const firstBrace = jsonText.indexOf('{');
        const lastBrace = jsonText.lastIndexOf('}');
        
        let parsed;
        
        // Try parsing as array first (preferred format)
        if (firstBracket !== -1 && lastBracket !== -1 && 
            (firstBrace === -1 || firstBracket < firstBrace)) {
          jsonText = jsonText.substring(firstBracket, lastBracket + 1);
          console.log('📋 Parsing as array...');
          parsed = JSON.parse(jsonText);
          
          if (Array.isArray(parsed)) {
            metaDescriptions = parsed;
          } else {
            throw new Error('Expected array but got object');
          }
        } 
        // Fallback: Try parsing as object
        else if (firstBrace !== -1 && lastBrace !== -1) {
          jsonText = jsonText.substring(firstBrace, lastBrace + 1);
          console.log('📦 Parsing as object...');
          parsed = JSON.parse(jsonText);
          
          if (parsed.metaDescriptions && Array.isArray(parsed.metaDescriptions)) {
            metaDescriptions = parsed.metaDescriptions;
          } else if (Array.isArray(parsed.descriptions)) {
            metaDescriptions = parsed.descriptions;
          } else if (typeof parsed === 'object') {
            // Extract first array found in the object
            const firstArray = Object.values(parsed).find(val => Array.isArray(val));
            if (firstArray) {
              metaDescriptions = firstArray;
            } else {
              throw new Error('No array found in object');
            }
          }
        } 
        else {
          throw new Error('No valid JSON structure found in response');
        }

        // Validate we got descriptions
        if (!Array.isArray(metaDescriptions) || metaDescriptions.length === 0) {
          throw new Error("No meta descriptions found in response");
        }

        console.log(`📊 Found ${metaDescriptions.length} descriptions`);

        // Filter and validate descriptions
        const validDescriptions = metaDescriptions
          .filter(desc => {
            if (typeof desc !== 'string') return false;
            const len = desc.length;
            const isValid = len >= 130 && len <= 170; // Slightly relaxed range
            if (!isValid) {
              console.log(`⚠️ Rejected description (${len} chars): ${desc.substring(0, 50)}...`);
            }
            return isValid;
          });

        console.log(`✅ ${validDescriptions.length} valid descriptions`);

        if (validDescriptions.length < 3) {
          console.warn(`⚠️ Only ${validDescriptions.length} valid descriptions, need at least 3, retrying...`);
          metaDescriptions = [];
          retryCount++;
          
          if (retryCount <= maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
        }

        // Take up to 5 valid descriptions
        metaDescriptions = validDescriptions.slice(0, 5);
        console.log('✅ Meta descriptions generated successfully');

      } catch (parseError) {
        console.error(`❌ Parse error on attempt ${retryCount + 1}:`, parseError.message);
        retryCount++;
        
        if (retryCount > maxRetries) {
          console.error("❌ All parsing attempts failed");
          return res.status(502).json({
            success: false,
            message: "AI returned malformed content after multiple attempts. Please try again.",
            error: parseError.message,
            suggestion: "Try simplifying the title or try again in a moment"
          });
        }
        
        console.warn(`⚠️ Retrying in 1 second...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Final validation
    if (metaDescriptions.length === 0) {
      return res.status(502).json({
        success: false,
        message: "Could not generate valid meta descriptions after multiple attempts",
        suggestion: "Please try again or use a different title"
      });
    }

    // ✅ AI generation successful - now deduct credits
    let updatedUser;
    try {
      updatedUser = await consumeCredits(req.user._id, CREDIT_COSTS.META);
    } catch (creditError) {
      if (creditError.message === "Insufficient credits") {
        return res.status(403).json({
          success: false,
          message: "Insufficient credits. Please top up."
        });
      }
      throw creditError;
    }

    const payload = {
      success: true,
      title,
      metaDescriptions,
      remainingCredits: updatedUser.creditBalance
    };

    metaDescCache.set(title, payload);
    
    // ✅ STEP 3: Deduct credits after successful AI generation
    try {
      const account = req.admin || req.user;
      if (account) {
        const updatedUser = await consumeCredits(
          account._id,
          CREDIT_COSTS.META_DESCRIPTION,
          "meta_description"
        );
        payload.creditBalance = updatedUser.creditBalance;
      }
    } catch (creditError) {
      console.error(`❌ Credit deduction failed: ${creditError.message}`);
      if (creditError.statusCode === 403) {
        return res.status(403).json({
          success: false,
          message: "Insufficient credits. Please top up.",
          required: CREDIT_COSTS.META_DESCRIPTION,
          currentBalance: creditError.currentBalance,
          data: payload // Still return generated data
        });
      }
      // Other credit errors - continue but log
      console.warn(`⚠️ Continue despite credit error: ${creditError.message}`);
    }
    
    return res.json(payload);

  } catch (error) {
    console.error("Meta Description ERROR:", error.message);
    console.error("Full error:", error);
    
    return res.status(500).json({
      success: false,
      message: "AI generation failed",
      error: error.message,
    });
  }
};

export const generateBlogContent = async (req, res) => {
  const { 
    title, 
    keywords, 
    originalInput, 
    force, 
    serpInsights, 
    relatedQueries = [],
    recommendedSections = []
  } = req.body;

  if (!title || !keywords || !Array.isArray(keywords)) {
    return res.status(400).json({
      message: "Title and keywords array are required",
    });
  }

  const cacheKey = `${title}|${keywords.join(",")}`;

  if (force === true) {
    contentCache.delete(cacheKey);
  }

  if (!force && contentCache.has(cacheKey)) {
    return res.json(contentCache.get(cacheKey));
  }

  try {
    // Initialize Vertex AI on first use
    let aiModel;
    try {
      aiModel = initializeVertexAI();
    } catch (initErr) {
      console.error('❌ Vertex AI initialization failed:', initErr.message);
      return res.status(500).json({
        success: false,
        message: "Google Cloud AI is not properly configured. Please contact administrator.",
        error: initErr.message,
        details: "Missing or invalid Google Cloud credentials"
      });
    }

    const primaryKeyword = keywords[0];
    const secondaryKeywords = keywords.slice(1, 5);

    // Fetch SERP data if not provided
    let serpContext = serpInsights;
    if (!serpContext) {
      try {
        const serpData = await analyzeSerp(primaryKeyword, "United States");
        serpContext = {
          avgWordCount: serpData.avgWordCount,
          commonHeadings: serpData.commonHeadings,
          targetWordCount: serpData.avgWordCount || 1500,
          contentAngle: "comprehensive guide",
          recommendedSections: serpData.commonHeadings?.slice(0, 6) || [],
          relatedQueriesUsed: relatedQueries || []
        };
      } catch (serpError) {
        console.warn("⚠️ SERP fetch failed:", serpError.message);
        serpContext = {
          targetWordCount: 1500,
          contentAngle: "comprehensive guide",
          recommendedSections: [],
          relatedQueriesUsed: relatedQueries || []
        };
      }
    }

    const sectionsToUse = recommendedSections.length > 0 
      ? recommendedSections 
      : serpContext?.recommendedSections || [];

    // 🔥 IMPROVED: Simplified prompt with stricter JSON format
    const systemPrompt = `Generate blog content for: "${title}"

PRIMARY KEYWORD: "${primaryKeyword}"
SECONDARY KEYWORDS: ${secondaryKeywords.join(", ")}

${serpContext?.relatedQueriesUsed?.length > 0 ? `
TRENDING QUERIES TO ADDRESS:
${serpContext.relatedQueriesUsed.slice(0, 8).map((q, i) => `${i + 1}. ${q}`).join('\n')}
` : ''}

${sectionsToUse.length > 0 ? `
REQUIRED SECTIONS:
${sectionsToUse.map((section, i) => `${i + 1}. ${section}`).join('\n')}

Include ALL sections as H2 headings.
` : ''}

TARGET: ${serpContext?.targetWordCount || 1500} words

REQUIREMENTS:
1. Excerpt: 140-160 characters with "${primaryKeyword}"
2. Content: Markdown format with H1, H2, H3 sections
3. First paragraph must contain "${primaryKeyword}"
4. Include secondary keywords naturally
5. Use bullet points and numbered lists

CRITICAL: Return ONLY valid JSON with this EXACT structure:
{
  "excerpt": "your 140-160 character description here",
  "content": "# ${title}\\n\\nYour full markdown content here..."
}

NO code blocks, NO explanations, ONLY the JSON object.`;

    let retryCount = 0;
    let blogData = null;
    const maxRetries = 2;

    while (retryCount <= maxRetries && !blogData) {
      try {
        console.log(`📝 Generating content (attempt ${retryCount + 1}/${maxRetries + 1})...`);
        
        const response = await aiModel.generateContent({
          contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
          generationConfig: {
            maxOutputTokens: 8000,
            temperature: 0.7,
            // 🔥 REMOVED responseMimeType - let Gemini return text, we'll parse it
          },
        });

        const aiText = response.response.candidates[0].content.parts[0].text;
        
        // Try parsing with fallback extraction
        blogData = parseAIResponse(aiText, retryCount > 0);
        
        // Validate required fields
        if (!blogData.excerpt || !blogData.content) {
          throw new Error('Missing required fields: excerpt or content');
        }
        
        // Validate excerpt length
        if (blogData.excerpt.length < 120 || blogData.excerpt.length > 170) {
          console.warn(`⚠️ Excerpt length ${blogData.excerpt.length} outside range, retrying...`);
          blogData = null;
          retryCount++;
          continue;
        }
        
        console.log('✅ Content generated successfully');
        
      } catch (parseError) {
        retryCount++;
        
        if (retryCount > maxRetries) {
          console.error("❌ All parsing attempts failed:", parseError.message);
          return res.status(502).json({
            success: false,
            message: "AI returned malformed content after multiple attempts. Please try again.",
            error: parseError.message,
            suggestion: "Try simplifying your title or reducing the number of keywords"
          });
        }
        
        console.warn(`⚠️ Parse attempt ${retryCount} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
      }
    }

    // ✅ AI generation successful - now deduct credits
    let updatedUser;
    try {
      updatedUser = await consumeCredits(req.user._id, CREDIT_COSTS.CONTENT);
    } catch (creditError) {
      if (creditError.message === "Insufficient credits") {
        return res.status(403).json({
          success: false,
          message: "Insufficient credits. Please top up."
        });
      }
      throw creditError;
    }

    const payload = {
      success: true,
      data: {
        title,
        excerpt: blogData.excerpt,
        content: blogData.content,
        keywords,
        sectionsUsed: sectionsToUse
      },
      remainingCredits: updatedUser.creditBalance
    };

    contentCache.set(cacheKey, payload);
    
    // ✅ STEP 3: Deduct credits after successful AI generation
    try {
      const account = req.admin || req.user;
      if (account) {
        const updatedUser = await consumeCredits(
          account._id,
          CREDIT_COSTS.CONTENT_GENERATION,
          "blog_content"
        );
        payload.creditBalance = updatedUser.creditBalance;
      }
    } catch (creditError) {
      console.error(`❌ Credit deduction failed: ${creditError.message}`);
      if (creditError.statusCode === 403) {
        return res.status(403).json({
          success: false,
          message: "Insufficient credits. Please top up.",
          required: CREDIT_COSTS.CONTENT_GENERATION,
          currentBalance: creditError.currentBalance,
          data: payload.data // Still return generated data
        });
      }
      // Other credit errors - continue but log
      console.warn(`⚠️ Continue despite credit error: ${creditError.message}`);
    }
    
    return res.json(payload);

  } catch (error) {
    console.error("Blog Content ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "AI generation failed",
      error: error.message,
    });
  }
};

export const analyzeContentGaps = async (req, res) => {
  try {
    const { content, primaryKeyword } = req.body;

    if (!primaryKeyword) {
      return res.status(400).json({
        success: false,
        message: "Primary keyword is required"
      });
    }

    const serpData = await analyzeSerp(primaryKeyword, "United States");

    const headingRegex = /^#{2,3}\s+(.+)$/gm;
    const userHeadings = [];
    let match;
    while ((match = headingRegex.exec(content || "")) !== null) {
      userHeadings.push(match[1].toLowerCase().trim());
    }

    const missingTopics = serpData.commonHeadings.filter(serpHeading => {
      const normalizedSerp = serpHeading.toLowerCase();
      return !userHeadings.some(userH => 
        userH.includes(normalizedSerp) || normalizedSerp.includes(userH)
      );
    });

    const wordCount = (content || "").split(/\s+/).filter(w => w.length > 0).length;

    const payload = {
      success: true,
      analysis: {
        wordCount: {
          current: wordCount,
          serpAvg: serpData.avgWordCount,
          status: wordCount >= serpData.avgWordCount * 0.9 ? "✅ Competitive" : "⚠️ Too short"
        },
        coverage: {
          yourSections: userHeadings.length,
          serpAvgSections: serpData.commonHeadings.length,
          missingTopics: missingTopics.slice(0, 5)
        },
        recommendations: missingTopics.length > 0 
          ? `Consider adding sections on: ${missingTopics.slice(0, 3).join(", ")}`
          : "✅ Good topic coverage!"
      }
    };
    
    // ✅ STEP 3: Deduct credits after successful analysis
    try {
      const account = req.admin || req.user;
      if (account) {
        const updatedUser = await consumeCredits(
          account._id,
          CREDIT_COSTS.CONTENT_GAP_ANALYSIS,
          "content_gap_analysis"
        );
        payload.creditBalance = updatedUser.creditBalance;
      }
    } catch (creditError) {
      console.error(`❌ Credit deduction failed: ${creditError.message}`);
      if (creditError.statusCode === 403) {
        return res.status(403).json({
          success: false,
          message: "Insufficient credits. Please top up.",
          required: CREDIT_COSTS.CONTENT_GAP_ANALYSIS,
          currentBalance: creditError.currentBalance,
          data: payload // Still return analysis data
        });
      }
      // Other credit errors - continue but log
      console.warn(`⚠️ Continue despite credit error: ${creditError.message}`);
    }

    return res.json(payload);

  } catch (error) {
    console.error("Content Gap Analysis Error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};