export default function DashboardProductsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex justify-between items-center">
        <div className="h-8 bg-gray-200 dark:bg-border rounded-xl w-40" />
        <div className="h-10 bg-gray-200 dark:bg-border rounded-xl w-36" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-surface border border-border rounded-2xl overflow-hidden">
            <div className="h-40 bg-gray-200 dark:bg-border" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-gray-200 dark:bg-border rounded w-3/4" />
              <div className="h-4 bg-gray-100 dark:bg-background-light rounded w-1/2" />
              <div className="flex justify-between">
                <div className="h-6 bg-gray-200 dark:bg-border rounded w-24" />
                <div className="h-6 bg-gray-100 dark:bg-background-light rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
