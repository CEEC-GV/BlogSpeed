import { Link, Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <main className="w-full pb-16">
        <Outlet />
      </main>

      <footer className="bg-white text-gray-700 border-t border-gray-200 pt-10">
        {/* Top section */}
        <div className="w-full px-4 py-16 sm:px-6 lg:px-8 xl:px-10">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">

            {/* Brand */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Blog Speed
              </h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-600">
                A modern publishing platform focused on clarity, calm,
                and high-quality reading experiences.
              </p>
            </div>

            {/* Product */}
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Product
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                <li><a href="/" className="transition hover:text-gray-900">Home</a></li>
                <li><a href="/" className="transition hover:text-gray-900">Blog</a></li>
                <li><a href="/" className="transition hover:text-gray-900">Categories</a></li>
                <li><a href="/" className="transition hover:text-gray-900">Featured</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Resources
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                <li><a href="/" className="transition hover:text-gray-900">Guides</a></li>
                <li><a href="/" className="transition hover:text-gray-900">Writing Tips</a></li>
                <li><a href="/" className="transition hover:text-gray-900">Design Systems</a></li>
                <li><a href="/" className="transition hover:text-gray-900">Engineering</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Legal
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                <li><a href="/" className="transition hover:text-gray-900">Privacy Policy</a></li>
                <li><a href="/" className="transition hover:text-gray-900">Terms & Conditions</a></li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200">
          <div className="w-full px-4 py-6 text-center text-xs text-gray-500 sm:px-6 lg:px-8 xl:px-10">
            © 2026 Powered by Blogseed.
          </div>
        </div>
      </footer>
    </div>
  );
}