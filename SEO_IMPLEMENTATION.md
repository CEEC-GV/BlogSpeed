# SEO Analysis System Implementation

## Overview
A Yoast-style SEO analysis system has been added to the blog editor with real-time SERP-based scoring and recommendations.

## Files Created

### Backend

1. **`backend/src/services/serpAnalysisService.js`**
   - Fetches top 10 Google organic results using SerpAPI (with Zenserp fallback)
   - Fetches and parses HTML from top 5 results
   - Extracts headings (H1, H2, H3), word count, images, lists
   - Computes SERP benchmarks (avg word count, common headings, content gaps)

2. **`backend/src/utils/seoScore.js`**
   - Yoast-style SEO scoring algorithm
   - Checks: title length, meta description length, keyword placement, content length, keyword density
   - Returns score (0-100) and detailed checks array

3. **`backend/src/controllers/seoController.js`**
   - `POST /api/admin/seo/serp-analysis` - Analyzes SERP for a keyword
   - `POST /api/admin/seo/score` - Calculates SEO score for content

### Frontend

4. **`frontend/src/components/SeoScoreMeter.jsx`**
   - Circular progress meter with color-coded scores
   - Red < 50, Yellow 50-79, Green ≥ 80

5. **`frontend/src/components/SeoCheckList.jsx`**
   - Displays SEO checks with status indicators (good/ok/bad)
   - Color-coded borders and icons

6. **`frontend/src/pages/BlogEditor.jsx`** (updated)
   - Integrated SEO analysis with debounced API calls (1.5s delay)
   - Shows SEO score, checks, and content gap suggestions
   - Triggers analysis when title or primary keyword changes

## API Endpoints

### POST `/api/admin/seo/serp-analysis`
**Request:**
```json
{
  "keyword": "blog post ideas",
  "location": "United States" // optional
}
```

**Response:**
```json
{
  "success": true,
  "avgWordCount": 1200,
  "commonHeadings": ["introduction", "conclusion", "tips"],
  "contentGaps": ["FAQ section", "examples"],
  "serpTitles": ["Title 1", "Title 2", ...],
  "serpMetaPatterns": ["Meta 1", "Meta 2", ...]
}
```

### POST `/api/admin/seo/score`
**Request:**
```json
{
  "title": "Blog Post Title",
  "metaDescription": "Meta description text",
  "content": "Full blog content...",
  "slug": "blog-post-slug",
  "primaryKeyword": "blog post",
  "serpBenchmarks": { ... } // optional
}
```

**Response:**
```json
{
  "success": true,
  "score": 85,
  "checks": [
    {
      "label": "Title length is between 50-60 characters",
      "status": "good"
    },
    ...
  ]
}
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install jsdom
```

### 2. Configure API Keys
Add to `backend/.env`:
```
SERPAPI_KEY=your_serpapi_key_here
ZENSERP_API_KEY=your_zenserp_key_here  # optional fallback
```

**Get API Keys:**
- SerpAPI: https://serpapi.com (100 free searches/month)
- Zenserp: https://zenserp.com (optional fallback)

### 3. Usage

1. **Generate SEO Keyphrases**: Click "Generate SEO Title" button in BlogEditor
2. **Enter Title and Content**: Fill in the blog title and content
3. **Real-time Analysis**: SEO score and checks update automatically (1.5s debounce)
4. **View Recommendations**: See content gap suggestions based on top-ranking pages

## SEO Scoring Rules

- **Title Length**: 50-60 characters (optimal)
- **Meta Description**: 140-160 characters (optimal)
- **Primary Keyword**: Should appear in:
  - Title (15 points)
  - First paragraph (10 points)
  - Slug (10 points)
- **Content Length**: Compared to SERP average (15 points)
- **Keyword Density**: 0.5% - 2% (15 points)

## Features

✅ Real-time SERP analysis using live Google results
✅ Yoast-style SEO scoring with detailed checks
✅ Content gap analysis comparing to top-ranking pages
✅ Visual SEO meter with color-coded scores
✅ Debounced API calls to prevent excessive requests
✅ Fallback to Zenserp if SerpAPI fails
✅ Graceful error handling

## Notes

- SERP analysis requires a valid API key (SerpAPI or Zenserp)
- Analysis only runs when both title and primary keyword are set
- Debounce delay: 1.5 seconds after user stops typing
- Top 5 SERP results are analyzed for content structure
- SEO score is calculated even if SERP analysis fails (without benchmarks)

