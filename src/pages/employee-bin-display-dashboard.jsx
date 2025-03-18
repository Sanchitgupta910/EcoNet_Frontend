'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../app/userSlice';
import axios from 'axios';
import { format } from 'date-fns';
import { Bell, LogOut, RefreshCw, TrendingUp, ArrowUpRight, Recycle } from 'lucide-react';
import WasteLineChart from '../components/ui/WasteLineChart';
import NetNada_logo from '../assets/NetNada_logo.png';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  // Removed CarouselPrevious and CarouselNext since arrows are not needed
} from '../components/ui/Carousel';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/Tooltip';

/**
 * BinStatusCard - Displays the status of a single bin with a modern, professional design.
 * Uses subtle colors and minimal gradients for a sleek appearance.
 *
 * @param binName - Name of the bin (determines color scheme)
 * @param currentWeight - Current weight in Kgs
 * @param isActive - Whether the bin is active
 * @param binCapacity - Capacity of the bin in liters
 * @param customIcon - Custom icon component (Lucide icon or custom SVG)
 *
 * CUSTOM SVG USAGE:
 * To use a custom SVG icon instead of the default Recycle icon:
 *
 * 1. Import your SVG as a React component:
 *    import { ReactComponent as MyCustomIcon } from './path-to-icon.svg';
 *    OR
 *    import MyCustomIcon from './my-custom-icon';
 *
 * 2. Pass it to the BinStatusCard:
 *    <BinStatusCard
 *      customIcon={<MyCustomIcon className="h-5 w-5 text-white" />}
 *      ...other props
 *    />
 *
 * Note: Make sure your SVG icon has appropriate size (h-5 w-5) and color (text-white)
 */
