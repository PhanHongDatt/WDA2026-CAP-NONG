export default function ShopsSlugLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      {/* Shop banner */}
      <div className="h-48 bg-gray-200 dark:bg-border rounded-2xl mb-6" />
      {/* Shop info */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 bg-gray-200 dark:bg-border rounded-2xl -mt-10 border-4 border-white dark:border-surface" />
        <div className="space-y-2 flex-1">
          <div className="h-6 bg-gray-200 dark:bg-border rounded w-48" />
          <div className="h-4 bg-gray-100 dark:bg-background-light rounded w-64" />
        </div>
      </div>
      {/* Products */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="aspect-square bg-gray-200 dark:bg-border" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-border rounded w-3/4" />
              <div className="h-5 bg-primary/10 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
