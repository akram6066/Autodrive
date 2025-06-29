export default function LoadingPage() {
  return (
    <div className="max-w-7xl mx-auto py-16 px-4">
      <div className="h-8 bg-gray-300 w-1/3 mx-auto mb-10 animate-pulse rounded"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
            <div className="relative w-full h-48 mb-4 bg-gray-300 rounded-lg"></div>
            <div className="h-6 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
