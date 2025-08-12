import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = "", 
  width = "w-full", 
  height = "h-4", 
  rounded = "rounded" 
}) => {
  return (
    <div 
      className={`${width} ${height} ${rounded} bg-gray-200 animate-pulse ${className}`}
    />
  );
};

// Predefined skeleton components
export const SkeletonText = ({ lines = 1, className = "" }: { lines?: number; className?: string }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        height="h-4" 
        width={i === lines - 1 ? "w-3/4" : "w-full"} 
        className="rounded"
      />
    ))}
  </div>
);

export const SkeletonTitle = ({ className = "" }: { className?: string }) => (
  <div className={`space-y-3 ${className}`}>
    <Skeleton height="h-8" width="w-3/4" className="rounded-lg" />
    <Skeleton height="h-1" width="w-24" className="rounded-full" />
  </div>
);

export const SkeletonCard = ({ className = "" }: { className?: string }) => (
  <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
    <Skeleton height="h-48" className="rounded-lg mb-4" />
    <SkeletonText lines={3} />
  </div>
);

export const SkeletonTourCard = ({ className = "" }: { className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-lg overflow-hidden ${className}`}>
    <Skeleton height="h-72" className="rounded-t-2xl" />
    <div className="p-6 space-y-4">
      <Skeleton height="h-6" width="w-3/4" className="rounded" />
      <Skeleton height="h-4" width="w-1/2" className="rounded" />
      <Skeleton height="h-8" width="w-full" className="rounded-xl" />
    </div>
  </div>
);

export const SkeletonBlogCard = ({ className = "" }: { className?: string }) => (
  <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
    <Skeleton height="h-48" className="rounded-t-lg" />
    <div className="p-4 space-y-3">
      <Skeleton height="h-5" width="w-full" className="rounded" />
      <Skeleton height="h-4" width="w-3/4" className="rounded" />
      <Skeleton height="h-4" width="w-1/2" className="rounded" />
      <Skeleton height="h-4" width="w-20" className="rounded" />
    </div>
  </div>
);

export const SkeletonCategoryCard = ({ className = "" }: { className?: string }) => (
  <div className={`relative rounded-lg overflow-hidden shadow-lg h-80 md:h-90 ${className}`}>
    <Skeleton height="h-full" className="rounded-lg" />
    <div className="absolute bottom-0 left-0 right-0 p-6">
      <Skeleton height="h-6" width="w-3/4" className="rounded mb-2" />
      <Skeleton height="h-4" width="w-full" className="rounded" />
    </div>
  </div>
);

export const SkeletonSearchSection = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
    <div className="text-center max-w-2xl mx-auto px-4">
      <Skeleton height="h-12" width="w-48" className="rounded-full mx-auto mb-8" />
      <Skeleton height="h-16" width="w-3/4" className="rounded-lg mx-auto mb-6" />
      <Skeleton height="h-6" width="w-2/3" className="rounded mx-auto mb-12" />
      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height="h-16" className="rounded-2xl" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton height="h-4" width="w-24" className="rounded mx-auto" />
          <div className="flex flex-wrap gap-3 justify-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} height="h-10" width="w-32" className="rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonFeaturedTours = () => (
  <div className="py-16 bg-white">
    <div className="max-w-7xl mx-auto px-4">
      <SkeletonTitle className="mb-12" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonTourCard key={i} />
        ))}
      </div>
    </div>
  </div>
);

export const SkeletonMainTours = () => (
  <div className="py-16 bg-white">
    <div className="max-w-7xl mx-auto px-4">
      <SkeletonTitle className="mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonTourCard key={i} />
        ))}
      </div>
      <div className="text-center mt-8">
        <Skeleton height="h-12" width="w-40" className="rounded-xl mx-auto" />
      </div>
    </div>
  </div>
);

export const SkeletonTourCategories = () => (
  <div className="py-16 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4">
      <SkeletonTitle className="mb-8" />
      <div className="flex space-x-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height="h-48" width="w-64" className="rounded-2xl flex-shrink-0" />
        ))}
      </div>
    </div>
  </div>
);

export const SkeletonBlogSection = () => (
  <div className="py-16 bg-white">
    <div className="max-w-7xl mx-auto px-4">
      <SkeletonTitle className="mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {Array.from({ length: 2 }).map((_, i) => (
          <SkeletonCategoryCard key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBlogCard key={i} />
        ))}
      </div>
    </div>
  </div>
);
