const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const avatarUrl = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name || "Author"
  )}&background=E5E7EB&color=111827`;

export default function AuthorCard({ name, subtitle, variant = "full" }) {
  if (variant === "compact") {
    return (
      <div className="flex items-center gap-3">
        <img
          src={avatarUrl(name)}
          alt={name}
          className="h-9 w-9 rounded-full border border-white/20 object-cover"
          loading="lazy"
        />
        <div>
          <p className="text-sm font-medium text-black">{name}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray/10 bg-white/5 backdrop-blur-xl p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20 text-sm font-semibold text-purple-400 border border-purple-500/30">
          {getInitials(name)}
        </div>
        <div>
          <p className="text-base font-semibold text-black">{name}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
