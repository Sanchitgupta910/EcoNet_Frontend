import React from 'react';
import BinStatusCard from './BinStatusCard';

const getGridCols = (count) => {
  if (count <= 2) return 'grid-cols-1 md:grid-cols-2';
  if (count === 3) return 'grid-cols-1 md:grid-cols-3';
  if (count === 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  return 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5';
};

export default function BinGrid({ bins, loading }) {
  if (loading)
    return (
      <div className="flex justify-center items-center h-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  return (
    <div className={`grid ${getGridCols(bins.length)} gap-4`}>
      {bins.map((bin) => (
        <BinStatusCard
          key={bin._id}
          binName={bin.binName}
          currentWeight={bin.currentWeight}
          isActive={bin.isActive}
          binCapacity={bin.binCapacity}
        />
      ))}
    </div>
  );
}
