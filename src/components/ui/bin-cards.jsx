import React from 'react';

// Import your SVG icons as React components using vite-plugin-svgr
import GeneralWasteIcon from '../../assets/general_waste_icon.svg';
import CommingledIcon from '../../assets/recycle_icon.svg';
import OrganicsIcon from '../../assets/organic_waste_icon.svg';
import PaperCardboardIcon from '../../assets/paper_waste_icon.svg';
import {Badge} from './badge'

// An icon map for quick lookup based on the card title
const iconMap = {
  "General Waste": GeneralWasteIcon,
  "Commingled": CommingledIcon,
  "Organics": OrganicsIcon,
  "Paper & Cardboard": PaperCardboardIcon,
};
const iconBgColorMap = {
    "General Waste": "bg-[#FDA4AF]",
    "Commingled": "bg-[#F59E0B]",
    "Organics": "bg-[#34D399]",
    "Paper & Cardboard": "bg-[#60A5FA]",
  };


/**
 * StatCard displays a single bin card with dynamic data.
 * It uses the icon and background color based on the bin type.
 *
 * @param {string} binName - The name of the bin.
 * @param {number} latestWeight - The most recent waste weight.
 * @param {number} binCapacity - The bin capacity.
 */
const StatCard = ({ binName, latestWeight, binCapacity }) => {
    const IconComponent = iconMap[binName];
    const iconBgColor = iconBgColorMap[binName] || "bg-gray-300";
    
    return (
      <div className="bg-white rounded-[30px] border p-6 shadow-sm relative">
        <div className={`absolute top-4 right-4 w-10 h-10 ${iconBgColor} rounded-full flex items-center justify-center`}>
          {IconComponent && <IconComponent className="w-6 h-6" />}
        </div>
        <div className="flex flex-col">
          <h3 className="text-gray-600 font-medium">{binName}</h3>
          <p className="text-sm text-gray-400">Bin Capacity {binCapacity}L</p>
          <div className="mt-4">
            <div className="flex items-baseline">
              <span className="text-6xl font-bold text-gray-600">{latestWeight}</span>
              <span className="ml-1 text-xl text-gray-600">Kgs</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Current Weight</p>
          </div>
        </div>
      </div>
    );
  };
  
  /**
   * BinCards renders a grid of StatCards for each bin.
   * @param {Array} binData - An array of bin objects, each containing:
   *  - _id: the bin's unique identifier.
   *  - binName: the name/type of the bin.
   *  - binCapacity: the capacity of the bin.
   *  - latestWeight: the most recent recorded waste weight.
   */
  const BinCards = ({ binData }) => {
    const lastUpdated = "11 AM AEDT";
    
    return (
      <div className="px-20 py-4">
        <div className="flex justify-end mb-4">
          <span className="text-sm text-gray-500">LAST UPDATED: {lastUpdated}</span>
        </div>
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