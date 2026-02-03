import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white px-6 py-24 text-gray-900">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-gray-600">
          The page you are looking for does not exist.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
