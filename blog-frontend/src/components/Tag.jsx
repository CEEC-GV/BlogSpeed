const toneMap = {
  Design: "bg-blue-500/20 text-blue-400 ring-blue-500/30",
  Product: "bg-purple-500/20 text-purple-400 ring-purple-500/30",
  Engineering: "bg-orange-500/20 text-orange-400 ring-orange-500/30",
  Business: "bg-emerald-500/20 text-emerald-400 ring-emerald-500/30",
  Marketing: "bg-amber-500/20 text-amber-400 ring-amber-500/30",
  Research: "bg-slate-500/20 text-slate-400 ring-slate-500/30"
};

export default function Tag({ label }) {
  const tone = toneMap[label] || "bg-blue-500/20 text-blue-400 ring-blue-500/30";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${tone}`}
    >
      {label}
    </span>
  );
}
