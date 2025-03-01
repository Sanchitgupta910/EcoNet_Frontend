import React, { useEffect, useState } from 'react';
// Import SVG icons as React components using vite-plugin-svgr with the ?component query parameter.
import GeneralWasteIcon from '../../assets/general_waste_icon.svg';
import CommingledIcon from '../../assets/recycle_icon.svg';
import OrganicsIcon from '../../assets/organic_waste_icon.svg';
import PaperCardboardIcon from '../../assets/paper_waste_icon.svg';

/**
 * iconMap maps the bin names (as returned from the backend) to their corresponding SVG icon components.
 * The keys must match exactly with the binName field from the aggregated data.
 */
const iconMap = {
  "General Waste": GeneralWasteIcon,
  "Commingled": CommingledIcon,
  "Organic": OrganicsIcon,
  "Paper & Cardboard": PaperCardboardIcon,
};

/**
 * iconBgColorMap defines the background colors for the icons for each bin type.
 * These are maintained from your previous design.
 */
const iconBgColorMap = {
  "General Waste": "bg-[#FDA4AF]",
  "Commingled": "bg-[#F59E0B]",
  "Organic": "bg-[#34D399]",
  "Paper & Cardboard": "bg-[#60A5FA]",
};

/**
 * StatCard component renders an individual bin card.
 * It shows the bin's icon, capacity, and the latest weight.
 * An animation is triggered when the weight updates.
 *
 * @param {string} binName - The name/type of the bin.
 * @param {number} latestWeight - The most recent waste weight for the bin.
 * @param {number} binCapacity - The capacity of the bin.
 */
const StatCard = React.memo(({ binName, latestWeight, binCapacity }) => {
  // Retrieve the corresponding icon and background color for this bin.
  const IconComponent = iconMap[binName];
  const iconBgColor = iconBgColorMap[binName] || "bg-gray-300";

  // Local state to trigger an update animation when latestWeight changes.
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 1000);
    return () => clearTimeout(timer);
  }, [latestWeight]);

  return (
    <div
      className={`bg-white rounded-[10px] border p-6 relative transition-transform duration-300 ${
        animate ? 'scale-75' : ''
      }`}
    >
      {/* Icon container with dynamic background color */}
      <div
        className={`absolute top-4 right-4 w-14 h-14 ${iconBgColor} rounded-full flex items-center justify-center`}
      >
        {IconComponent && <IconComponent className="w-6 h-6" />}
      </div>
      <div className="flex flex-col">
        {/* Bin title */}
        <h2 className="text-gray-700 font-medium text-[22px] text-bold">{binName}</h2>
        {/* Bin capacity */}
        <p className="text-md text-gray-500">Bin Capacity: <span className="font-bold">{binCapacity}L</span></p>
        {/* Latest weight display with animation */}
        <div className="mt-4">
          <div className="flex items-baseline">
            <span className="text-8xl font-bold text-gray-600">{latestWeight}</span>
            <span className="ml-1 text-xl text-gray-700">Kgs</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Current Weight</p>
        </div>
      </div>
    </div>
  );
});

/**
 * BinCards component renders a grid of StatCards.
 * It receives the aggregated bin data from the backend via props.
 *
 * @param {Array} binData - Array of bin objects, each containing _id, binName, latestWeight, and binCapacity.
 * @param {boolean} isLoading - Indicates whether data is still loading.
 * @param {string|null} error - Contains an error message if fetching failed.
 */
const BinCards = ({ binData, isLoading, error, onRefresh }) => {
  // Log the received bin data for debugging (optional).
  useEffect(() => {
    // console.log("BinCards received binData:", binData);
  }, [binData]);

  if (isLoading) {
    return (
      <div className="px-20 py-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-20 py-4 flex justify-center items-center h-64">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!binData || binData.length === 0) {
    return (
      <div className="px-20 py-4 flex justify-center items-center h-64">
        <p>No bin data available.</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-4">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {binData.map((bin) => (
          <StatCard
            key={bin._id}
            binName={bin.binName}
            latestWeight={bin.latestWeight}
            binCapacity={bin.binCapacity}
          />
        ))}
      </div>
    </div>
  );
};

export default BinCards;
