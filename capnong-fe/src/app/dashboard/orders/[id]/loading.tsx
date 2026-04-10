export default function DashboardOrderDetailLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-5 bg-gray-200 dark:bg-border rounded w-16" />
        <div className="h-8 bg-gray-200 dark:bg-border rounded-xl w-52" />
      </div>
      {/* Order info cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-surface border border-border rounded-2xl p-5 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-border rounded w-24" />
            <div className="h-6 bg-gray-100 dark:bg-background-light rounded w-40" />
          </div>
        ))}
      </div>
      {/* Items */}
      <div className="bg-white dark:bg-surface border border-border rounded-2xl p-5 space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-border rounded w-32" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3 border-b border-border last:border-0">
            <div className="w-14 h-14 bg-gray-200 dark:bg-border rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-border rounded w-3/4" />
              <div className="h-3 bg-gray-100 dark:bg-background-light rounded w-1/4" />
            </div>
            <div className="h-5 bg-gray-200 dark:bg-border rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
