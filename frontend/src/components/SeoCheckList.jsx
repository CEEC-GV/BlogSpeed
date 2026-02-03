/**
 * Modern SEO Check List Component
 * Displays list of SEO checks with clean status indicators
 */
export default function SeoCheckList({ checks = [] }) {
  if (checks.length === 0) {
    return (
      <div className="text-sm text-white/50 text-center py-8">
        No SEO checks available yet.
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "good":
        return (
          <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case "ok":
        return (
          <div className="w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        );
      case "bad":
        return (
          <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {checks.map((check, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-2"
        >
          <div className="flex-shrink-0">
            {getStatusIcon(check.status)}
          </div>
          <p className="text-xs text-white/70 flex-1 leading-relaxed">{check.label}</p>
        </div>
      ))}
    </div>
  );
}