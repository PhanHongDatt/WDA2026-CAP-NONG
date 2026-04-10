export default function HtxShopLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      {/* HTX header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary-dark/20 dark:to-surface rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 dark:bg-border rounded-2xl" />
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-gray-200 dark:bg-border rounded w-56" />
            <div className="h-4 bg-gray-100 dark:bg-background-light rounded w-40" />
          </div>
        </div>
      </div>
      {/* Members */}
      <div className="flex gap-3 mb-6 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-12 h-12 bg-gray-200 dark:bg-border rounded-full shrink-0" />
        ))}
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
