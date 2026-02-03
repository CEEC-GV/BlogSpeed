import { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function ContentGapAnalysis({ content, primaryKeyword }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!primaryKeyword || !content) {
      setAnalysis(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.post("/admin/ai/content-gaps", {
          content,
          primaryKeyword
        });

        if (res.data.success) {
          setAnalysis(res.data.analysis);
        }
      } catch (error) {
        console.error("Content gap analysis failed:", error);
      } finally {
        setLoading(false);
      }
    }, 2000); // Debounce 2 seconds

    return () => clearTimeout(timer);
  }, [content, primaryKeyword]);

  if (!primaryKeyword) {
    return null;
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
          <p className="text-sm text-white/60">Analyzing content gaps...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">
          📊 Competitive Content Analysis
        </p>
        {analysis.wordCount.status.includes("✅") ? (
          <span className="text-xs font-medium text-green-400 bg-green-500/20 px-2 py-1 rounded">
            Competitive
          </span>
        ) : (
          <span className="text-xs font-medium text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded">
            Needs Work
          </span>
        )}
      </div>

      {/* Word Count Comparison */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-white/70">Word Count</p>
          <p className="text-xs text-white/50">
            Target: {analysis.wordCount.serpAvg} words
          </p>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              analysis.wordCount.current >= analysis.wordCount.serpAvg
                ? "bg-green-500"
                : "bg-yellow-500"
            }`}
            style={{
              width: `${Math.min(
                (analysis.wordCount.current / analysis.wordCount.serpAvg) * 100,
                100
              )}%`
            }}
          />
        </div>
        <p className="text-xs text-white/60 mt-2">
          {analysis.wordCount.current} / {analysis.wordCount.serpAvg} words
          {analysis.wordCount.current < analysis.wordCount.serpAvg && (
            <span className="text-yellow-400 ml-2">
              ({analysis.wordCount.serpAvg - analysis.wordCount.current} words short)
            </span>
          )}
        </p>
      </div>

      {/* Section Coverage */}
      <div className="bg-white/5 rounded-lg p-4 border border-white/10">
        <p className="text-xs font-medium text-white/70 mb-2">
          Topic Coverage
        </p>
        <div className="flex items-center space-x-4">
          <div>
            <p className="text-2xl font-bold text-white">
              {analysis.coverage.yourSections}
            </p>
            <p className="text-xs text-white/50">Your sections</p>
          </div>
          <div className="text-white/30">/</div>
          <div>
            <p className="text-2xl font-bold text-white/70">
              {analysis.coverage.serpAvgSections}
            </p>
            <p className="text-xs text-white/50">SERP avg sections</p>
          </div>
        </div>
      </div>

      {/* Missing Topics */}
      {analysis.coverage.missingTopics.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <p className="text-xs font-medium text-yellow-400 mb-2">
            ⚠️ Missing Topics (found in top-ranking pages)
          </p>
          <ul className="space-y-1">
            {analysis.coverage.missingTopics.map((topic, index) => (
              <li
                key={index}
                className="text-xs text-yellow-300 flex items-start"
              >
                <span className="mr-2">•</span>
                <span className="capitalize">{topic}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-yellow-300/80 mt-3 italic">
            {analysis.recommendations}
          </p>
        </div>
      )}

      {/* Success State */}
      {analysis.coverage.missingTopics.length === 0 && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <p className="text-xs text-green-400">
            ✅ {analysis.recommendations}
          </p>
        </div>
      )}
    </div>
  );
}