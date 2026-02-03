import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import { clearToken } from "../utils/auth.js";
import { Zap, LogOut, FileText, Plus, BarChart3, UserStar } from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearToken();
    navigate("/admin/login");
  };

  return (
    <div className="h-screen overflow-hidden bg-black text-white relative">
      {/* Animated Dot Grid Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      
      <div className="flex h-full w-full relative z-10">
        <aside className="hidden fixed inset-y-0 left-0 w-64 flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl px-6 py-10 md:flex">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
            <img src='/src/assets/logo-white.png' alt="BlogSpeeds Logo" className="h-8 w-auto" />
          </Link>
          <nav className="mt-10 space-y-2 text-sm">
            <NavLink
              to="/admin/analytics"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition ${
                  isActive
                    ? "bg-white/10 text-white border border-white/20"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </NavLink>
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition ${
                  isActive
                    ? "bg-white/10 text-white border border-white/20"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <FileText className="w-4 h-4" />
              Blog List
            </NavLink>
            <NavLink
              to="/admin/new"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition ${
                  isActive
                    ? "bg-white/10 text-white border border-white/20"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Plus className="w-4 h-4" />
              Create New
            </NavLink>
            <NavLink
              to="/admin/subscribers"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium transition ${
                  isActive
                    ? "bg-white/10 text-white border border-white/20"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <UserStar className="w-4 h-4" />
              Subscribers
            </NavLink>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </nav>
          <Link
            to="/"
            className="mt-auto text-xs font-semibold uppercase tracking-wide text-white/40 transition hover:text-white/60"
          >
            ← Back to Site
          </Link>
        </aside>
        <main className="flex-1 ml-0 md:ml-64 px-6 py-10 md:px-10 overflow-y-auto">
          <div className="md:hidden">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-3">
              <Link to="/admin" className="text-sm font-semibold text-white flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Admin
              </Link>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
          <div className="mt-6 md:mt-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}