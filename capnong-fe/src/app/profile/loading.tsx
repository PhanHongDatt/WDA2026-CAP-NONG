export default function ProfileLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="space-y-2">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white dark:bg-surface border border-border rounded-xl p-6 space-y-4">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg" />
            <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
