// "use client"

// import { useState, useEffect, useCallback } from "react"
// import { useSelector } from "react-redux"
// import axios from "axios"
// import { format } from "date-fns"
// import { Bell, LogOut, RefreshCw, TrendingUp } from "lucide-react"
// import NetNada_logo from "../assets/NetNada_logo.png"
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card"
// import { Button } from "../components/ui/Button"
// import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "../components/ui/Carousel"
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../components/ui/Tooltip"

// /**
//  * BinStatusCard component displays the status of a single bin
//  * @param {Object} props - Component props
//  * @param {string} props.binName - Name of the bin
//  * @param {number} props.currentWeight - Current weight of the bin in kg
//  * @param {boolean} props.isActive - Whether the bin is active
//  * @param {string} props.binType - Type of the bin (determines color)
//  */
// const BinStatusCard = ({ binName, currentWeight, isActive, binType }) => {
//   // Map bin types to their respective colors
//   const colorMap = {
//     "General Waste": "bg-[#FDA4AF]",
//     Commingled: "bg-[#F59E0B]",
//     Organic: "bg-[#34D399]",
//     "Paper & Cardboard": "bg-[#60A5FA]",
//     Glass: "bg-[#A78BFA]",
//   }

//   // Get the background color based on bin type, default to gray if not found
//   const bgColor = colorMap[binType] || "bg-gray-300"

//   return (
//     <Card className="shadow-sm">
//       <CardContent className="p-6">
//         <div className="flex justify-between items-start">
//           <div>
//             <div className="flex items-center mb-2">
//               <h3 className="text-xl font-semibold">{binName}</h3>
//               {/* Active status indicator */}
//               {isActive && (
//                 <div className="ml-2 relative">
//                   <div className="h-3 w-3 bg-green-500 rounded-full"></div>
//                   <div className="absolute inset-0 h-3 w-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
//                 </div>
//               )}
//             </div>
//             <div className="flex items-baseline">
//               <span className="text-4xl font-bold">{currentWeight}</span>
//               <span className="ml-1 text-lg text-gray-600">kg</span>
//             </div>
//             <p className="text-sm text-gray-500 mt-1">Current Weight</p>
//           </div>
//           <div className={`p-3 rounded-full ${bgColor}`}>
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-6 w-6 text-white"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//               />
//             </svg>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// /**
//  * TrendChart component displays waste data trends over the last day
//  * @param {Object} props - Component props
//  * @param {Array} props.data - Trend data points
//  */
// const TrendChart = ({ data }) => {
//   // If no data is provided, show a placeholder
//   if (!data || data.length === 0) {
//     return (
//       <Card className="shadow-sm">
//         <CardHeader>
//           <CardTitle className="text-lg font-semibold">Today's Waste Trend</CardTitle>
//           <CardDescription>Hourly waste generation throughout the day</CardDescription>
//         </CardHeader>
//         <CardContent className="flex items-center justify-center h-64">
//           <TrendingUp className="h-12 w-12 text-gray-300" />
//           <p className="ml-2 text-gray-500">No trend data available</p>
//         </CardContent>
//       </Card>
//     )
//   }

