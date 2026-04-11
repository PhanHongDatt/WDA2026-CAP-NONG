export default function DashboardProductNewLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 dark:bg-border rounded-xl w-48" />
      <div className="bg-white dark:bg-surface border border-border rounded-2xl p-6 space-y-5">
        {/* Image upload area */}
        <div className="h-40 bg-gray-100 dark:bg-background-light rounded-2xl border-2 border-dashed border-border" />
        {/* Form fields */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-border rounded w-20" />
            <div className="h-12 bg-gray-100 dark:bg-background-light rounded-xl" />
          </div>
        ))}
        {/* Buttons */}
        <div className="flex gap-4 pt-2">
          <div className="h-12 bg-gray-200 dark:bg-border rounded-xl flex-1" />
          <div className="h-12 bg-gray-200 dark:bg-border rounded-xl flex-[2]" />
        </div>
      </div>
    </div>
  );
}
