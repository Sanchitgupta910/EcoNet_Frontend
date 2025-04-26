import React from 'react';
import { useBinStatus } from '../../hooks/useBinStatus';
import BinStatusCard from './BinStatusCard';

const getGridCols = (count) => {
  if (count <= 2) return 'grid-cols-1 md:grid-cols-2';
  if (count === 3) return 'grid-cols-1 md:grid-cols-3';
  if (count === 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  return 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5';
};

/**
 * RealTimeBinGrid
 * Fetches bin status via useBinStatus (which itself uses the socket hook),
 * and renders a grid of BinStatusCard that update in real time.
 *
 * @param {string} branchId  the branch to subscribe to
 */
export default function RealTimeBinGrid({ branchId }) {
  const { bins, isLoading, isError, error } = useBinStatus(branchId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center h-20">
        <p className="text-red-500">Error loading bins: {error.message}</p>
      </div>
    );
  }

  if (!bins.length) {
    return (
      <div className="flex justify-center items-center h-20">
        <p>No bin data available.</p>
      </div>
    );
  }

  return (
    <div className={`grid ${getGridCols(bins.length)} gap-4`}>
      {bins.map((bin) => (
        <BinStatusCard
          key={bin._id}
          binName={bin.binName}
          currentWeight={bin.currentWeight}
          binCapacity={bin.binCapacity}
          isActive={bin.isActive}
        />
      ))}
    </div>
  );
}