//   // In a real implementation, you would render a chart library here
//   // For this example, we'll just show a placeholder
//   return (
//     <Card className="shadow-sm">
//       <CardHeader>
//         <CardTitle className="text-lg font-semibold">Today's Waste Trend</CardTitle>
//         <CardDescription>Hourly waste generation throughout the day</CardDescription>
//       </CardHeader>
//       <CardContent className="h-64 p-4">
//         {/* Placeholder for chart - in a real implementation, use a chart library */}
//         <div className="h-full w-full bg-gray-50 rounded-md flex items-center justify-center">
//           <TrendingUp className="h-8 w-8 text-primary" />
//           <p className="ml-2 text-gray-600">Trend chart would render here</p>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// /**
//  * BranchContributionCard component displays the percentage contribution of the current branch
//  * @param {Object} props - Component props
//  * @param {number} props.percentage - Contribution percentage
//  * @param {string} props.branchName - Name of the branch
//  */
// const BranchContributionCard = ({ percentage, branchName }) => {
//   return (
//     <Card className="shadow-sm">
//       <CardHeader>
//         <CardTitle className="text-lg font-semibold">Branch Contribution</CardTitle>
//         <CardDescription>Relative to total company waste</CardDescription>
//       </CardHeader>
//       <CardContent className="p-6">
//         <div className="flex flex-col items-center">
//           <div className="relative w-32 h-32 mb-4">
//             <svg className="w-full h-full" viewBox="0 0 100 100">
//               <circle
//                 className="text-gray-200"
//                 strokeWidth="10"
//                 stroke="currentColor"
//                 fill="transparent"
//                 r="40"
//                 cx="50"
//                 cy="50"
//               />
//               <circle
//                 className="text-primary"
//                 strokeWidth="10"
//                 strokeDasharray={`${percentage * 2.51} 251`}
//                 strokeLinecap="round"
//                 stroke="currentColor"
//                 fill="transparent"
//                 r="40"
//                 cx="50"
//                 cy="50"
//               />
//             </svg>
//             <div className="absolute inset-0 flex items-center justify-center">
//               <span className="text-3xl font-bold">{percentage}%</span>
//             </div>
//           </div>
//           <p className="text-center text-gray-600">
//             {branchName} contributes {percentage}% of the total waste generated by your company
//           </p>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// /**
//  * EmployeeBinDisplayDashboard component for Employee Dashboard and Bin Display Users
//  */
// export default function EmployeeBinDisplayDashboard() {
//   // Get user data from Redux store
//   const user = useSelector((state) => state.user.user)

//   // State for bin status, trend data, and branch contribution
//   const [binStatus, setBinStatus] = useState([])
//   const [trendData, setTrendData] = useState([])
//   const [branchContribution, setBranchContribution] = useState(0)
//   const [lastUpdate, setLastUpdate] = useState(new Date())
//   const [nextUpdate, setNextUpdate] = useState(new Date(Date.now() + 3600000)) // 1 hour from now
//   const [isLoading, setIsLoading] = useState(true)

//   /**
//    * Fetch bin status data from the API
//    */
//   const fetchBinStatus = useCallback(async () => {
//     if (!user?.branchAddress?._id) return

//     try {
//       setIsLoading(true)
//       const response = await axios.get(`/api/v1/analytics/binStatus?branchId=${user.branchAddress._id}`, {
//         withCredentials: true,
//       })

//       if (response.data.success) {
//         setBinStatus(response.data.data)
//       }
//     } catch (error) {
//       console.error("Error fetching bin status:", error)
//       // Set some mock data for demonstration
//       setBinStatus([
//         { id: 1, binName: "General Waste", binType: "General Waste", currentWeight: 12.5, isActive: true },
//         { id: 2, binName: "Commingled", binType: "Commingled", currentWeight: 8.2, isActive: true },
//         { id: 3, binName: "Organic", binType: "Organic", currentWeight: 15.7, isActive: false },
//         { id: 4, binName: "Paper & Cardboard", binType: "Paper & Cardboard", currentWeight: 6.3, isActive: true },
//       ])
//     } finally {
//       setIsLoading(false)
//     }
//   }, [user])

//   /**
//    * Fetch minimal overview data from the API
//    */
//   const fetchMinimalOverview = useCallback(async () => {
//     if (!user?.branchAddress?._id) return

//     try {
//       const response = await axios.get(`/api/v1/analytics/minimalOverview?branchId=${user.branchAddress._id}`, {
//         withCredentials: true,
//       })

//       if (response.data.success) {
//         setTrendData(response.data.data.trendData)
//         setBranchContribution(response.data.data.branchContribution)
//       }
//     } catch (error) {
//       console.error("Error fetching minimal overview:", error)
//       // Set some mock data for demonstration
//       setTrendData([
//         { hour: "00:00", weight: 2.1 },
//         { hour: "01:00", weight: 1.5 },
//         { hour: "02:00", weight: 0.8 },
//         // ... more data points
//       ])
//       setBranchContribution(23)
//     }
//   }, [user])

