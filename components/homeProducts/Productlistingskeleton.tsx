// app/products/ProductListingSkeleton.tsx
export default function ProductListingSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-100">
      <div className="animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Left: Logo + Title */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg" />
                  <div className="h-8 w-32 bg-gray-200 rounded" />
                </div>

                {/* Mobile: Filters button skeleton */}
                <div className="w-10 h-10 bg-gray-200 rounded-lg lg:hidden" />
              </div>

              {/* Search bar skeleton */}
              <div className="w-full lg:flex-1 lg:max-w-2xl">
                <div className="h-12 bg-gray-200 rounded-xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex gap-8">
            {/* Sidebar Skeleton (Desktop only) */}
            <aside className="w-80 shrink-0 hidden lg:block">
              <div className="sticky top-24 space-y-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                  >
                    <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
                    <div className="space-y-3">
                      {[1, 2, 3].map((j) => (
                        <div key={j} className="flex items-center gap-3">
                          <div className="w-4 h-4 bg-gray-200 rounded" />
                          <div className="flex-1 h-4 bg-gray-200 rounded" />
                          <div className="w-8 h-6 bg-gray-200 rounded-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            {/* Main Content Skeleton */}
            <main className="flex-1 min-w-0">
              {/* Sort Bar Skeleton */}
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="h-5 w-40 bg-gray-200 rounded" />
                  <div className="h-10 w-full sm:w-48 bg-gray-200 rounded-lg" />
                </div>
              </div>

              {/* Products Grid Skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <div className="aspect-square bg-gray-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 w-32 bg-gray-200 rounded" />
                      <div className="h-6 w-full bg-gray-200 rounded" />
                      <div className="h-4 w-full bg-gray-200 rounded" />
                      <div className="h-4 w-3/4 bg-gray-200 rounded" />
                      <div className="flex items-center justify-between pt-3 gap-3">
                        <div className="h-8 w-24 bg-gray-200 rounded" />
                        <div className="h-10 w-20 bg-gray-200 rounded-lg" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
