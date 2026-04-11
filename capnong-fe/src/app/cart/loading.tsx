export default function CartLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-surface border border-border rounded-xl p-4 flex gap-4">
              <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 w-1/3 bg-gray-100 dark:bg-gray-800 rounded" />
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-surface border border-border rounded-xl p-6 space-y-4 h-fit">
          <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
