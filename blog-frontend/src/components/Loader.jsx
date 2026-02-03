export default function Loader({ label = "Loading..." }) {
  return (
    <div className="flex items-center gap-2 text-sm text-white/60">
      <span className="h-2 w-2 animate-pulse rounded-full bg-purple-500" />
      {label}
    </div>
  );
}
