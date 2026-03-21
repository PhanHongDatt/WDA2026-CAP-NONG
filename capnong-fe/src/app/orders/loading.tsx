export default function OrdersLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4 animate-pulse">
      <div className="h-8 w-56 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
        ))}
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-surface border border-border rounded-xl p-5 space-y-3">
          <div className="flex justify-between">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="h-3 w-48 bg-gray-100 dark:bg-gray-800 rounded" />
          <div className="flex gap-2">{[1, 2, 3, 4, 5].map((j) => <div key={j} className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full" />)}</div>
        </div>
      ))}
    </div>
  );
}
