export default function CooperativeManageLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-border rounded-xl w-56 mb-6" />
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-white dark:bg-surface border border-border rounded-2xl" />
        ))}
      </div>
      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 dark:bg-border rounded-xl w-28" />
        ))}
      </div>
      {/* List */}
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-white dark:bg-surface border border-border rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
