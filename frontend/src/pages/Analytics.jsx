import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Eye, Users, TrendingUp, Globe } from "lucide-react";
import api from "../api/axios.js";

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");
  
  // Data states
  const [overview, setOverview] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [blogAnalytics, setBlogAnalytics] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, [period]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch overview
      const overviewRes = await api.get("/admin/analytics/overview");
      setOverview(overviewRes.data);

      // Fetch blogs with analytics
      const blogsRes = await api.get("/admin/analytics/blogs");
      setBlogs(blogsRes.data);

      const companyRes = await api.get("/admin/settings");
      setCompanyInfo(companyRes.data.data);

    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlogDetails = async (blogId) => {
    try {
      const res = await api.get(`/admin/analytics/blogs/${blogId}/analytics`);
      setBlogAnalytics(res.data);
      setSelectedBlog(blogId);
    } catch (err) {
      console.error("Fetch blog analytics error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-sm text-white/60">
            Track blog performance and visitor insights
          </p>
        </div>

        <div className="my-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Company Details</h2>
            <p className="text-sm text-white/50 mt-1">
              Update basic information shown across the platform
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {/* Company Name */}
              <div className="space-y-2">
                <label className="text-sm text-white/70">Company Name</label>
                <input
                  type="text"
                  placeholder="Eg. Tabzy Technologies"
                  value={companyInfo?.companyName || ""}
                  onChange={(e) =>
                    setCompanyInfo({ ...companyInfo, companyName: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white
                            placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                />
              </div>

              {/* Company Link */}
              <div className="space-y-2">
                <label className="text-sm text-white/70">Company Website</label>
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={companyInfo?.companyLink || ""}
                  onChange={(e) =>
                    setCompanyInfo({ ...companyInfo, companyLink: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white
                            placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={async () => {
                    try {
                      await api.put("/admin/settings/company", {
                        companyName: companyInfo.companyName,
                        companyLink: companyInfo.companyLink,
                      });
                    } catch (err) {
                      console.error("Update company info error:", err);
                      
                    }
                  }}
                  className="mt-8 w-full h-9 px-3
                            bg-blue-500/15 border border-blue-500/25 rounded-md
                            text-xs font-medium text-blue-400
                            hover:bg-blue-500/25 hover:border-blue-500/40
                            active:scale-[0.98] transition"
                >
                  Save Changes
                </button>
              </div>

            </div>
          </div>
        </div>

          

        {/* Overall Summary Cards */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-white/60">Total Blogs</p>
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">
              {overview?.summary?.totalBlogs || 0}
            </p>
            <p className="text-xs text-white/60 mt-1">Published posts</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-white/60">Total Views</p>
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">
              {overview?.summary?.totalViews?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-white/60 mt-1">All time</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-white/60">Unique Visitors</p>
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">
              {overview?.summary?.totalUnique?.toLocaleString() || 0}
            </p>
            <p className="text-xs text-white/60 mt-1">Unique readers</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-white/60">Avg per Blog</p>
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">
              {overview?.summary?.totalBlogs > 0
                ? Math.round(overview.summary.totalViews / overview.summary.totalBlogs)
                : 0}
            </p>
            <p className="text-xs text-white/60 mt-1">Views per post</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-1">
          {/* Left Column - Top Blogs */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Top Performing Blogs
              </h2>
              <span className="text-xs text-white/60">
                {blogs.length} total
              </span>
            </div>

            <div className="space-y-2">
              {overview?.topBlogs?.slice(0, 10).map((blog, index) => (
                <div
                  key={blog.id}
                  onClick={() => fetchBlogDetails(blog.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition border ${
                    selectedBlog === blog.id
                      ? "bg-purple-500/20 border-purple-500/30"
                      : "hover:bg-white/5 border-white/5"
                  }`}
                >
                  {/* Rank */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0
                      ? "bg-yellow-500/20 text-yellow-300"
                      : index === 1
                      ? "bg-gray-500/20 text-gray-300"
                      : index === 2
                      ? "bg-orange-500/20 text-orange-300"
                      : "bg-white/10 text-white/70"
                  }`}>
                    {index + 1}
                  </div>

                  {/* Blog Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {blog.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-white/60">
                        {blog.category}
                      </span>
                      <span className="text-xs text-white/40">•</span>
                      <span className={`text-xs px-2 py-0.5 rounded border ${
                        blog.status === "Published"
                          ? "bg-green-500/20 text-green-300 border-green-500/30"
                          : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                      }`}>
                        {blog.status}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-bold text-white">
                      {blog.views.toLocaleString()}
                    </p>
                    <p className="text-xs text-white/60">views</p>
                  </div>

                  {/* View Details Button */}
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Blog Details */}
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            {blogAnalytics ? (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-white mb-1 truncate">
                      {blogAnalytics.blogTitle}
                    </h2>
                    <p className="text-xs text-white/60">
                      Last viewed: {blogAnalytics.lastViewed 
                        ? new Date(blogAnalytics.lastViewed).toLocaleDateString()
                        : "Never"}
                    </p>
                  </div>
                </div>

                {/* Blog-specific stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-2xl font-bold text-white">
                      {blogAnalytics.totalViews.toLocaleString()}
                    </p>
                    <p className="text-xs text-white/60 mt-1">Total Views</p>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                    <p className="text-2xl font-bold text-white">
                      {blogAnalytics.uniqueViews.toLocaleString()}
                    </p>
                    <p className="text-xs text-white/60 mt-1">Unique Visitors</p>
                  </div>
                </div>

                {/* Daily Views Chart */}
                {blogAnalytics.dailyViews && blogAnalytics.dailyViews.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-white mb-3">
                      Views (Last 30 Days)
                    </h3>
                    <div className="space-y-2">
                      {blogAnalytics.dailyViews.slice(-7).map((day, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs text-white/60 w-20">
                            {new Date(day.date).toLocaleDateString("en-US", { 
                              month: "short", 
                              day: "numeric" 
                            })}
                          </span>
                          <div className="flex-1 bg-white/5 rounded-full h-6 overflow-hidden border border-white/10">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full flex items-center justify-end pr-2"
                              style={{
                                width: `${Math.max((day.views / Math.max(...blogAnalytics.dailyViews.map(d => d.views))) * 100, 5)}%`
                              }}
                            >
                              <span className="text-xs font-medium text-white">
                                {day.views}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Countries */}
                {blogAnalytics.viewsByCountry && blogAnalytics.viewsByCountry.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3">
                      Top Countries
                    </h3>
                    <div className="space-y-2">
                      {blogAnalytics.viewsByCountry.slice(0, 5).map((country, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-white/5 border border-white/10 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium text-white/70">
                              {i + 1}
                            </span>
                            <span className="text-sm font-medium text-white">
                              {country.country}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-white">
                            {country.views}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
                  <Globe className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-sm font-medium text-white mb-1">
                  Select a blog to view details
                </h3>
                <p className="text-xs text-white/60">
                  Click on any blog from the list to see detailed analytics
                </p>
              </div>
            )}
          </div>
        </div>

        {/* All Blogs Table */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">All Blog Posts</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">
                    Unique
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {blogs.map((blog) => (
                  <tr 
                    key={blog._id} 
                    className="hover:bg-white/5 transition cursor-pointer border-white/5"
                    onClick={() => fetchBlogDetails(blog._id)}
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-white truncate max-w-xs">
                        {blog.title}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white/70">{blog.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        blog.status === "Published"
                          ? "bg-green-500/20 text-green-300 border-green-500/30"
                          : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                      }`}>
                        {blog.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-white">
                        {blog.analytics?.totalViews?.toLocaleString() || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white/70">
                        {blog.analytics?.uniqueViews?.toLocaleString() || 0}
                      </span>
                    </td>
                    
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
}