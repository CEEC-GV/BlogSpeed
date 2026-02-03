import { useState } from "react";

/**
 * Google SERP Preview Component
 * Displays a live preview of how the blog post will appear in Google search results
 */
export default function SerpPreview({ title, slug, metaDescription, image }) {
  const [viewMode, setViewMode] = useState("desktop"); // "desktop" | "mobile"

  // Format URL from slug
  const formatUrl = (slug) => {
    if (!slug) return "example.com/blog/...";
    return `example.com/${slug}`;
  };

  // Truncate text for display
  const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  // Desktop preview
  const DesktopPreview = () => (
    <div className="border border-white/10 bg-white/5 backdrop-blur rounded-lg p-4 shadow-sm">
      {/* URL */}
      <div className="flex items-center mb-1">
        <span className="text-xs text-white/60">
          {formatUrl(slug)}
        </span>
        <svg className="w-3 h-3 ml-2 text-white/40" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>

      {/* Title */}
      <h3 className="text-xl text-purple-400 hover:underline cursor-pointer mb-1 leading-tight">
        {title || "Your blog post title will appear here"}
      </h3>

      {/* Meta Description */}
      <p className="text-sm text-white/70 leading-relaxed">
        {metaDescription || "Your meta description will appear here. This is what users see in search results."}
      </p>
    </div>
  );

  // Mobile preview
  const MobilePreview = () => (
    <div className="border border-white/10 bg-white/5 backdrop-blur rounded-lg p-3 shadow-sm max-w-sm">
      {/* URL */}
      <div className="flex items-center mb-1">
        <span className="text-xs text-white/60 truncate">
          {formatUrl(slug)}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base text-purple-400 hover:underline cursor-pointer mb-1 leading-tight line-clamp-2">
        {title || "Your blog post title will appear here"}
      </h3>

      {/* Meta Description */}
      <p className="text-xs text-white/70 leading-relaxed line-clamp-2">
        {truncateText(metaDescription || "Your meta description will appear here. This is what users see in search results.", 120)}
      </p>
    </div>
  );

  // Preview with image (Google sometimes shows images)
  const PreviewWithImage = () => {
    const PreviewContent = viewMode === "desktop" ? DesktopPreview : MobilePreview;
    
    return (
      <div className={`${viewMode === "desktop" ? "flex gap-4" : "flex flex-col gap-2"}`}>
        <div className="flex-1">
          <PreviewContent />
        </div>
        {image && (
          <div className={`${viewMode === "desktop" ? "flex-shrink-0" : "w-full"}`}>
            <div className={`${viewMode === "desktop" ? "w-32 h-24" : "w-full h-48"} rounded border border-white/10 overflow-hidden bg-white/5`}>
              <img
                src={image}
                alt="Preview"
                className={`${viewMode === "desktop" ? "w-32 h-24" : "w-full h-48"} object-cover`}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
          Google Search Preview
        </p>
        
        {/* Mobile/Desktop Toggle */}
        <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setViewMode("desktop")}
            className={`px-3 py-1.5 text-xs font-medium rounded transition ${
              viewMode === "desktop"
                ? "bg-white/20 text-white shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Desktop
            </span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("mobile")}
            className={`px-3 py-1.5 text-xs font-medium rounded transition ${
              viewMode === "mobile"
                ? "bg-white/20 text-white shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Mobile
            </span>
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        {image ? <PreviewWithImage /> : (viewMode === "desktop" ? <DesktopPreview /> : <MobilePreview />)}
      </div>

      {/* Character Counts */}
      <div className="flex items-center justify-between text-xs text-white/60 pt-2 border-t border-white/10">
        <div>
          <span className={title && title.length > 60 ? "text-red-400" : title && title.length >= 50 ? "text-green-400" : "text-white/60"}>
            Title: {title?.length || 0} / 60
          </span>
        </div>
        <div>
          <span className={metaDescription && metaDescription.length > 160 ? "text-red-400" : metaDescription && metaDescription.length >= 140 ? "text-green-400" : "text-white/60"}>
            Meta: {metaDescription?.length || 0} / 160
          </span>
        </div>
      </div>
    </div>
  );
}

