export default function ProductsSlugLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      {/* Breadcrumb */}
      <div className="flex gap-2 mb-6">
        <div className="h-4 bg-gray-100 dark:bg-background-light rounded w-16" />
        <div className="h-4 bg-gray-100 dark:bg-background-light rounded w-4" />
        <div className="h-4 bg-gray-200 dark:bg-border rounded w-40" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square bg-gray-200 dark:bg-border rounded-2xl" />
        {/* Info */}
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-border rounded-xl w-3/4" />
          <div className="flex gap-2">
            <div className="h-6 bg-gray-100 dark:bg-background-light rounded-full w-20" />
            <div className="h-6 bg-gray-100 dark:bg-background-light rounded-full w-16" />
          </div>
          <div className="h-10 bg-primary/20 rounded-xl w-36" />
          <div className="h-px bg-border" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 dark:bg-border rounded" style={{ width: `${90 - i * 15}%` }} />
            ))}
          </div>
          <div className="flex gap-3 pt-4">
            <div className="h-14 bg-primary/20 rounded-xl flex-1" />
            <div className="h-14 bg-gray-200 dark:bg-border rounded-xl w-14" />
          </div>
        </div>
      </div>
    </div>
  );
}