const BinStatusCard = ({ binName, currentWeight, isActive, binCapacity, customIcon = null }) => {
  // Refined color palette with more subtle, professional tones
  const getColors = (name) => {
    if (!name) {
      return {
        border: 'border-sky-200',
        bg: 'bg-gradient-to-b from-white to-sky-50',
        accent: 'bg-sky-500',
        text: 'text-sky-700',
        indicator: 'bg-sky-100',
        muted: 'text-sky-600/70',
      };
    }

    const nameLower = name.toLowerCase();

    if (nameLower.includes('general') || nameLower.includes('waste')) {
      return {
        border: 'border-rose-200',
        bg: 'bg-gradient-to-b from-white to-rose-50',
        accent: 'bg-rose-500',
        text: 'text-rose-700',
        indicator: 'bg-rose-100',
        muted: 'text-rose-600/70',
      };
    } else if (nameLower.includes('commingled') || nameLower.includes('mixed')) {
      return {
        border: 'border-amber-200',
        bg: 'bg-gradient-to-b from-white to-amber-50',
        accent: 'bg-amber-500',
        text: 'text-amber-700',
        indicator: 'bg-amber-100',
        muted: 'text-amber-600/70',
      };
    } else if (nameLower.includes('organic')) {
      return {
        border: 'border-emerald-200',
        bg: 'bg-gradient-to-b from-white to-emerald-50',
        accent: 'bg-emerald-500',
        text: 'text-emerald-700',
        indicator: 'bg-emerald-100',
        muted: 'text-emerald-600/70',
      };
    } else if (nameLower.includes('paper') || nameLower.includes('cardboard')) {
      return {
        border: 'border-blue-200',
        bg: 'bg-gradient-to-b from-white to-blue-50',
        accent: 'bg-blue-500',
        text: 'text-blue-700',
        indicator: 'bg-blue-100',
        muted: 'text-blue-600/70',
      };
    } else if (nameLower.includes('glass')) {
      return {
        border: 'border-purple-200',
        bg: 'bg-gradient-to-b from-white to-purple-50',
        accent: 'bg-purple-500',
        text: 'text-purple-700',
        indicator: 'bg-purple-100',
        muted: 'text-purple-600/70',
      };
    } else {
      return {
        border: 'border-sky-200',
        bg: 'bg-gradient-to-b from-white to-sky-50',
        accent: 'bg-sky-500',
        text: 'text-sky-700',
        indicator: 'bg-sky-100',
        muted: 'text-sky-600/70',
      };
    }
  };

  // Use binName for the color lookup
  const colors = getColors(binName);

  // Default icon if no customIcon is provided
  const defaultIcon = <Recycle className="h-5 w-5 text-white" />;

  return (
    <Card
      className={`overflow-hidden ${colors.bg} ${colors.border} border shadow-sm hover:shadow-md transition-shadow duration-200`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          {/* Bin name with active indicator */}
          <div className="flex items-center">
            <h3 className={`text-base font-medium ${colors.text}`}>{binName}</h3>
            {isActive && (
              <div className="ml-2 h-2 w-2 bg-green-500 rounded-full shadow-[0_0_6px_rgba(34,197,94,0.5)] animate-pulse"></div>
            )}
          </div>

          {/* Icon */}
          <div
            className={`h-8 w-8 ${colors.accent} rounded-md flex items-center justify-center shadow-sm`}
          >
            {customIcon || defaultIcon}
          </div>
        </div>

        {/* Combined info in a more compact layout */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className={`w-0.5 h-6 rounded-full ${colors.accent} mr-2`}></div>
            <div>
              <p className="text-xs text-gray-500">Capacity</p>
              <p className={`text-sm font-medium ${colors.text}`}>{binCapacity}L</p>
            </div>
          </div>
        </div>

        {/* Weight display - more sleek and compact */}
        <div className={`p-3 ${colors.indicator} rounded-md mt-1`}>
          <div className="flex items-baseline justify-between">
            <p className={`text-xs ${colors.muted}`}>Current Weight</p>
            <div className="flex items-baseline">
              <span className={`text-2xl font-bold tracking-tight ${colors.text}`}>
                {currentWeight}
              </span>
              <span className="ml-1 text-sm text-gray-500">Kgs</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
/**
 * LineChart - Displays a multi-line chart for bin weights over time.
 * Replaced fixed heights with flex-based classes so it expands dynamically.
 */
const LineChart = ({ data, bins }) => {
  if (!data || data.length === 0 || !bins || bins.length === 0) {
    return (
      <Card className="shadow-sm border border-gray-100/50 backdrop-blur-sm bg-white/80 flex flex-col h-full">
        <CardHeader className="pb-2 border-b border-gray-100/50">
          <CardTitle className="text-base font-medium text-gray-800">Waste Trend</CardTitle>
          <CardDescription className="text-xs text-gray-500">
            Hourly waste generation by bin type
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center p-4">
          <TrendingUp className="h-8 w-8 text-gray-300" />
          <p className="ml-2 text-gray-500 text-sm">No trend data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-gray-100/50 backdrop-blur-sm bg-white/80 flex flex-col h-full">
      <CardHeader className="pb-2 border-b border-gray-100/50">
        <CardTitle className="text-base font-medium text-gray-800">Waste Trend</CardTitle>
        <CardDescription className="text-xs text-gray-500">
          Hourly waste generation by bin type
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <div className="flex items-center justify-center h-full w-full bg-gray-50/50 rounded-md">
          <TrendingUp className="h-5 w-5 text-primary" />
          <p className="ml-2 text-gray-600 text-sm">
            Multi-line chart would render here with {bins.length} lines
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * DiversionRateCard - Displays the diversion rate with a visual indicator.
 */
const DiversionRateCard = ({ rate = 0 }) => {
  return (
    <Card className="shadow-sm border border-gray-100/50 backdrop-blur-sm bg-white/80 flex flex-col h-full">
      <CardHeader className="pb-2 border-b border-gray-100/50">
        <CardTitle className="text-base font-medium text-gray-800">Diversion Rate</CardTitle>
        <CardDescription className="text-xs text-gray-500">
          Waste diverted from landfill
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-4 flex flex-col items-center justify-center">
        <div className="relative w-24 h-24 mb-2">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-gray-200"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className="text-emerald-500"
              strokeWidth="8"
              strokeDasharray={`${rate * 2.51} 251`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <span className="text-2xl font-bold text-gray-800">{rate}%</span>
            </div>
          </div>
        </div>
        <div className="flex items-center text-xs text-emerald-600 font-medium">
          <ArrowUpRight className="h-3 w-3 mr-1" />
          <span>5.2% increase from last week</span>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * BranchContributionCard - Displays the branch's contribution percentage.
 */
const BranchContributionCard = ({ percentage, branchName }) => {
  return (
    <Card className="shadow-sm border border-gray-100/50 backdrop-blur-sm bg-white/80 flex flex-col h-full">
      <CardHeader className="pb-2 border-b border-gray-100/50">
        <CardTitle className="text-base font-medium text-gray-800">Branch Contribution</CardTitle>
        <CardDescription className="text-xs text-gray-500">
          Relative to total company waste
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-4 flex flex-col items-center justify-center">
        <div className="relative w-24 h-24 mb-2">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-gray-200"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className="text-blue-500"
              strokeWidth="8"
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
            <span className="text-2xl font-bold text-gray-800">{percentage}%</span>
          </div>
        </div>
        <p className="text-center text-xs text-gray-600">
          {branchName} contributes {percentage}% of the total waste
        </p>
      </CardContent>
    </Card>
  );
};

/**
 * TipsCarousel - Compact carousel for waste management tips.
 * Auto-plays every 3 seconds while allowing manual scrolling.
 */
const TipsCarousel = () => {
  const slides = ['../src/assets/Tip1.png', '../src/assets/Tip2.png', '../src/assets/Tip3.png'];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-play effect: change slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <Card className="shadow-sm border border-gray-100/50 backdrop-blur-sm bg-white/80 flex flex-col h-full rounded-lg overflow-hidden">
      <CardContent className="flex-1 p-0">
        <div className="w-full h-full overflow-x-auto whitespace-nowrap scroll-smooth">
          <div
            className="flex h-full"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              transition: 'transform 0.5s ease-in-out',
            }}
          >
            {slides.map((src, index) => (
              <div key={index} className="flex-shrink-0 w-full h-full">
                <img src={src} alt={`Tip ${index + 1}`} className="object-cover w-full h-full" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * EmployeeBinDisplayDashboard - Main dashboard component.
 * The grid layout for bin cards is dynamic and will adjust if the number of bins changes.
 */
export default function EmployeeBinDisplayDashboard() {
  const user = useSelector((state) => state.user.user);
  const [binStatus, setBinStatus] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [branchContribution, setBranchContribution] = useState(0);
  const [diversionRate, setDiversionRate] = useState(65);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [nextUpdate, setNextUpdate] = useState(new Date(Date.now() + 3600000));
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  const fetchBinStatus = useCallback(async () => {
    const branchId = user?.OrgUnit?.branchAddress?._id;
    if (!branchId) {
      console.error('Branch ID is missing from the user data.');
      return;
    }
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/v1/analytics/binStatus?branchId=${branchId}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        const bins = response.data.data;
        const updatedBins = await Promise.all(
          bins.map(async (bin) => {
            try {
              const latestResponse = await axios.get(
                `/api/v1/analytics/latestBinWeight?binId=${bin._id}`,
                { withCredentials: true },
              );
              if (latestResponse.data.success && latestResponse.data.data) {
                return {
                  ...bin,
                  currentWeight: latestResponse.data.data.currentWeight,
                  binCapacity: bin.binCapacity || 20,
                };
              }
              return { ...bin, binCapacity: bin.binCapacity || 20 };
            } catch (err) {
              console.error(`Error fetching latest weight for bin ${bin._id}:`, err);
              return { ...bin, binCapacity: bin.binCapacity || 20 };
            }
          }),
        );
        setBinStatus(updatedBins);
      }
    } catch (error) {
      console.error('Error fetching bin status:', error);
      // Removed dummy data fallback
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const fetchMinimalOverview = useCallback(async () => {
    const branchId = user?.OrgUnit?.branchAddress?._id;
    if (!branchId) {
      console.error('Branch ID is missing from the user data.');
      return;
    }
    try {
      const response = await axios.get(`/api/v1/analytics/minimalOverview?branchId=${branchId}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setTrendData(response.data.data.trendData);
        setBranchContribution(response.data.data.branchContribution);
        if (response.data.data.diversionRate) {
          setDiversionRate(response.data.data.diversionRate);
        }
      }
    } catch (error) {
      console.error('Error fetching minimal overview:', error);
      setTrendData([
        { hour: '00:00', weight: 2.1 },
        { hour: '01:00', weight: 1.5 },
        { hour: '02:00', weight: 0.8 },
      ]);
      setBranchContribution(23);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      const response = await axios.post('/api/v1/users/logout', {}, { withCredentials: true });
      if (response.data.success) {
        dispatch(clearUser());
        // sessionStorage.clear();

        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    fetchBinStatus();
    fetchMinimalOverview();
    const intervalId = setInterval(() => {
      fetchBinStatus();
      fetchMinimalOverview();
      setLastUpdate(new Date());
      setNextUpdate(new Date(Date.now() + 3600000));
    }, 3600000);
    return () => clearInterval(intervalId);
  }, [fetchBinStatus, fetchMinimalOverview]);

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const getGridCols = (binCount) => {
    if (binCount <= 2) return 'grid-cols-1 md:grid-cols-2';
    if (binCount === 3) return 'grid-cols-1 md:grid-cols-3';
    if (binCount === 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    return 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5';
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 py-3 px-4 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <img src={user.company?.logo || NetNada_logo} alt="Company Logo" className="h-8" />
            <div className="ml-3 border-l border-gray-200 pl-3">
              <h1 className="text-sm font-medium text-gray-800">
                {user.company?.CompanyName || 'Company Name'}
              </h1>
              <p className="text-xs text-gray-500">
                {user?.OrgUnit?.branchAddress?.address || 'Branch Address'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-xs text-gray-500 mr-2">
              <RefreshCw className="h-3 w-3 mr-1" />
              <span>Updated: {format(lastUpdate, 'h:mm a')}</span>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Bell className="h-4 w-4 text-gray-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleLogout}>
              <LogOut className="h-3 w-3 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main content centered vertically */}
      <main className="flex-1 container mx-auto p-4 flex flex-col justify-center space-y-4 overflow-hidden">
        {/* First Row: Bin Status Cards */}
        {isLoading ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className={`grid ${getGridCols(binStatus.length)} gap-4`}>
            {binStatus.map((bin) => (
              <BinStatusCard
                key={bin._id}
                binName={bin.binName}
                currentWeight={bin.currentWeight}
                isActive={bin.isActive}
                binType={bin.binType}
                binCapacity={bin.binCapacity}
              />
            ))}
          </div>
        )}

        {/* Mid Row: Full-width Line Chart with dynamic height */}
        <div className="h-[calc(38vh)]">
          <WasteLineChart branchId={user?.OrgUnit?.branchAddress?._id} />
        </div>

        {/* Last Row: Three Columns with fixed height and bottom margin */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[220px] mb-4">
          <DiversionRateCard rate={diversionRate} />
          <BranchContributionCard
            percentage={branchContribution}
            branchName={user?.OrgUnit?.branchAddress?.officeName || 'Your Branch'}
          />
          <TipsCarousel />
        </div>
      </main>
    </div>
  );
}