//   // Fetch data on component mount and when user changes
//   useEffect(() => {
//     fetchBinStatus()
//     fetchMinimalOverview()

//     // Set up refresh interval (every hour)
//     const intervalId = setInterval(() => {
//       fetchBinStatus()
//       fetchMinimalOverview()
//       setLastUpdate(new Date())
//       setNextUpdate(new Date(Date.now() + 3600000))
//     }, 3600000)

//     return () => clearInterval(intervalId)
//   }, [fetchBinStatus, fetchMinimalOverview])

//   // If user data is not available, show loading state
//   if (!user) {
//     return <div className="flex items-center justify-center h-screen">Loading...</div>
//   }

//   // Determine the grid columns based on the number of bins
//   const getGridCols = (binCount) => {
//     if (binCount <= 2) return "grid-cols-1 md:grid-cols-2"
//     if (binCount === 3) return "grid-cols-1 md:grid-cols-3"
//     if (binCount === 4) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
//     return "grid-cols-1 md:grid-cols-3 lg:grid-cols-5" // For 5 bins
//   }

//   return (
//     <div className="min-h-screen bg-[#F9FAFB]">
//       {/* Header */}
//       <header className="bg-white border-b p-4 shadow-sm">
//         <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
//           {/* Left: Company logo */}
//           <div className="mb-4 md:mb-0">
//             <img src={user.company?.logo || NetNada_logo} alt="Company Logo" className="h-12" />
//           </div>

//           {/* Center: Company name and branch */}
//           <div className="text-center mb-4 md:mb-0">
//             <h1 className="text-xl font-bold">{user.company?.CompanyName || "Company Name"}</h1>
//             <p className="text-gray-600">{user.branchAddress?.officeName || "Branch Name"}</p>
//           </div>

//           {/* Right: Logout button and notification bell */}
//           <div className="flex items-center space-x-4">
//             <TooltipProvider>
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <Button variant="ghost" size="icon">
//                     <Bell className="h-5 w-5" />
//                   </Button>
//                 </TooltipTrigger>
//                 <TooltipContent>Notifications</TooltipContent>
//               </Tooltip>
//             </TooltipProvider>

//             <Button variant="outline" className="flex items-center">
//               <LogOut className="h-4 w-4 mr-2" />
//               Logout
//             </Button>
//           </div>
//         </div>
//       </header>

//       <main className="container mx-auto p-6 space-y-6">
//         {/* Refresh Label */}
//         <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
//           <div className="flex items-center">
//             <RefreshCw className="h-5 w-5 text-gray-500 mr-2" />
//             <span className="text-sm text-gray-600">
//               Last updated: {format(lastUpdate, "h:mm a")} | Next update: {format(nextUpdate, "h:mm a")}
//             </span>
//           </div>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => {
//               fetchBinStatus()
//               fetchMinimalOverview()
//               setLastUpdate(new Date())
//               setNextUpdate(new Date(Date.now() + 3600000))
//             }}
//           >
//             Refresh Now
//           </Button>
//         </div>

//         {/* Bin Status Cards */}
//         {isLoading ? (
//           <div className="flex justify-center items-center h-40">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
//           </div>
//         ) : (
//           <div className={`grid ${getGridCols(binStatus.length)} gap-4`}>
//             {binStatus.map((bin) => (
//               <BinStatusCard
//                 key={bin.id}
//                 binName={bin.binName}
//                 currentWeight={bin.currentWeight}
//                 isActive={bin.isActive}
//                 binType={bin.binType}
//               />
//             ))}
//           </div>
//         )}

