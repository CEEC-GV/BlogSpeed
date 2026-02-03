export default function BlogCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
      <div className="aspect-video w-full rounded-xl bg-white/10" />
      <div className="mt-4 flex gap-2">
        <div className="h-5 w-16 rounded-full bg-white/10" />
        <div className="h-5 w-12 rounded-full bg-white/10" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-4 w-3/4 rounded bg-white/10" />
        <div className="h-4 w-5/6 rounded bg-white/10" />
      </div>
      <div className="mt-6 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-white/10" />
        <div className="space-y-2">
          <div className="h-3 w-24 rounded bg-white/10" />
          <div className="h-3 w-16 rounded bg-white/10" />
        </div>
      </div>
    </div>
  );
}
