import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Edit2, Trash2, Search, RotateCcw } from "lucide-react";
import api from "../api/axios.js";
import Button from "../components/Button.jsx";
import Loader from "../components/Loader.jsx";

export default function AdminDashboard() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
const [dateFilter, setDateFilter] = useState("");
const [categoryFilter, setCategoryFilter] = useState("all");

  const loadBlogs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/blogs");
      setBlogs(res.data || []);
    } catch (err) {
      setError("Unable to load blogs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const handleDelete = async () => {
  if (!deleteId) return;
  setDeleting(true);

  try {
    await api.delete(`/admin/blogs/${deleteId}`);
    setBlogs((prev) => prev.filter((b) => b._id !== deleteId));
    showToast("Blog deleted successfully");
  } catch {
    showToast("Failed to delete blog", "error");
  } finally {
    setDeleting(false);
    setDeleteId(null);
  }
};
const [toast, setToast] = useState(null);

const showToast = (message, type = "success") => {
  setToast({ message, type });
  setTimeout(() => setToast(null), 3000);
};


  return (
    <section>
    {toast && (
  <div className={`fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm shadow-lg border backdrop-blur-xl
    ${toast.type === "error"
      ? "bg-red-500/20 text-red-200 border-red-500/30"
      : "bg-green-500/20 text-green-200 border-green-500/30"}`}>
    {toast.message}
  </div>
)}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">

  {/* LEFT: Search + Filters + Reset */}
  <div className="flex flex-wrap items-center gap-3">

    {/* Search */}
    <div className="relative group">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
      <input
        type="text"
        placeholder="Search blogs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="h-10 w-56 rounded-xl border border-white/10 bg-white/5 backdrop-blur px-3 pl-10 text-sm text-white placeholder-white/40 focus:border-white/20 focus:bg-white/10 focus:outline-none transition"
      />
    </div>

    {/* Status */}
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="h-10 rounded-xl border border-white/10 bg-white/5 backdrop-blur px-3 text-sm text-white focus:border-white/20 focus:bg-white/10 focus:outline-none transition"
    >
      <option value="all" className="bg-black text-white">All Status</option>
      <option value="Published" className="bg-black text-white">Published</option>
      <option value="Draft" className="bg-black text-white">Draft</option>
    </select>
    {/* Category */}
<select
  value={categoryFilter}
  onChange={(e) => setCategoryFilter(e.target.value)}
  className="h-10 rounded-xl border border-white/10 bg-white/5 backdrop-blur px-3 text-sm text-white focus:border-white/20 focus:bg-white/10 focus:outline-none transition"
>
  <option value="all" className="bg-black text-white">All Categories</option>

  {/* Dynamic categories */}
  {[...new Set(blogs.map(b => b.category).filter(Boolean))].map(cat => (
    <option key={cat} value={cat} className="bg-black text-white">
      {cat}
    </option>
  ))}
</select>


    {/* Date */}
    <input
      type="date"
      value={dateFilter}
      onChange={(e) => setDateFilter(e.target.value)}
      className="h-10 rounded-xl border border-white/10 bg-white/5 backdrop-blur px-3 text-sm text-white focus:border-white/20 focus:bg-white/10 focus:outline-none transition"
    />

    {/* Reset (subtle) */}

      <button
  onClick={() => {
  setSearch("");
  setStatusFilter("all");
  setDateFilter("");
  setCategoryFilter("all");
}}

  className="
    h-10
    rounded-xl
    border border-white/10
    bg-white/5
    backdrop-blur
    px-4
    text-sm
    text-white/60
    transition
    hover:border-white/20
    hover:bg-white/10
    hover:text-white
    flex items-center gap-2
  "
>
  <RotateCcw className="w-4 h-4" />
  Reset
</button>


  </div>

  {/* RIGHT: Create */}
  <Link to="/admin/new">
    <Button>Create New</Button>
  </Link>

</div>



      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
        {loading && <div className="p-6"><Loader /></div>}
        {error && <p className="p-6 text-sm text-red-300">{error}</p>}
        {!loading && !error && (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wide text-white/60">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs
  .filter((blog) => {
  const searchText = search.toLowerCase();

  const matchesSearch =
    blog.title.toLowerCase().includes(searchText) ||
    blog.category?.toLowerCase().includes(searchText);

  const matchesStatus =
    statusFilter === "all" || blog.status === statusFilter;

  const matchesDate =
    !dateFilter ||
    new Date(blog.createdAt).toISOString().split("T")[0] === dateFilter;

  const matchesCategory =
    categoryFilter === "all" || blog.category === categoryFilter;

  return (
    matchesSearch &&
    matchesStatus &&
    matchesDate &&
    matchesCategory
  );
})

  .map((blog) => (

                <tr key={blog._id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-6 py-5">
  <div className="font-medium text-white">
    {blog.title}
  </div>

  {blog.category && (
    <div className="mt-1 inline-block rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-200 border border-purple-500/30">
      {blog.category}
    </div>
  )}
</td>

                  <td className="px-6 py-5 text-white/70">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      blog.status === 'Published' 
                        ? 'bg-green-500/20 text-green-200 border border-green-500/30'
                        : 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/30'
                    }`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-white/70">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">

  {/* VIEW */}
  <Link
    to={`/blog/${blog.slug}`}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/70 transition hover:border-white/20 hover:text-white hover:bg-white/5"
    title="View"
  >
    <Eye className="w-4 h-4" />
  </Link>

  {/* EDIT */}
  <Link
    to={`/admin/edit/${blog._id}`}
    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/70 transition hover:border-white/20 hover:text-white hover:bg-white/5"
    title="Edit"
  >
    <Edit2 className="w-4 h-4" />
  </Link>

  {/* DELETE */}
  <button
    onClick={() => setDeleteId(blog._id)}
    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-red-400/70 transition hover:border-red-500/30 hover:text-red-300 hover:bg-red-500/10"
    title="Delete"
  >
    <Trash2 className="w-4 h-4" />
  </button>

</div>

                  </td>
                </tr>
              ))}
              {blogs.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-10 text-center text-white/50">
                    No blogs yet. Create your first post.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {deleteId && (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/80 backdrop-blur-xl p-6 shadow-xl">
      <h3 className="text-lg font-semibold text-white">
        Delete blog?
      </h3>
      <p className="mt-2 text-sm text-white/60">
        This action cannot be undone.
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => setDeleteId(null)}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
        >
          Cancel
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50 transition"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
)}

    </section>
  );
}
