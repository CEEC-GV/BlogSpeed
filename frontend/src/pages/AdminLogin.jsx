import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Zap, Eye, EyeOff, ArrowRight, Lock, User } from "lucide-react";
import api from "../api/axios.js";
import { isTokenValid, setToken } from "../utils/auth.js";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (isTokenValid()) {
    return <Navigate to="/admin/analytics" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { username, password });
      setToken(res.data.token);
      navigate("/admin");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Dot Grid Background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '30px 30px',
          }}
        />
      </div>

      {/* Gradient Orbs */}
      {/* <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-yellow-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-orange-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} /> */}

      {/* Header */}
      <nav className="relative z-10 border-b border-white/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
            <img src='/src/assets/logo-white.png' alt="BlogSpeeds Logo" className="h-8 w-auto" />
          </Link>
          <a 
            href="/" 
            className="text-sm text-white/60 hover:text-white transition"
          >
            ← Back to Home
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12">
        <div className="w-full max-w-md">
          
          {/* Login Card */}
          <div className="border border-white/10 rounded-3xl p-10 backdrop-blur-xl bg-white/5 shadow-2xl">
            
            <img src="/src/assets/favicon.png" alt="BlogSpeeds Logo" className="w-16 h-16 mb-6 mx-auto" />

            {/* Title */}
            <h1 className="text-3xl text-center font-bold tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-white/60 mb-8 text-center">
              Sign in to access your admin dashboard
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Username Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Username or Email
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="johndoe@xyz.com"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (error) setError("");
                    }}
                    className="
                      w-full h-12 rounded-xl
                      border border-white/10
                      bg-white/5 backdrop-blur
                      px-4 text-sm
                      focus:outline-none focus:border-purple-500/50 focus:bg-white/10
                      transition-all
                      placeholder:text-white/30
                    "
                    required
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none -z-10 blur-xl" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    className="
                      w-full h-12 rounded-xl
                      border border-white/10
                      bg-white/5 backdrop-blur
                      px-4 pr-12 text-sm
                      focus:outline-none focus:border-purple-500/50 focus:bg-white/10
                      transition-all
                      placeholder:text-white/30
                    "
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="
                      absolute right-4 top-1/2 -translate-y-1/2
                      text-white/40 hover:text-white/80
                      transition
                    "
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/20 to-yellow-500/20 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none -z-10 blur-xl" />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="
                  flex items-start gap-3
                  rounded-xl
                  border border-red-500/20
                  bg-red-500/10
                  px-4 py-3
                  text-sm text-red-400
                  animate-shake
                ">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="
                  relative group
                  w-full h-12 rounded-xl
                  bg-gradient-to-r from-orange-500 to-yellow-500
                  font-semibold tracking-wide
                  hover:shadow-lg hover:shadow-orange-500/50
                  transition-all
                  disabled:opacity-60 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2
                  overflow-hidden
                "
              >
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                
                <span className="relative z-10">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                    </>
                  )}
                </span>
              </button>

              {/* Forgot Password */}
              <div className="text-center">
                <a 
                  href="#" 
                  className="text-sm text-white/60 hover:text-white transition"
                >
                  Forgot your password?
                </a>
              </div>

            </form>
          </div>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <p className="text-xs text-white/40">
              <a href="#" className="hover:text-white/60 transition">Terms of Use</a>
              {' · '}
              <a href="#" className="hover:text-white/60 transition">Privacy Policy</a>
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full -z-10 animate-pulse" style={{ animationDuration: '3s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-white/5 rounded-full -z-10 animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}