//         {/* Static Tips Carousel */}
//         <Card className="shadow-sm overflow-hidden">
//           <CardHeader>
//             <CardTitle className="text-lg font-semibold">Waste Management Tips</CardTitle>
//           </CardHeader>
//           <CardContent className="p-0">
//             <Carousel className="w-full">
//               <CarouselContent>
//                 {/* Tip 1 */}
//                 <CarouselItem>
//                   <div className="relative aspect-[3/1] w-full overflow-hidden rounded-lg">
//                     <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center p-6">
//                       <div className="text-white text-center max-w-2xl">
//                         <h3 className="text-2xl font-bold mb-2">Reduce Single-Use Plastics</h3>
//                         <p>
//                           Switch to reusable water bottles, coffee cups, and shopping bags to significantly reduce your
//                           plastic waste footprint.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </CarouselItem>

//                 {/* Tip 2 */}
//                 <CarouselItem>
//                   <div className="relative aspect-[3/1] w-full overflow-hidden rounded-lg">
//                     <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center p-6">
//                       <div className="text-white text-center max-w-2xl">
//                         <h3 className="text-2xl font-bold mb-2">Compost Food Scraps</h3>
//                         <p>
//                           Food waste in landfills produces methane. Composting food scraps reduces greenhouse gas
//                           emissions and creates nutrient-rich soil.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </CarouselItem>

//                 {/* Tip 3 */}
//                 <CarouselItem>
//                   <div className="relative aspect-[3/1] w-full overflow-hidden rounded-lg">
//                     <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center p-6">
//                       <div className="text-white text-center max-w-2xl">
//                         <h3 className="text-2xl font-bold mb-2">Recycle Paper Properly</h3>
//                         <p>
//                           Remove staples, paper clips, and plastic windows from envelopes before recycling paper to
//                           ensure it can be processed efficiently.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </CarouselItem>
//               </CarouselContent>
//               <CarouselPrevious />
//               <CarouselNext />
//             </Carousel>
//           </CardContent>
//         </Card>

//         {/* Trend Chart and Branch Contribution */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           <TrendChart data={trendData} />
//           <BranchContributionCard
//             percentage={branchContribution}
//             branchName={user.branchAddress?.officeName || "Your Branch"}
//           />
//         </div>
//       </main>
//     </div>
//   )
// }

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { format } from 'date-fns';
import { Bell, LogOut, RefreshCw, TrendingUp } from 'lucide-react';
import NetNada_logo from '../assets/NetNada_logo.png';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '../components/ui/Carousel';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/Tooltip';

/**
 * BinStatusCard component displays the status of a single bin
 * @param {Object} props - Component props
 * @param {string} props.binName - Name of the bin
 * @param {number} props.currentWeight - Current weight of the bin in kg
 * @param {boolean} props.isActive - Whether the bin is active
 * @param {string} props.binType - Type of the bin (determines color)
 */
