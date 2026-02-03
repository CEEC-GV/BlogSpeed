import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import BlogCard from "../components/BlogCard.jsx";
import BlogCardSkeleton from "../components/BlogCardSkeleton.jsx";
import Tag from "../components/Tag.jsx";
import AuthorCard from "../components/AuthorCard.jsx";
import Pagination from "../components/Pagination.jsx";
import SubscribeForm from "../components/subscribeform.jsx";
import appId from "../auth.txt?raw";

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page") || "1", 10);
  const categoryParam = searchParams.get("category") || "";

  useEffect(() => {
    api
      .get(`/blogs/${appId}/categories`)
      .then((res) => setCategories(res.data.data || []))
      .catch(() => {
        setCategories([]);
      });
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    const query = new URLSearchParams();
    query.set("page", String(page));
    query.set("limit", "9");
    if (categoryParam) query.set("category", categoryParam);

    api
      .get(`/blogs/${appId}?${query.toString()}`)
      .then((res) => {
        if (!isMounted) return;
        setBlogs(res.data.data || []);
        setPagination(res.data.pagination || { page: 1, totalPages: 1 });
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Unable to load blogs.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page, categoryParam]);

  const featuredBlog = useMemo(() => {
    if (page !== 1) return null;
    return blogs.length > 0 ? blogs[0] : null;
  }, [blogs, page]);

  const gridBlogs = useMemo(() => {
    if (page !== 1) return blogs;
    return blogs.slice(1);
  }, [blogs, page]);

  const handlePageChange = (nextPage) => {
    const nextParams = {};
    if (categoryParam) nextParams.category = categoryParam;
    nextParams.page = String(nextPage);
    setSearchParams(nextParams);
  };

  const handleCategoryChange = (category) => {
    const nextParams = {};
    if (category && category !== "All") nextParams.category = category;
    nextParams.page = "1";
    setSearchParams(nextParams);
  };

  return (
    <section className="page-fade pt-8 px-4 sm:px-6 lg:px-8 xl:px-10">
      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Premium Insights
        </p>
        <h1 className="text-4xl font-semibold text-gray-900 md:text-5xl">
          A modern blog designed for clarity and calm.
        </h1>
        <p className="max-w-2xl text-base text-gray-600">
          Discover product strategy, design systems, and engineering stories crafted
          for focused reading.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        {["All", ...categories].map((cat) => {
          const isActive = (categoryParam || "All") === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                isActive
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900"
              }`}
            >
              {cat === "All" ? "All Topics" : cat}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <BlogCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      )}

      {!loading && error && <p className="mt-8 text-sm text-red-600">{error}</p>}

      {!loading && !error && blogs.length === 0 && (
        <div className="mt-12 rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          No stories yet — new insights are on the way.
        </div>
      )}

      {!loading && !error && featuredBlog && (
        <div className="mt-12 grid gap-8 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <Link to={`/blog/${featuredBlog.slug}`} className="group block">
            <div className="aspect-video overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 relative">
              <img
                src={featuredBlog.coverImage}
                alt={featuredBlog.title}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                loading="lazy"
              />
            </div>
          </Link>
          <div>
            <div className="flex flex-wrap gap-2">
              <Tag label={featuredBlog.category} />
            </div>
            <Link to={`/blog/${featuredBlog.slug}`}>
              <h2 className="mt-4 text-3xl font-semibold text-gray-900 transition hover:text-blue-600">
                {featuredBlog.title}
              </h2>
            </Link>
            <p className="mt-3 text-sm text-gray-600">{featuredBlog.excerpt}</p>
            <div className="mt-6 flex items-center justify-between">
              <AuthorCard
                name={featuredBlog.author}
                subtitle={new Date(featuredBlog.createdAt).toLocaleDateString()}
                variant="compact"
              />
              <Link
                to={`/blog/${featuredBlog.slug}`}
                className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Read Article →
              </Link>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && gridBlogs.length > 0 && (
        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {gridBlogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      )}

      <Pagination
        page={pagination.page || 1}
        totalPages={pagination.totalPages || 1}
        onPageChange={handlePageChange}
      />

      {/* Subscribe Form */}
      <SubscribeForm />
    </section>
  );
}