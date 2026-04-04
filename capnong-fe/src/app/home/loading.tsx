export default function HomeLoading() {
  return (
    <>
      {/* Trust badges skeleton */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-around items-center">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-gray-200 skeleton" />
              <div className="w-32 h-4 rounded bg-gray-200 skeleton" />
            </div>
          ))}
        </div>
      </section>

      {/* Hero banner skeleton */}
      <div className="py-4 bg-gradient-to-b from-green-50 to-transparent">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-3 h-[280px]">
            <div className="flex-1 rounded-xl bg-gray-200 skeleton" />
            <div className="w-[280px] flex flex-col gap-3 shrink-0">
              <div className="flex-1 rounded-xl bg-gray-200 skeleton" />
              <div className="flex-1 rounded-xl bg-gray-200 skeleton" />
            </div>
          </div>
        </div>
      </div>

      {/* Category grid skeleton */}
      <div className="mb-8 max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="w-24 h-5 bg-gray-200 rounded skeleton mb-4" />
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 skeleton" />
                <div className="w-16 h-3 rounded bg-gray-200 skeleton" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flash deal skeleton */}
      <div className="mb-8 max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-40 h-6 bg-gray-200 rounded skeleton" />
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-7 h-7 bg-gray-200 rounded skeleton" />
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-[180px] shrink-0">
                <div className="aspect-square rounded-lg bg-gray-200 skeleton mb-2" />
                <div className="w-24 h-4 bg-gray-200 rounded skeleton mx-auto mb-1" />
                <div className="w-full h-4 bg-gray-200 rounded-full skeleton" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product cards skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="w-48 h-7 bg-gray-200 rounded skeleton mb-6" />
        <div className="grid grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="aspect-square rounded-lg bg-gray-200 skeleton mb-3" />
              <div className="w-3/4 h-4 bg-gray-200 rounded skeleton mb-2" />
              <div className="w-1/2 h-4 bg-gray-200 rounded skeleton mb-2" />
              <div className="w-1/3 h-3 bg-gray-200 rounded skeleton" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
