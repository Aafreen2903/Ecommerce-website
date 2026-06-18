import React from 'react';

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder rounded-2xl p-4 flex flex-col h-full animate-pulse shadow-sm">
      <div className="w-full h-48 bg-gray-250 dark:bg-gray-800 rounded-xl mb-4 animate-shimmer"></div>
      <div className="h-4 bg-gray-250 dark:bg-gray-800 rounded w-1/3 mb-2 animate-shimmer"></div>
      <div className="h-5 bg-gray-250 dark:bg-gray-800 rounded w-3/4 mb-3 animate-shimmer"></div>
      <div className="h-4 bg-gray-250 dark:bg-gray-800 rounded w-1/2 mb-4 animate-shimmer"></div>
      <div className="mt-auto flex justify-between items-center pt-2">
        <div className="h-6 bg-gray-250 dark:bg-gray-800 rounded w-1/4 animate-shimmer"></div>
        <div className="h-9 bg-gray-250 dark:bg-gray-800 rounded w-1/3 animate-shimmer"></div>
      </div>
    </div>
  );
};

export const TableRowSkeleton = ({ cols = 5 }) => {
  return (
    <tr className="border-b border-gray-100 dark:border-darkBorder animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-shimmer"></div>
        </td>
      ))}
    </tr>
  );
};

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder p-6 rounded-2xl shadow-sm">
            <div className="h-4 bg-gray-250 dark:bg-gray-800 rounded w-1/3 mb-4 animate-shimmer"></div>
            <div className="h-8 bg-gray-250 dark:bg-gray-800 rounded w-1/2 animate-shimmer"></div>
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-darkCard border border-gray-100 dark:border-darkBorder p-6 rounded-2xl shadow-sm">
        <div className="h-6 bg-gray-250 dark:bg-gray-800 rounded w-1/4 mb-6 animate-shimmer"></div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-250 dark:bg-gray-800 rounded animate-shimmer"></div>
          ))}
        </div>
      </div>
    </div>
  );
};
