export default function CooperativeLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 animate-pulse">
      <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-surface border border-border rounded-xl p-5 space-y-3">
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full" />
            <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-white dark:bg-surface border border-border rounded-xl" />
        ))}
      </div>
    </div>
  );
}
