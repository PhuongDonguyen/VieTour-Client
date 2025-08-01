import React from 'react';

// Skeleton for account page headers
export const AccountHeaderSkeleton = () => (
  <div className="mb-6 animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
    <div className="h-4 bg-gray-200 rounded w-80" />
  </div>
);

// Skeleton for info cards (like user profile, security info)
export const AccountInfoCardSkeleton = () => (
  <div className="mb-6 p-4 bg-blue-50 rounded-lg animate-pulse">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-blue-200 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-blue-200 rounded w-32 mb-1" />
        <div className="h-3 bg-blue-200 rounded w-48" />
      </div>
    </div>
  </div>
);

// Skeleton for form cards
export const AccountFormCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-12 bg-gray-200 rounded" />
        </div>
      ))}
      <div className="h-12 bg-gray-200 rounded mt-6" />
    </div>
  </div>
);

// Skeleton for booking/request cards
export const AccountCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-40" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-48" />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 min-w-[160px] mt-4 md:mt-0">
          <div className="h-6 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>
      </div>
    </div>
  </div>
);

// Skeleton for empty state
export const AccountEmptyStateSkeleton = () => (
  <div className="text-center py-16 animate-pulse">
    <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6" />
    <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2" />
    <div className="h-4 bg-gray-200 rounded w-64 mx-auto" />
  </div>
);

// Main skeleton wrapper for account pages
export const AccountPageSkeleton = () => (
  <div className="space-y-6">
    <AccountHeaderSkeleton />
    <AccountInfoCardSkeleton />
    <AccountFormCardSkeleton />
  </div>
);

// Skeleton for list pages (bookings, requests)
export const AccountListSkeleton = () => (
  <div className="space-y-6">
    <AccountHeaderSkeleton />
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <AccountCardSkeleton key={i} />
      ))}
    </div>
  </div>
); 