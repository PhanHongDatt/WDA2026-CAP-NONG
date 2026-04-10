export default function ProductDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image gallery */}
        <div className="space-y-3">
          <div className="aspect-square bg-gray-200 dark:bg-border rounded-2xl" />
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-20 h-20 bg-gray-200 dark:bg-border rounded-xl" />
            ))}
          </div>
        </div>
        {/* Product info */}
        <div className="space-y-4">
          <div className="h-4 bg-gray-100 dark:bg-background-light rounded w-24" />
          <div className="h-8 bg-gray-200 dark:bg-border rounded-xl w-3/4" />
          <div className="h-5 bg-gray-200 dark:bg-border rounded w-1/2" />
          <div className="flex gap-3 items-center">
            <div className="h-10 bg-primary/20 rounded-xl w-32" />
            <div className="h-6 bg-gray-100 dark:bg-background-light rounded w-20 line-through" />
          </div>
          <div className="flex gap-2 pt-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-100 dark:bg-background-light rounded-full w-20" />
            ))}
          </div>
          <div className="h-px bg-border my-4" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-border rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-border rounded w-5/6" />
            <div className="h-4 bg-gray-200 dark:bg-border rounded w-2/3" />
          </div>
          <div className="flex gap-3 pt-4">
            <div className="h-14 bg-primary/20 rounded-xl flex-1" />
            <div className="h-14 bg-gray-200 dark:bg-border rounded-xl flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
