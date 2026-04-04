export default function CheckoutLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 animate-pulse">
      <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-surface border border-border rounded-xl p-6 space-y-4">
              <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
              </div>
              <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-xl" />
            </div>
          ))}
        </div>
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-surface border border-border rounded-xl p-6 space-y-4">
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
