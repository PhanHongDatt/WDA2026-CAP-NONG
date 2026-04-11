export default function DashboardDraftsLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 dark:bg-border rounded-xl w-36" />
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-surface border border-border rounded-2xl p-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-border rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 dark:bg-border rounded w-2/3" />
              <div className="h-4 bg-gray-100 dark:bg-background-light rounded w-1/3" />
            </div>
            <div className="h-9 bg-gray-200 dark:bg-border rounded-lg w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