const BinStatusCard = ({ binName, currentWeight, isActive, binType }) => {
  // Map bin types to their respective colors
  const colorMap = {
    'General Waste': 'bg-[#FDA4AF]',
    Commingled: 'bg-[#F59E0B]',
    Organic: 'bg-[#34D399]',
    'Paper & Cardboard': 'bg-[#60A5FA]',
    Glass: 'bg-[#A78BFA]',
  };

  // Get the background color based on bin type, default to gray if not found
  const bgColor = colorMap[binType] || 'bg-gray-300';

  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center mb-2">
              <h3 className="text-xl font-semibold">{binName}</h3>
              {/* Active status indicator */}
              {isActive && (
                <div className="ml-2 relative">
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                  <div className="absolute inset-0 h-3 w-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
                </div>
              )}
            </div>
            <div className="flex items-baseline">
              <span className="text-4xl font-bold">{currentWeight}</span>
              <span className="ml-1 text-lg text-gray-600">kg</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Current Weight</p>
          </div>
          <div className={`p-3 rounded-full ${bgColor}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * TrendChart component displays waste data trends over the last day
 * @param {Object} props - Component props
 * @param {Array} props.data - Trend data points
 */
const TrendChart = ({ data }) => {
  // If no data is provided, show a placeholder
  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Today's Waste Trend</CardTitle>
          <CardDescription>Hourly waste generation throughout the day</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <TrendingUp className="h-12 w-12 text-gray-300" />
          <p className="ml-2 text-gray-500">No trend data available</p>
        </CardContent>
      </Card>
    );
  }

  // In a real implementation, you would render a chart library here
  // For this example, we'll just show a placeholder
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Today's Waste Trend</CardTitle>
        <CardDescription>Hourly waste generation throughout the day</CardDescription>
      </CardHeader>
      <CardContent className="h-64 p-4">
        {/* Placeholder for chart - in a real implementation, use a chart library */}
        <div className="h-full w-full bg-gray-50 rounded-md flex items-center justify-center">
          <TrendingUp className="h-8 w-8 text-primary" />
          <p className="ml-2 text-gray-600">Trend chart would render here</p>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * BranchContributionCard component displays the percentage contribution of the current branch
 * @param {Object} props - Component props
 * @param {number} props.percentage - Contribution percentage
 * @param {string} props.branchName - Name of the branch
 */
const BranchContributionCard = ({ percentage, branchName }) => {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Branch Contribution</CardTitle>
        <CardDescription>Relative to total company waste</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 mb-4">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-gray-200"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
              <circle
                className="text-primary"
                strokeWidth="10"
                strokeDasharray={`${percentage * 2.51} 251`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold">{percentage}%</span>
            </div>
          </div>
          <p className="text-center text-gray-600">
            {branchName} contributes {percentage}% of the total waste generated by your company
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * EmployeeBinDisplayDashboard component for Employee Dashboard and Bin Display Users
 */
export default function EmployeeBinDisplayDashboard() {
  // Get user data from Redux store
  const user = useSelector((state) => state.user.user);

  // State for bin status, trend data, and branch contribution
  const [binStatus, setBinStatus] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [branchContribution, setBranchContribution] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [nextUpdate, setNextUpdate] = useState(new Date(Date.now() + 3600000)); // 1 hour from now
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Logout handler: call the logout API and redirect to login page.
   */
  const handleLogout = async () => {
    try {
      const response = await axios.post('/api/v1/users/logout', {}, { withCredentials: true });
      if (response.data.success) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  /**
   * Fetch bin status data from the API
   */
  const fetchBinStatus = useCallback(async () => {
    if (!user?.branchAddress?._id) return;

    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/v1/analytics/binStatus?branchId=${user.branchAddress._id}`,
        {
          withCredentials: true,
        },
      );

      if (response.data.success) {
        setBinStatus(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching bin status:', error);
      // Set some mock data for demonstration
      setBinStatus([
        {
          id: 1,
          binName: 'General Waste',
          binType: 'General Waste',
          currentWeight: 12.5,
          isActive: true,
        },
        { id: 2, binName: 'Commingled', binType: 'Commingled', currentWeight: 8.2, isActive: true },
        { id: 3, binName: 'Organic', binType: 'Organic', currentWeight: 15.7, isActive: false },
        {
          id: 4,
          binName: 'Paper & Cardboard',
          binType: 'Paper & Cardboard',
          currentWeight: 6.3,
          isActive: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Fetch minimal overview data from the API
   */
  const fetchMinimalOverview = useCallback(async () => {
    if (!user?.branchAddress?._id) return;

    try {
      const response = await axios.get(
        `/api/v1/analytics/minimalOverview?branchId=${user.branchAddress._id}`,
        {
          withCredentials: true,
        },
      );

      if (response.data.success) {
        setTrendData(response.data.data.trendData);
        setBranchContribution(response.data.data.branchContribution);
      }
    } catch (error) {
      console.error('Error fetching minimal overview:', error);
      // Set some mock data for demonstration
      setTrendData([
        { hour: '00:00', weight: 2.1 },
        { hour: '01:00', weight: 1.5 },
        { hour: '02:00', weight: 0.8 },
        // ... more data points
      ]);
      setBranchContribution(23);
    }
  }, [user]);

  // Fetch data on component mount and when user changes
  useEffect(() => {
    fetchBinStatus();
    fetchMinimalOverview();

    // Set up refresh interval (every hour)
    const intervalId = setInterval(() => {
      fetchBinStatus();
      fetchMinimalOverview();
      setLastUpdate(new Date());
      setNextUpdate(new Date(Date.now() + 3600000));
    }, 3600000);

    return () => clearInterval(intervalId);
  }, [fetchBinStatus, fetchMinimalOverview]);

  // If user data is not available, show loading state
  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Determine the grid columns based on the number of bins
  const getGridCols = (binCount) => {
    if (binCount <= 2) return 'grid-cols-1 md:grid-cols-2';
    if (binCount === 3) return 'grid-cols-1 md:grid-cols-3';
    if (binCount === 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    return 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5'; // For 5 bins
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b p-4 shadow-sm">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          {/* Left: Company logo */}
          <div className="mb-4 md:mb-0">
            <img src={user.company?.logo || NetNada_logo} alt="Company Logo" className="h-12" />
          </div>

          {/* Center: Company name and branch */}
          <div className="text-center mb-4 md:mb-0">
            <h1 className="text-xl font-bold">{user.company?.CompanyName || 'Company Name'}</h1>
            <p className="text-gray-600">{user.branchAddress?.officeName || 'Branch Name'}</p>
          </div>

          {/* Right: Logout button and notification bell */}
          <div className="flex items-center space-x-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button variant="outline" className="flex items-center" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 space-y-6">
        {/* Refresh Label */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <RefreshCw className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-sm text-gray-600">
              Last updated: {format(lastUpdate, 'h:mm a')} | Next update:{' '}
              {format(nextUpdate, 'h:mm a')}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchBinStatus();
              fetchMinimalOverview();
              setLastUpdate(new Date());
              setNextUpdate(new Date(Date.now() + 3600000));
            }}
          >
            Refresh Now
          </Button>
        </div>

        {/* Bin Status Cards */}
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className={`grid ${getGridCols(binStatus.length)} gap-4`}>
            {binStatus.map((bin) => (
              <BinStatusCard
                key={bin.id}
                binName={bin.binName}
                currentWeight={bin.currentWeight}
                isActive={bin.isActive}
                binType={bin.binType}
              />
            ))}
          </div>
        )}

        {/* Static Tips Carousel */}
        <Card className="shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Waste Management Tips</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Carousel className="w-full">
              <CarouselContent>
                {/* Tip 1 */}
                <CarouselItem>
                  <div className="relative aspect-[3/1] w-full overflow-hidden rounded-lg">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center p-6">
                      <div className="text-white text-center max-w-2xl">
                        <h3 className="text-2xl font-bold mb-2">Reduce Single-Use Plastics</h3>
                        <p>
                          Switch to reusable water bottles, coffee cups, and shopping bags to
                          significantly reduce your plastic waste footprint.
                        </p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Tip 2 */}
                <CarouselItem>
                  <div className="relative aspect-[3/1] w-full overflow-hidden rounded-lg">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center p-6">
                      <div className="text-white text-center max-w-2xl">
                        <h3 className="text-2xl font-bold mb-2">Compost Food Scraps</h3>
                        <p>
                          Food waste in landfills produces methane. Composting food scraps reduces
                          greenhouse gas emissions and creates nutrient-rich soil.
                        </p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Tip 3 */}
                <CarouselItem>
                  <div className="relative aspect-[3/1] w-full overflow-hidden rounded-lg">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center p-6">
                      <div className="text-white text-center max-w-2xl">
                        <h3 className="text-2xl font-bold mb-2">Recycle Paper Properly</h3>
                        <p>
                          Remove staples, paper clips, and plastic windows from envelopes before
                          recycling paper to ensure it can be processed efficiently.
                        </p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </CardContent>
        </Card>

        {/* Trend Chart and Branch Contribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart data={trendData} />
          <BranchContributionCard
            percentage={branchContribution}
            branchName={user.branchAddress?.officeName || 'Your Branch'}
          />
        </div>
      </main>
    </div>
  );
}
