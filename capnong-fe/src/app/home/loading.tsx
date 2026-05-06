export default function HomeLoading() {
  return (
    <>
      {/* Hero Section Skeleton */}
      <section className="relative w-full h-[500px] md:h-[600px] bg-gray-200 skeleton" />

      {/* Hành trình nông sản Skeleton */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center">
          <div className="w-64 h-10 bg-gray-200 rounded-lg skeleton mb-10" />
          <div className="w-full flex justify-between gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3 w-full">
                <div className="w-16 h-16 sm:w-28 sm:h-28 rounded-full bg-gray-200 skeleton" />
                <div className="w-20 h-4 bg-gray-200 rounded skeleton" />
                <div className="w-16 h-3 bg-gray-200 rounded skeleton hidden sm:block" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Category Section Skeleton */}
      <div className="category-section mt-10">
        <div className="w-64 h-8 bg-gray-200 rounded skeleton mx-auto mb-8" />
        <div className="category-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl skeleton h-[80px] sm:h-[120px]" />
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-2 relative">
        {/* Nông sản đang mùa Skeleton */}
        <section className="-mx-4 px-4 py-10 md:py-[30px] xl:py-[40px] rounded-3xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-6">
            <div>
              <div className="w-72 h-8 bg-gray-200 rounded skeleton mb-4" />
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <div className="w-20 h-8 rounded-full bg-gray-200 skeleton" />
                <div className="w-24 h-8 rounded-full bg-gray-200 skeleton" />
                <div className="w-24 h-8 rounded-full bg-gray-200 skeleton" />
                <div className="w-32 h-8 rounded-full bg-gray-200 skeleton" />
              </div>
            </div>
            <div className="w-24 h-5 bg-gray-200 rounded skeleton" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={`seasonal-${i}`} />
            ))}
          </div>
        </section>

        {/* Sản phẩm mới Skeleton */}
        <section className="py-10 md:py-[60px] xl:py-[80px] relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div className="w-64 h-8 bg-gray-200 rounded skeleton" />
            <div className="w-24 h-5 bg-gray-200 rounded skeleton" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={`new-${i}`} />
            ))}
          </div>
        </section>

        {/* Khám phá nhà cung cấp Skeleton */}
        <section className="py-10 md:py-[60px] xl:py-[80px] relative">
          <div className="w-full mb-8 h-8 bg-gray-200 skeleton" />
          <div className="w-72 h-8 bg-gray-200 rounded skeleton mx-auto mb-6" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`shop-${i}`} className="bg-gray-100 rounded-2xl p-5 h-[300px] skeleton" />
            ))}
            <div className="bg-gray-200 rounded-2xl p-5 h-[300px] skeleton" />
          </div>
        </section>

        {/* Gợi ý cho bạn Skeleton */}
        <section className="mb-20 -mx-4 px-9 pb-28 md:pt-[40px] md:pb-[40px] xl:pt-[50px] xl:pb-[50px] relative z-0">
          <div className="text-center mb-6">
            <div className="w-64 h-8 bg-gray-200 rounded skeleton mx-auto" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <ProductCardSkeleton key={`suggest-${i}`} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3.5">
      <div className="aspect-square rounded-t-xl bg-gray-200 skeleton mb-3" />
      <div className="w-3/4 h-4 bg-gray-200 rounded skeleton mb-2" />
      <div className="w-1/2 h-3 bg-gray-200 rounded skeleton mb-3" />
      <div className="flex justify-between items-end mb-3">
        <div className="w-20 h-5 bg-gray-200 rounded skeleton" />
        <div className="w-8 h-3 bg-gray-200 rounded skeleton" />
      </div>
      <div className="flex gap-2 mt-auto">
        <div className="w-[84px] sm:w-[96px] h-7 sm:h-8 rounded-full bg-gray-200 skeleton shrink-0" />
        <div className="flex-1 h-7 sm:h-8 rounded-full bg-gray-200 skeleton" />
      </div>
    </div>
  );
}
