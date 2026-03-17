export default function CatalogLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header skeleton */}
      <div className="w-40 h-7 bg-gray-200 rounded skeleton mb-6" />

      <div className="flex gap-6">
        {/* Sidebar filters skeleton */}
        <aside className="w-60 shrink-0 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="w-20 h-4 bg-gray-200 rounded skeleton mb-3" />
              <div className="space-y-2">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="w-full h-3 bg-gray-200 rounded skeleton" />
                ))}
              </div>
            </div>
          ))}
        </aside>

        {/* Product grid skeleton */}
        <div className="flex-1">
          {/* Category pills */}
          <div className="flex gap-2 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-8 bg-gray-200 rounded-full skeleton" />
            ))}
          </div>

          <div className="grid grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
                <div className="aspect-square rounded-lg bg-gray-200 skeleton mb-3" />
                <div className="w-3/4 h-4 bg-gray-200 rounded skeleton mb-2" />
                <div className="w-1/2 h-4 bg-gray-200 rounded skeleton mb-2" />
                <div className="w-1/3 h-3 bg-gray-200 rounded skeleton" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
