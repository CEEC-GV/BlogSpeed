import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios.js";
import Button from "../components/Button.jsx";
import Loader from "../components/Loader.jsx";
import Input from "../components/Input.jsx";
import SeoScoreMeter from "../components/SeoScoreMeter.jsx";
import SeoCheckList from "../components/SeoCheckList.jsx";
import SerpPreview from "../components/SerpPreview.jsx";
import TrendingTopics from "../components/TrendsTopics.jsx";
import ContentGapAnalysis from "../components/ContentGapAnalysis.jsx";

const emptyForm = {
  title: "",
  content: "",
  excerpt: "",
  coverImage: "",
  category: "",
  author: "",
  status: "Draft"
};

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [seoInput, setSeoInput] = useState("");
  const [seoResults, setSeoResults] = useState([]);
  const [showSeoModal, setShowSeoModal] = useState(false);
  const [seoLoading, setSeoLoading] = useState(false);
  const [seoContentLoadingIndex, setSeoContentLoadingIndex] = useState(null);
  const [seoError, setSeoError] = useState("");
  const [regeneratingContent, setRegeneratingContent] = useState(false);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [trendingTopicContext, setTrendingTopicContext] = useState(null);
  
  // SEO state
  const [seoTitles, setSeoTitles] = useState([]);
  const [seoMetaDescriptions, setSeoMetaDescriptions] = useState([]);
  const [seoSlug, setSeoSlug] = useState("");
  const [seoKeyphrases, setSeoKeyphrases] = useState({ primary: "", secondary: [] });
  const [seoSerpInsights, setSeoSerpInsights] = useState(null);
  const [seoMode, setSeoMode] = useState("all");
  
  // Meta description generation state
  const [metaLoading, setMetaLoading] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("");
  
  // Real-time SEO analysis state
  const [seoScore, setSeoScore] = useState(0);
  const [seoChecks, setSeoChecks] = useState([]);
  const [serpBenchmarks, setSerpBenchmarks] = useState(null);
  const [analyzingSeo, setAnalyzingSeo] = useState(false);
  const seoAnalysisTimeoutRef = useRef(null);
  
  // Google Trends state
  const [showTrendingModal, setShowTrendingModal] = useState(false);
  const [trendsData, setTrendsData] = useState(null);

  // WordPress-style slug generation
  function generateSlug(text) {
    if (!text) return "";
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);
    api
      .get(`/admin/blogs/${id}`)
      .then((res) => {
        if (!isMounted) return;
        const title = res.data.title || "";
        setForm({
          title,
          content: res.data.content || "",
          excerpt: res.data.excerpt || "",
          coverImage: res.data.coverImage || "",
          category: res.data.category || "",
          author: res.data.author || "",
          status: res.data.status || "Draft"
        });
        setSeoSlug(res.data.slug || generateSlug(title));
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Unable to load blog.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    if (name === "title") {
      setSeoSlug(generateSlug(value));
    }
  };

  // Debounced SEO analysis when title or primary keyword changes
  useEffect(() => {
    if (seoAnalysisTimeoutRef.current) {
      clearTimeout(seoAnalysisTimeoutRef.current);
    }

    if (!form.title.trim() || !seoKeyphrases.primary.trim()) {
      setSeoScore(0);
      setSeoChecks([]);
      setSerpBenchmarks(null);
      return;
    }

    seoAnalysisTimeoutRef.current = setTimeout(async () => {
      setAnalyzingSeo(true);
      
      try {
        const serpRes = await api.post("/admin/seo/serp-analysis", {
          keyword: seoKeyphrases.primary,
          location: "United States"
        });

        if (serpRes.data.success) {
          const benchmarks = {
            avgWordCount: serpRes.data.avgWordCount || 0,
            commonHeadings: serpRes.data.commonHeadings || [],
            contentGaps: serpRes.data.contentGaps || [],
            serpTitles: serpRes.data.serpTitles || [],
            serpMetaPatterns: serpRes.data.serpMetaPatterns || []
          };
          setSerpBenchmarks(benchmarks);

          const scoreRes = await api.post("/admin/seo/score", {
            title: form.title,
            metaDescription: form.excerpt,
            content: form.content,
            slug: seoSlug || generateSlug(form.title),
            primaryKeyword: seoKeyphrases.primary,
            serpBenchmarks: benchmarks
          });

          if (scoreRes.data.success) {
            setSeoScore(scoreRes.data.score || 0);
            setSeoChecks(scoreRes.data.checks || []);
          }
        }
      } catch (error) {
        console.error("SEO Analysis Error:", error);
        try {
          const scoreRes = await api.post("/admin/seo/score", {
            title: form.title,
            metaDescription: form.excerpt,
            content: form.content,
            slug: seoSlug || generateSlug(form.title),
            primaryKeyword: seoKeyphrases.primary,
            serpBenchmarks: null
          });

          if (scoreRes.data.success) {
            setSeoScore(scoreRes.data.score || 0);
            setSeoChecks(scoreRes.data.checks || []);
          }
        } catch (scoreError) {
          console.error("SEO Score Calculation Error:", scoreError);
        }
      } finally {
        setAnalyzingSeo(false);
      }
    }, 1500);

    return () => {
      if (seoAnalysisTimeoutRef.current) {
        clearTimeout(seoAnalysisTimeoutRef.current);
      }
    };
  }, [form.title, form.excerpt, form.content, seoSlug, seoKeyphrases.primary]);

  const validateForm = () => {
    if (
      !form.title.trim() ||
      !form.category.trim() ||
      !form.author.trim() ||
      !form.coverImage.trim() ||
      !form.content.trim()
    ) {
      setError("Please fill out all required fields before saving.");
      return false;
    }
    return true;
  };

  const autoGenerateSeoFromTitle = async (title) => {
    if (!title || !title.trim()) return null;

    try {
      const res = await api.post("/admin/blogs/ai/titles", {
        input: title
      });

      if (res.data.success && res.data.titles && res.data.metaDescriptions) {
        return {
          metaDescription: res.data.metaDescriptions[0] || null,
          keyphrases: res.data.keyphrases || null,
          slug: res.data.slug || null
        };
      }
    } catch (err) {
      console.error("Auto-SEO generation failed:", err);
    }
    return null;
  };

  const saveBlog = async (statusOverride) => {
    setError("");

    if (!validateForm()) return;

    setSaving(true);

    try {
      let updatedExcerpt = form.excerpt;
      let updatedSlug = seoSlug || generateSlug(form.title);
      let updatedKeyphrases = seoKeyphrases;

      if (!form.excerpt || !seoKeyphrases?.primary) {
        const seoData = await autoGenerateSeoFromTitle(form.title);
        if (seoData) {
          if (seoData.metaDescription && !form.excerpt) {
            updatedExcerpt = seoData.metaDescription;
            setForm((prev) => ({
              ...prev,
              excerpt: seoData.metaDescription
            }));
          }

          if (seoData.slug) {
            updatedSlug = seoData.slug;
            setSeoSlug(seoData.slug);
          }
          if (seoData.keyphrases) {
            updatedKeyphrases = seoData.keyphrases;
            setSeoKeyphrases(seoData.keyphrases);
          }
        }
      }

      const payload = {
        ...form,
        excerpt: updatedExcerpt,
        status: statusOverride || form.status,
        slug: updatedSlug,
        primaryKeyphrase: updatedKeyphrases?.primary || "",
        secondaryKeyphrases: updatedKeyphrases?.secondary || []
      };

      if (id) {
        await api.put(`/admin/blogs/${id}`, payload);
      } else {
        await api.post("/admin/blogs", payload);
      }

      setSuccessMessage(
        statusOverride === "Published"
          ? "Blog published successfully."
          : "Draft saved successfully."
      );

      setTimeout(() => {
        navigate("/admin");
      }, 1200);

    } catch (err) {
      console.error("Save Blog Error:", err);
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors.map(e => `${e.field}: ${e.message}`).join(", ");
        setError(`Validation error: ${errorMessages}`);
      } else {
        setError(err.response?.data?.message || "Unable to save blog. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    saveBlog();
  };

  const handleGenerateSeo = async (regenerate = false, trendKeyword = null) => {
    const inputKeyword = trendKeyword || seoInput;
    
    if (!inputKeyword.trim()) return;

    setSeoLoading(true);
    setSeoError("");
    setSelectedTitle("");
    setSeoMetaDescriptions([]);

    try {
      const res = await api.post("/admin/blogs/ai/titles", {
        input: regenerate ? `${inputKeyword}\n\nGenerate more creative titles.` : inputKeyword,
        force: regenerate,
        useRelatedQueries: !!trendKeyword,
        geo: "US"
      });

      if (!res.data.success) {
        throw new Error(res.data.message || "Invalid response from server");
      }

      if (res.data.titles) {
        setSeoTitles(res.data.titles);
        setSeoSlug(res.data.slug || "");
        setSeoKeyphrases(res.data.keyphrases || { primary: "", secondary: [] });
        setSeoSerpInsights(res.data.serpInsights || null);
        
        if (res.data.trendsData) {
          setTrendsData(res.data.trendsData);
        }
        
        setSeoResults(res.data.data || []);
      } else if (Array.isArray(res.data.data)) {
        setSeoResults(res.data.data);
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      console.error("SEO Generation Error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Unable to generate SEO titles.";
      setSeoError(errorMsg);
    } finally {
      setSeoLoading(false);
    }
  };

  const handleTrendSelection = (trendData) => {
    console.log("Selected Trend:", trendData);
    
    setSeoTitles(trendData.titles || []);
    setSeoSlug(trendData.slug || "");
    setSeoKeyphrases(trendData.keyphrases || { primary: "", secondary: [] });
    setSeoSerpInsights(trendData.serpInsights || null);
    setSeoInput(trendData.keyword);
    setTrendsData(trendData.trendsData);
    setTrendingTopicContext(trendData.trendingTopic);
    
    setShowTrendingModal(false);
    setShowSeoModal(true);
    setSeoMode("title");
  };

  const handleSelectTitle = async (title) => {
    setForm((prev) => ({ ...prev, title }));
    setSeoSlug(generateSlug(title));
    setSelectedTitle(title);
    
    setMetaLoading(true);
    setSeoError("");

    try {
      const res = await api.post("/admin/blogs/ai/meta", { title, force: true });
      
      if (res.data.success && res.data.metaDescriptions) {
        setSeoMetaDescriptions(res.data.metaDescriptions);
      } else {
        throw new Error(res.data.message || "Failed to generate meta descriptions");
      }
    } catch (err) {
      console.error("Meta Description Generation Error:", err);
      setSeoError(err.response?.data?.message || err.message || "Unable to generate meta descriptions.");
    } finally {
      setMetaLoading(false);
    }
  };

  const handleSelectMetaDescription = (metaDescription) => {
    setForm((prev) => ({ ...prev, excerpt: metaDescription }));
  };

  const handleGenerateContent = async (item, index) => {
    if (!item?.title || !Array.isArray(item?.keywords)) return;

    setSeoContentLoadingIndex(index);
    setSeoError("");

    try {
      const res = await api.post("/admin/blogs/ai/content", {
        title: item.title,
        keywords: item.keywords,
        originalInput: seoInput,
        force: true
      });

      const payload = res.data?.data;
      if (payload?.title && payload?.excerpt && payload?.content) {
        setForm((prev) => ({
          ...prev,
          title: payload.title,
          excerpt: payload.excerpt,
          content: payload.content
        }));
        setSeoSlug(generateSlug(payload.title));
        setShowSeoModal(false);
      }
    } catch (err) {
      console.error("Content Generation Error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Unable to generate blog content.";
      setSeoError(errorMsg);
    } finally {
      setSeoContentLoadingIndex(null);
    }
  };

  const handleGenerateContentFromTitle = async () => {
    if (!form.title.trim()) {
      setError("Please enter a title first.");
      return;
    }

    setGeneratingContent(true);
    setError("");

    try {
      const keywords = seoKeyphrases?.primary
        ? [seoKeyphrases.primary, ...(seoKeyphrases.secondary || [])]
        : [form.title];

      const res = await api.post("/admin/blogs/ai/content", {
        title: form.title,
        keywords,
        originalInput: form.title,
        force: true,
        serpInsights: seoSerpInsights,
        relatedQueries: trendsData?.relatedQueries || [],
        recommendedSections: seoSerpInsights?.recommendedSections || []
      });

      const payload = res.data?.data;

      if (payload?.content) {
        setForm((prev) => ({
          ...prev,
          content: payload.content,
          excerpt: payload.excerpt || prev.excerpt,
        }));
        setSuccessMessage("Content generated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error("Content Generation Error:", err);
      setError(err.response?.data?.message || err.message || "Unable to generate content.");
    } finally {
      setGeneratingContent(false);
    }
  };

  const handleRegenerateContentDirectly = async () => {
    if (!form.title.trim()) {
      setError("Please enter a title first.");
      return;
    }

    setRegeneratingContent(true);
    setError("");

    try {
      const titlesRes = await api.post("/admin/blogs/ai/titles", {
        input: form.title
      });

      if (!titlesRes.data.success || !Array.isArray(titlesRes.data.data) || titlesRes.data.data.length === 0) {
        throw new Error("Unable to generate SEO keywords for the title.");
      }

      const firstResult = titlesRes.data.data[0];
      
      const contentRes = await api.post("/admin/blogs/ai/content", {
        title: form.title,
        keywords: firstResult.keywords,
        originalInput: form.title,
        force: true
      });

      const payload = contentRes.data?.data;
      if (payload?.excerpt && payload?.content) {
        setForm((prev) => ({
          ...prev,
          excerpt: payload.excerpt,
          content: payload.content
        }));
        setSuccessMessage("Content regenerated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error("Direct Content Generation Error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Unable to regenerate content.";
      setError(errorMsg);
    } finally {
      setRegeneratingContent(false);
    }
  };

  const isPublished = form.status === "Published";

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen text-white">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {id ? "Edit Blog" : "Create New Blog"}
          </h1>
          <p className="text-sm text-white/60">
            {id ? "Make changes to your existing post" : "Write and publish a new blog post"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Section */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-white">
                Title <span className="text-red-400">*</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowTrendingModal(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-black bg-gradient-to-r from-[#ffde59] to-[#ff914d] rounded-lg hover:from-[#ffd700] hover:to-[#ff8c3a] transition"
                >
                  <span>🔥</span>
                  Trending Topics
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setSeoMode("title");
                    setShowSeoModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white/70 bg-white/10 rounded-lg hover:bg-white/20 border border-white/10 transition"
                >
                  <span>✨</span>
                  Generate Title
                </button>
              </div>
            </div>

            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Enter your blog post title..."
              className="w-full text-2xl font-semibold text-white placeholder-white/40 border-0 focus:ring-0 p-0 bg-transparent"
            />
          </div>

          {/* Basic Information */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <h3 className="text-sm font-medium text-white mb-4">Basic Information</h3>
            
            <div className="grid gap-4 md:grid-cols-2 mb-4">
              <div>
                <label className="block text-xs font-medium text-white/80 mb-2">
                  Category <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="category"
                  list="category-options"
                  placeholder="Design, Product, Engineering..."
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-white/10 bg-white/5 backdrop-blur rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffde59]/50 focus:border-white/20 text-white placeholder-white/40 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/80 mb-2">
                  Author <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="author"
                  placeholder="Author name"
                  value={form.author}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-sm border border-white/10 bg-white/5 backdrop-blur rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffde59]/50 focus:border-white/20 text-white placeholder-white/40 transition"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-white/80 mb-2">
                Cover Image URL <span className="text-red-400">*</span>
              </label>
              <input
                type="url"
                name="coverImage"
                placeholder="https://images.unsplash.com/..."
                value={form.coverImage}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm border border-white/10 bg-white/5 backdrop-blur rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffde59]/50 focus:border-white/20 text-white placeholder-white/40 transition"
              />
            </div>
            
            {form.coverImage && (
              <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                <img
                  src={form.coverImage}
                  alt="Cover preview"
                  className="h-48 w-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            )}
          </div>
          
          <datalist id="category-options">
            <option value="Design" />
            <option value="Product" />
            <option value="Engineering" />
            <option value="Business" />
            <option value="Marketing" />
            <option value="Research" />
          </datalist>

          {/* Meta Description */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-white">
                Meta Description
              </label>

              <button
                type="button"
                onClick={async () => {
                  setSeoMode("meta");
                  setShowSeoModal(true);
                  
                  if (form.title.trim()) {
                    setSelectedTitle(form.title);
                    setSeoMetaDescriptions([]);
                    setMetaLoading(true);
                    setSeoError("");
                    
                    try {
                      const res = await api.post("/admin/blogs/ai/meta", { title: form.title, force: true });
                      if (res.data.success && res.data.metaDescriptions) {
                        setSeoMetaDescriptions(res.data.metaDescriptions);
                      }
                    } catch (err) {
                      setSeoError(err.response?.data?.message || "Unable to generate meta descriptions.");
                    } finally {
                      setMetaLoading(false);
                    }
                  }
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white/70 bg-white/10 rounded-lg hover:bg-white/20 border border-white/10 transition"
              >
                <span>✨</span>
                Generate
              </button>
            </div>

            <textarea
              name="excerpt"
              rows="3"
              value={form.excerpt}
              onChange={handleChange}
              placeholder="A brief description that appears in search results..."
              className="w-full px-3 py-2 text-sm border border-white/10 bg-white/5 backdrop-blur rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffde59]/50 focus:border-white/20 text-white placeholder-white/40 resize-none transition"
            />

            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-white/60">
                Optimal length: 140-160 characters
              </p>
              <p className={`text-xs font-medium ${
                form.excerpt.length > 160
                  ? "text-red-400"
                  : form.excerpt.length > 140
                  ? "text-green-400"
                  : "text-white/60"
              }`}>
                {form.excerpt.length} / 160
              </p>
            </div>
          </div>

          {/* SERP Insights */}
          {seoSerpInsights && seoSerpInsights.recommendedSections?.length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-white mb-1">
                    SERP Insights
                  </h3>
                  <p className="text-xs text-white/60">
                    Based on top-ranking pages for "{seoKeyphrases.primary}"
                  </p>
                </div>
                
                {seoSerpInsights.targetWordCount && (
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      {seoSerpInsights.targetWordCount}
                    </p>
                    <p className="text-xs text-white/60">words</p>
                  </div>
                )}
              </div>

              {seoSerpInsights.contentAngle && (
                <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-xs text-white/60 mb-1">Content Angle</p>
                  <p className="text-sm font-medium text-white capitalize">
                    {seoSerpInsights.contentAngle}
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-medium text-white">
                    Recommended Sections ({seoSerpInsights.recommendedSections.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const sections = seoSerpInsights.recommendedSections.join('\n');
                      navigator.clipboard.writeText(sections);
                      setSuccessMessage("Sections copied!");
                      setTimeout(() => setSuccessMessage(""), 2000);
                    }}
                    className="text-xs text-white/60 hover:text-white font-medium transition"
                  >
                    Copy All
                  </button>
                </div>
                
                <div className="space-y-2">
                  {seoSerpInsights.recommendedSections.map((section, index) => (
                    <div
                      key={index}
                      className="group flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </span>
                      <p className="flex-1 text-xs font-medium text-gray-400 capitalize">
                        {section}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const markdown = `\n\n## ${section}\n\n`;
                          setForm(prev => ({
                            ...prev,
                            content: prev.content + markdown
                          }));
                          setSuccessMessage(`Added "${section}"`);
                          setTimeout(() => setSuccessMessage(""), 2000);
                        }}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition text-xs text-gray-600 hover:text-gray-900 font-medium"
                      >
                        Insert →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Content Editor */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="text-sm font-medium text-white block mb-1">
                  Content <span className="text-red-400">*</span>
                </label>
                {form.content && (
                  <p className="text-xs text-white/60">
                    {form.content.split(/\s+/).filter(w => w.length > 0).length} words
                    {seoSerpInsights?.targetWordCount && (
                      <span className={`ml-1 font-medium ${
                        form.content.split(/\s+/).filter(w => w.length > 0).length >= seoSerpInsights.targetWordCount * 0.9
                          ? 'text-green-400'
                          : 'text-yellow-400'
                      }`}>
                        / {seoSerpInsights.targetWordCount}
                      </span>
                    )}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {seoSerpInsights?.recommendedSections?.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const outline = seoSerpInsights.recommendedSections
                        .map(section => `## ${section}\n\n[Add content here]\n`)
                        .join('\n');
                      setForm(prev => ({
                        ...prev,
                        content: outline
                      }));
                      setSuccessMessage("Outline generated!");
                      setTimeout(() => setSuccessMessage(""), 2000);
                    }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-black bg-[#ffde59] rounded-lg hover:bg-[#ffd700] transition"
                  >
                    <span>📝</span>
                    Outline
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={handleGenerateContentFromTitle}
                  disabled={generatingContent || !form.title.trim()}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingContent ? (
                    <>
                      <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <span>✨</span>
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>

            <textarea
              name="content"
              rows="16"
              value={form.content}
              onChange={handleChange}
              required
              placeholder="Start writing your content here... or use 'Generate Content' to auto-create based on SERP insights"
              className="w-full px-3 py-2 text-sm border border-white/10 bg-white/5 backdrop-blur rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffde59]/50 focus:border-white/20 text-white placeholder-white/40 resize-none font-mono transition"
            />
            
            {seoSerpInsights && (
              <p className="text-xs text-[#ffde59] mt-2">
                💡 Use the recommended sections above to structure your content for better SEO
              </p>
            )}
          </div>

          {/* Content Gap Analysis */}
          {seoKeyphrases.primary && form.content && (
            <ContentGapAnalysis
              content={form.content}
              primaryKeyword={seoKeyphrases.primary}
            />
          )}

          {/* SEO Information */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <h3 className="text-sm font-medium text-white mb-4">SEO Information</h3>
            
            {(seoKeyphrases.primary || seoKeyphrases.secondary?.length > 0) && (
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-2">
                    Primary Keyphrase
                  </label>
                  <input
                    type="text"
                    value={seoKeyphrases.primary}
                    readOnly
                    className="w-full px-3 py-2 text-sm border border-white/10 bg-white/10 rounded-lg text-white/70"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/80 mb-2">
                    Secondary Keyphrases
                  </label>
                  <input
                    type="text"
                    value={seoKeyphrases.secondary?.join(", ") || ""}
                    readOnly
                    className="w-full px-3 py-2 text-sm border border-white/10 bg-white/10 rounded-lg text-white/70"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-white/80 mb-2">
                URL Slug
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60">example.com/</span>
                <input
                  type="text"
                  value={seoSlug || generateSlug(form.title)}
                  onChange={(e) => setSeoSlug(e.target.value)}
                  placeholder="auto-generated-from-title"
                  className="flex-1 px-3 py-2 text-sm border border-white/10 bg-white/5 backdrop-blur rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffde59]/50 focus:border-white/20 text-white placeholder-white/40 transition"
                />
              </div>
            </div>

            {/* Real-time SEO Analysis */}
            {seoKeyphrases.primary && form.title && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-400">
                    SEO Analysis
                  </h4>
                  {analyzingSeo && (
                    <span className="text-xs text-gray-500 flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                      Analyzing...
                    </span>
                  )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="flex justify-center">
                    <SeoScoreMeter score={seoScore} size={120} />
                  </div>

                  <div>
                    <SeoCheckList checks={seoChecks} />
                  </div>
                </div>

                {serpBenchmarks && serpBenchmarks.contentGaps && serpBenchmarks.contentGaps.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h5 className="text-xs font-medium text-gray-900 mb-3">
                      Content Gap Suggestions
                    </h5>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-xs text-gray-600 mb-2">
                        Top-ranking pages include sections on:
                      </p>
                      <ul className="space-y-1">
                        {serpBenchmarks.contentGaps.slice(0, 5).map((gap, index) => (
                          <li key={index} className="text-xs text-gray-700 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-blue-600"></span>
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {serpBenchmarks && serpBenchmarks.avgWordCount > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500">
                      SERP Average: <span className="font-medium text-gray-900">{serpBenchmarks.avgWordCount}</span> words
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SERP Preview */}
          <SerpPreview
            title={form.title}
            slug={seoSlug || generateSlug(form.title)}
            metaDescription={form.excerpt}
            image={form.coverImage}
          />

          {/* Publish Status */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-white">Publish Status</h3>
                <p className="text-xs text-white/60 mt-1">
                  {isPublished ? "Live and visible to readers" : "Saved as draft"}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    status: prev.status === "Published" ? "Draft" : "Published"
                  }))
                }
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  isPublished ? "bg-green-600" : "bg-white/10 border border-white/20"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                    isPublished ? "translate-x-7" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => saveBlog("Draft")}
              disabled={saving}
              className="px-5 py-2.5 text-sm font-medium text-white/70 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Draft"}
            </button>
            <button
              type="button"
              onClick={() => setShowPublishConfirm(true)}
              disabled={saving}
              className="px-5 py-2.5 text-sm font-medium text-black bg-gradient-to-r from-[#ffde59] to-[#ff914d] rounded-lg hover:from-[#ffd700] hover:to-[#ff8c3a] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Publish
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="px-5 py-2.5 text-sm font-medium text-white/60 hover:text-white transition"
            >
              Cancel
            </button>
          </div>
        </form>

      {/* Trending Topics Modal */}
      {showTrendingModal && (
        <TrendingTopics
          onSelectTrend={handleTrendSelection}
          onClose={() => setShowTrendingModal(false)}
        />
      )}

      {/* Publish Confirmation Modal */}
      {showPublishConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-2">
              Publish this blog?
            </h3>
            <p className="text-sm text-white/60 mb-6">
              This blog will be visible to all readers on your website.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPublishConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowPublishConfirm(false);
                  saveBlog("Published");
                }}
                className="px-4 py-2 text-sm font-medium text-black bg-gradient-to-r from-[#ffde59] to-[#ff914d] rounded-lg hover:from-[#ffd700] hover:to-[#ff8c3a] transition"
              >
                Publish Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message Toast */}
      {successMessage && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg">
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {/* SEO Modal */}
      {showSeoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl shadow-xl overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">
                {seoMode === "title" && "Generate SEO Titles"}
                {seoMode === "meta" && "Generate Meta Descriptions"}
                {seoMode === "keyphrase" && "Generate Keyphrases"}
                {seoMode === "all" && "AI SEO Generator"}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {trendingTopicContext && (
                <div className="bg-gradient-to-r from-[#ffde59]/20 to-[#ff914d]/20 border border-[#ffde59]/30 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📈</span>
                    <div>
                      <p className="text-xs font-medium text-[#ffde59]">
                        Broader Trending Topic
                      </p>
                      <p className="text-sm font-semibold text-[#ffde59]">
                        {trendingTopicContext}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {trendsData && trendsData.relatedQueries?.length > 0 && (
                <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🔥</span>
                    <p className="text-sm font-medium text-orange-300">
                      Using Google Trends Data
                    </p>
                  </div>
                  <p className="text-xs text-orange-200 mb-3">
                    Optimized for: <span className="font-semibold">{seoInput}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {trendsData.relatedQueries.slice(0, 5).map((query, index) => (
                      <span
                        key={index}
                        className="text-xs bg-white/10 text-orange-200 px-2 py-1 rounded-lg border border-orange-500/30"
                      >
                        {query}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-white/80 mb-2">
                  Idea or Keyword
                </label>
                <input
                  type="text"
                  value={seoInput}
                  onChange={(e) => setSeoInput(e.target.value)}
                  placeholder="e.g. product onboarding"
                  className="w-full px-3 py-2 text-sm border border-white/10 bg-white/5 backdrop-blur rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffde59]/50 focus:border-white/20 text-white placeholder-white/40 transition"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleGenerateSeo()}
                  disabled={seoLoading}
                  className="px-4 py-2 text-sm font-medium text-black bg-[#ffde59] rounded-lg hover:bg-[#ffd700] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {seoLoading ? "Generating..." : "Generate"}
                </button>

                {seoResults.length > 0 && (
                  <button
                    onClick={() => handleGenerateSeo(true)}
                    className="px-4 py-2 text-sm font-medium text-white/70 bg-white/10 border border-white/10 rounded-lg hover:bg-white/20 transition"
                  >
                    Regenerate
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowSeoModal(false);
                    setSeoMode("all");
                    setSelectedTitle("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition"
                >
                  Close
                </button>
              </div>

              {seoError && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <p className="text-sm text-red-300">{seoError}</p>
                </div>
              )}

              {(seoTitles.length > 0 || seoResults.length > 0) && (
                <div className="space-y-4">
                  {/* Titles Selection */}
                  {seoTitles.length > 0 && (seoMode === "title" || seoMode === "all") && (
                    <div>
                      <h4 className="text-sm font-medium text-white mb-3">Select Title</h4>
                      <div className="space-y-2">
                        {seoTitles.map((title, index) => (
                          <button
                            key={index}
                            onClick={() => handleSelectTitle(title)}
                            className="w-full text-left rounded-lg border border-white/10 bg-white/5 p-4 hover:border-white/20 hover:bg-white/10 transition"
                          >
                            <p className="text-sm font-medium text-white mb-1">{title}</p>
                            <p className="text-xs text-white/60">{title.length} characters</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meta Descriptions Selection */}
                  {(seoMode === "title" || seoMode === "all" || seoMode === "meta") && selectedTitle && (
                    <div>
                      <h4 className="text-sm font-medium text-white mb-1">Meta Descriptions</h4>
                      <p className="text-xs text-white/60 mb-3">
                        For: <span className="font-medium text-white/80">"{selectedTitle}"</span>
                      </p>
                      
                      {metaLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                          <span className="ml-3 text-sm text-white/60">Generating...</span>
                        </div>
                      ) : seoMetaDescriptions.length > 0 ? (
                        <div className="space-y-2">
                          {seoMetaDescriptions.map((desc, index) => (
                            <button
                              key={index}
                              onClick={() => handleSelectMetaDescription(desc)}
                              className="w-full text-left rounded-lg border border-white/10 bg-white/5 p-4 hover:border-white/20 hover:bg-white/10 transition"
                            >
                              <p className="text-sm text-white mb-1">{desc}</p>
                              <p className="text-xs text-white/60">{desc.length} / 160 characters</p>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Keyphrases Display */}
                  {(seoKeyphrases.primary || seoKeyphrases.secondary?.length > 0) &&
                    (seoMode === "keyphrase" || seoMode === "all") && (
                    <div>
                      <h4 className="text-sm font-medium text-white mb-3">Keyphrases</h4>
                      <div className="space-y-3">
                        {seoKeyphrases.primary && (
                          <div>
                            <p className="text-xs text-white/60 mb-1">Primary</p>
                            <input
                              type="text"
                              value={seoKeyphrases.primary}
                              readOnly
                              className="w-full px-3 py-2 text-sm border border-white/10 bg-white/10 rounded-lg text-white/70"
                            />
                          </div>
                        )}
                        {seoKeyphrases.secondary?.length > 0 && (
                          <div>
                            <p className="text-xs text-white/60 mb-1">Secondary</p>
                            <input
                              type="text"
                              value={seoKeyphrases.secondary.join(", ")}
                              readOnly
                              className="w-full px-3 py-2 text-sm border border-white/10 bg-white/10 rounded-lg text-white/70"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* SEO Slug */}
                  {seoSlug && (
                    <div>
                      <h4 className="text-sm font-medium text-white mb-3">SEO Slug</h4>
                      <input
                        type="text"
                        value={seoSlug}
                        onChange={(e) => setSeoSlug(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-white/10 bg-white/5 backdrop-blur rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ffde59]/50 focus:border-white/20 text-white placeholder-white/40 transition"
                        placeholder="seo-friendly-url-slug"
                      />
                    </div>
                  )}

                  {/* SERP Insights */}
                  {seoSerpInsights && (
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">SERP Insights</h4>
                      <p className="text-xs text-white/70 mb-3">{seoSerpInsights.contentAngle}</p>
                      {seoSerpInsights.recommendedSections?.length > 0 && (
                        <div>
                          <p className="text-xs text-white/60 mb-2">Recommended Sections:</p>
                          <ul className="space-y-1">
                            {seoSerpInsights.recommendedSections.map((section, index) => (
                              <li key={index} className="text-xs text-white/70 flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-white/40"></span>
                                {section}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}