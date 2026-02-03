import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import api from "../api/axios.js";
import Loader from "../components/Loader.jsx";
import BlogCard from "../components/BlogCard.jsx";
import Tag from "../components/Tag.jsx";
import AuthorCard from "../components/AuthorCard.jsx";
import SubscribeForm from "../components/subscribeform.jsx";
import appId from "../auth.txt?raw";

export default function Blog() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [related, setRelated] = useState([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    api
      .get(`/blogs/${appId}/${slug}`)
      .then((res) => {
        if (!isMounted) return;
        setBlog(res.data);
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Blog not found.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!blog) return;
    const query = new URLSearchParams();
    query.set("limit", "3");
    query.set("exclude", blog.slug);
    if (blog.category) query.set("category", blog.category);

    api
      .get(`/blogs/${appId}?${query.toString()}`)
      .then((res) => setRelated(res.data.data || []))
      .catch(() => setRelated([]));
  }, [blog]);

  if (loading) return <Loader />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!blog) return null;

  return (
    <article className="page-fade pt-10">
     <div className="mx-auto max-w-7xl px-6 lg:px-12">


  {/* Meta */}
  <div className="flex items-center gap-3 text-sm text-gray-500">
    <Tag label={blog.category} />
    <span className="text-gray-300">•</span>
    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
  </div>

  {/* Title */}
  <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-5xl">
    {blog.title}
  </h1>

  {/* Excerpt */}
  <p className="mt-4 max-w-2xl text-lg text-gray-600">
    {blog.excerpt}
  </p>
</div>
      <div className="mx-auto mt-12 mb-12 max-w-7xl px-6 lg:px-12">
  <img
    src={blog.coverImage}
    alt={blog.title}
    className="w-full rounded-xl object-contain"
    loading="lazy"
  />
</div>



{/* CONTENT + AUTHOR */}
<div className="mx-auto mt-16 max-w-7xl px-6 lg:px-12">

  {/* BLOG CONTENT */}
  <div className="prose prose-gray prose-lg max-w-none">

    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSanitize]}
    >
      {blog.content}
    </ReactMarkdown>
  </div>

  {/* AUTHOR */}
  <div className="mt-16">
    <AuthorCard name={blog.author} subtitle="Author" />
  </div>

</div>

      <section className="mt-20 pt-6 border-t border-gray-100">
  <div className="mx-auto max-w-[88rem] px-8 lg:px-16">

    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-semibold text-gray-900">
  More in <span className="text-blue-600">{blog.category}</span>
</h2>

      <Link
        to="/"
        className="text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        View all
      </Link>
    </div>

    {related.length === 0 ? (
  <p className="mt-6 text-sm text-gray-500">
    More stories are coming soon.
  </p>
) : (
  <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {related.map((post) => (
      <BlogCard key={post._id} blog={post} />
    ))}
  </div>
)}


  </div>
  <SubscribeForm />
</section>

    </article>
  );
}
