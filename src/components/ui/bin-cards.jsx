// import React, { useEffect, useState } from 'react';
// import GeneralWasteIcon from '../../assets/general_waste_icon.svg';
// import CommingledIcon from '../../assets/recycle_icon.svg';
// import OrganicsIcon from '../../assets/organic_waste_icon.svg';
// import PaperCardboardIcon from '../../assets/paper_waste_icon.svg';
// import { Badge } from './badge';

// // Mapping for bin icons based on bin type.
// const iconMap = {
//   "General Waste": GeneralWasteIcon,
//   "Commingled": CommingledIcon,
//   "Organics": OrganicsIcon,
//   "Paper & Cardboard": PaperCardboardIcon,
// };

// // Background color mapping for the icons.
// const iconBgColorMap = {
//   "General Waste": "bg-[#FDA4AF]",
//   "Commingled": "bg-[#F59E0B]",
//   "Organics": "bg-[#34D399]",
//   "Paper & Cardboard": "bg-[#60A5FA]",
// };

// // Single stat card component representing each bin.
// const StatCard = ({ binName, latestWeight, binCapacity, isUpdating }) => {
//   const IconComponent = iconMap[binName];
//   const iconBgColor = iconBgColorMap[binName] || "bg-gray-300";

//   // Local state to trigger a brief animation on weight update.
//   const [animate, setAnimate] = useState(false);

//   useEffect(() => {
//     setAnimate(true);
//     const timer = setTimeout(() => setAnimate(false), 1000);
//     return () => clearTimeout(timer);
//   }, [latestWeight]);

//   return (
//     <div className={`bg-white rounded-[30px] border p-6 shadow-sm relative transition-all duration-300 ${animate ? 'scale-105' : ''}`}>
//       <div className={`absolute top-4 right-4 w-10 h-10 ${iconBgColor} rounded-full flex items-center justify-center`}>
//         {IconComponent && <IconComponent className="w-6 h-6" />}
//       </div>
//       <div className="flex flex-col">
//         <h3 className="text-gray-600 font-medium">{binName}</h3>
//         <p className="text-sm text-gray-400">Bin Capacity {binCapacity}L</p>
//         <div className="mt-4">
//           <div className="flex items-baseline">
//             <span className={`text-6xl font-bold ${animate ? 'text-green-600' : 'text-gray-600'} transition-colors duration-300`}>
//               {latestWeight}
//             </span>
//             <span className="ml-1 text-xl text-gray-600">Kgs</span>
//           </div>
//           <p className="text-sm text-gray-500 mt-1">Current Weight</p>
//         </div>
//       </div>
//       {isUpdating && (
//         <div className="absolute inset-0 bg-black bg-opacity-10 rounded-[30px] flex items-center justify-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Component to render a grid of bin cards.
// const BinCards = ({ binData, isLoading = false, onRefresh }) => {
//   // State to hold the timestamp of the latest data update.
//   const [lastUpdated, setLastUpdated] = useState(new Date());
//   // Optional: Track bins that are currently updating.
//   const [updatingBins, setUpdatingBins] = useState(new Set());

//   // Update the last updated timestamp when binData changes.
//   useEffect(() => {
//     if (binData && binData.length > 0) {
//       setLastUpdated(new Date());
//     }
//   }, [binData]);

//   // Helper to format the last updated timestamp.
//   const formatLastUpdated = (date) => {
//     if (!date) return '';
//     return date.toLocaleTimeString('en-AU', {
//       hour: 'numeric',
//       minute: '2-digit',
//       hour12: true,
//       timeZoneName: 'short'
//     });
//   };

//   // Display a spinner if loading and there is no bin data.
//   if (isLoading && (!binData || binData.length === 0)) {
//     return (
//       <div className="px-20 py-4 flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="px-20 py-4">
//       {/* Header with optional refresh button and last updated info */}
//       <div className="flex justify-between items-center mb-4">
//         {onRefresh && (
//           <button
//             onClick={onRefresh}
//             className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//           >
//             Refresh Data
//           </button>
//         )}
//         <span className="text-sm text-gray-500">
//           LAST UPDATED: {formatLastUpdated(lastUpdated)}
//         </span>
//       </div>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//         {binData.map((bin) => (
//           <StatCard
//             key={bin._id}
//             binName={bin.binName}
//             latestWeight={bin.latestWeight}
//             binCapacity={bin.binCapacity}
//             isUpdating={updatingBins.has(bin._id)}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default BinCards;



import React, { useEffect, useState } from 'react';
import GeneralWasteIcon from '../../assets/general_waste_icon.svg';
import CommingledIcon from '../../assets/recycle_icon.svg';
import OrganicsIcon from '../../assets/organic_waste_icon.svg';
import PaperCardboardIcon from '../../assets/paper_waste_icon.svg';

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

const StatCard = ({ binName, latestWeight, binCapacity, isUpdating }) => {
  const IconComponent = iconMap[binName];
  const iconBgColor = iconBgColorMap[binName] || "bg-gray-300";
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setAnimate(true);
    const timer = setTimeout(() => setAnimate(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`bg-white rounded-[30px] border p-6 shadow-sm relative transition-all duration-300 ${animate ? 'scale-105' : ''}`}>
      <div className={`absolute top-4 right-4 w-10 h-10 ${iconBgColor} rounded-full flex items-center justify-center`}>
        {IconComponent && <IconComponent className="w-6 h-6" />}
      </div>
      <div className="flex flex-col">
        <h3 className="text-gray-600 font-medium">{binName}</h3>
        <p className="text-sm text-gray-400">Bin Capacity {binCapacity}L</p>
        <div className="mt-4">
          <div className="flex items-baseline">
            <span className={`text-6xl font-bold ${animate ? 'text-green-600' : 'text-gray-600'} transition-colors duration-300`}>
              {latestWeight}
            </span>
            <span className="ml-1 text-xl text-gray-600">Kgs</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Current Weight</p>
        </div>
      </div>
      {isUpdating && (
        <div className="absolute inset-0 bg-black bg-opacity-10 rounded-[30px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  );
};

const BinCards = ({ binData, isLoading = false, onRefresh }) => {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    if (binData && binData.length > 0) {
      setLastUpdated(new Date());
    }
  }, [binData]);

  const formatLastUpdated = (date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-AU', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    });
  };

  if (isLoading && (!binData || binData.length === 0)) {
    return (
      <div className="px-20 py-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="px-20 py-4">
      <div className="flex justify-between items-center mb-4">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh Data
          </button>
        )}
        <span className="text-sm text-gray-500">
          LAST UPDATED: {formatLastUpdated(lastUpdated)}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {binData.map((bin) => (
          <StatCard
            key={bin._id}
            binName={bin.binName}
            latestWeight={bin.latestWeight}
            binCapacity={bin.binCapacity}
            isUpdating={false}
          />
        ))}
      </div>
    </div>
  );
};

export default BinCards;
