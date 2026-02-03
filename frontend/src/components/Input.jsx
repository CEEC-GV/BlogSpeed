export default function Input({
  label,
  helper,
  as = "input",
  className = "",
  ...props
}) {
  const Component = as === "textarea" ? "textarea" : "input";
  return (
    <label className="block text-sm text-white/80">
      <span className="font-medium text-white">{label}</span>
      <Component
        className={`mt-2 w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur px-4 py-3 text-sm text-white shadow-sm transition focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 placeholder-white/40 ${className}`}
        {...props}
      />
      {helper && <span className="mt-1 block text-xs text-white/60">{helper}</span>}
    </label>
  );
}
