export default function ShopDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      {/* Shop header */}
      <div className="bg-white dark:bg-surface border border-border rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 dark:bg-border rounded-2xl" />
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-gray-200 dark:bg-border rounded w-48" />
            <div className="h-4 bg-gray-100 dark:bg-background-light rounded w-72" />
          </div>
          <div className="h-10 bg-gray-200 dark:bg-border rounded-xl w-28 hidden md:block" />
        </div>
      </div>
      {/* Products grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="aspect-square bg-gray-200 dark:bg-border" />
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-border rounded w-3/4" />
              <div className="h-5 bg-gray-100 dark:bg-background-light rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
