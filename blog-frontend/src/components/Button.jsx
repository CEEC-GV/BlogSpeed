const variants = {
  primary:
    "border-transparent bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-purple-700 hover:to-pink-700 focus:ring-purple-200",
  secondary:
    "border-white/10 bg-white/5 backdrop-blur text-white/70 hover:bg-white/10 hover:text-white focus:ring-white/20",
  ghost: "border-transparent text-white/60 hover:text-white hover:bg-white/5"
};

const sizes = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-sm"
};

export default function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl border font-medium transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
