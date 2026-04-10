export default function ShopsNewLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-border rounded-xl w-48 mb-6" />
      <div className="bg-white dark:bg-surface border border-border rounded-2xl p-8 space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-border rounded w-28" />
            <div className="h-12 bg-gray-100 dark:bg-background-light rounded-xl" />
          </div>
        ))}
        <div className="h-12 bg-primary/20 rounded-xl w-full" />
      </div>
    </div>
  );
}
