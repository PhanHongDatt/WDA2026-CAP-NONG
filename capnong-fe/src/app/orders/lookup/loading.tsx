export default function OrderLookupLoading() {
  return (
    <div className="max-w-xl mx-auto px-4 py-12 animate-pulse">
      <div className="text-center mb-8">
        <div className="h-8 bg-gray-200 dark:bg-border rounded-xl w-48 mx-auto mb-3" />
        <div className="h-4 bg-gray-100 dark:bg-background-light rounded w-72 mx-auto" />
      </div>
      <div className="bg-white dark:bg-surface border border-border rounded-2xl p-8 space-y-5">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-border rounded w-28" />
            <div className="h-12 bg-gray-100 dark:bg-background-light rounded-xl" />
          </div>
        ))}
        <div className="h-12 bg-gray-200 dark:bg-border rounded-xl" />
      </div>
    </div>
  );
}
