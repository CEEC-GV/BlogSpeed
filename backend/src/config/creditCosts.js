/**
 * Credit costs for AI features
 * These are constants - DO NOT hardcode in controllers
 */

export const CREDIT_COSTS = {
  // SEO Title generation
  TITLE_GENERATION: 1,

  // Meta description generation
  META_DESCRIPTION: 1,

  // Full blog content generation
  CONTENT_GENERATION: 2,

  // Content gap analysis
  CONTENT_GAP_ANALYSIS: 3,

  // SERP analysis
  SERP_ANALYSIS: 0 // Free
};

/**
 * Feature names for transaction logging
 */
export const FEATURE_NAMES = {
  [CREDIT_COSTS.TITLE_GENERATION]: 'seo_title',
  [CREDIT_COSTS.META_DESCRIPTION]: 'meta_description',
  [CREDIT_COSTS.CONTENT_GENERATION]: 'blog_content',
  [CREDIT_COSTS.CONTENT_GAP_ANALYSIS]: 'content_gap_analysis',
  [CREDIT_COSTS.SERP_ANALYSIS]: 'serp_analysis'
};

export default CREDIT_COSTS;
