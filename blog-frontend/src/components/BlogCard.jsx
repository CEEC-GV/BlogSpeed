import { Link } from "react-router-dom";
import Tag from "./Tag.jsx";
import AuthorCard from "./AuthorCard.jsx";

export default function BlogCard({ blog }) {
  return (
    <article className="group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <Link to={`/blog/${blog.slug}`} className="block">
        <div className="aspect-video overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Tag label={blog.category} />
        </div>
        <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
          {blog.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-gray-600">{blog.excerpt}</p>
      </Link>
      <div className="mt-5 flex items-center justify-between">
        <AuthorCard
          name={blog.author}
          subtitle={new Date(blog.createdAt).toLocaleDateString()}
          variant="compact"
        />
        <Link
          to={`/blog/${blog.slug}`}
          className="text-sm font-semibold text-blue-600 transition hover:text-blue-700"
        >
          Read Article →
        </Link>
      </div>
    </article>
  );
}
