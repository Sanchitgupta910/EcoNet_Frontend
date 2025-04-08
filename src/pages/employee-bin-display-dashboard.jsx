'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser, setUser as updateUser } from '../app/userSlice';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Bell,
  LogOut,
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Recycle,
} from 'lucide-react';
import WasteLineChart from '../components/ui/WasteLineChart';
import NetNada_logo from '../assets/NetNada_logo.png';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/Tooltip';

/* -------------------------------------------------------------------------
   DiversionRateCard Component
   Retrieves and displays today's landfill diversion data.
------------------------------------------------------------------------- */
const DiversionRateCard = () => {
  const [diversionData, setDiversionData] = useState({ diversionPercentage: 0, trendValue: 0 });
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.user.user);

  // Determine OrgUnit ID from user state
  const orgUnitId = user?.OrgUnit?.branchAddress?._id || user?.OrgUnit?._id || null;

  const fetchDiversionData = async () => {
    if (!orgUnitId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/v1/analytics/adminOverview?filter=today&orgUnitId=${orgUnitId}`,
        { withCredentials: true },
      );
      if (response.data.success) {
        const { landfillDiversionPercentage, landfillDiversionTrend } = response.data.data;
        setDiversionData({
          diversionPercentage: landfillDiversionPercentage || 0,
          trendValue: landfillDiversionTrend || 0,
        });
      }
    } catch {
      // Silently fail (or add proper error handling if needed)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orgUnitId) {
      fetchDiversionData();
    }
  }, [orgUnitId]);

  return (
    <Card className="shadow-sm border bg-white flex flex-col h-full">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="text-base font-medium text-gray-800">Landfill Diversion</CardTitle>
        <CardDescription className="text-xs text-gray-500">
          Waste diverted from landfill (Today)
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
              className="text-green-500"
              strokeWidth="8"
              strokeDasharray={`${diversionData.diversionPercentage * 2.51} 251`}
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
              <span className="text-sm font-bold text-gray-800">
                {loading ? '...' : `${diversionData.diversionPercentage.toFixed(1)}%`}
              </span>
            </div>
          </div>
        </div>
        <div
          className="flex items-center text-xs font-medium"
          style={{
            color: loading
              ? 'gray'
              : diversionData.trendValue > 0
              ? 'green'
              : diversionData.trendValue < 0
              ? 'red'
              : 'gray',
          }}
        >
          {loading ? (
            <span>Loading trend...</span>
          ) : diversionData.trendValue !== 0 ? (
            diversionData.trendValue > 0 ? (
              <span className="flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" /> {diversionData.trendValue.toFixed(2)}%
                increase from yesterday
              </span>
            ) : (
              <span className="flex items-center">
                <ArrowDownRight className="h-3 w-3 mr-1" />{' '}
                {Math.abs(diversionData.trendValue).toFixed(2)}% decrease from yesterday
              </span>
            )
          ) : (
            <span>No change</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/* -------------------------------------------------------------------------
   BinStatusCard Component
   Displays the status of a bin.
------------------------------------------------------------------------- */
const BinStatusCard = ({ binName, currentWeight, isActive, binCapacity, customIcon = null }) => {
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

  const colors = getColors(binName);
  const defaultIcon = <Recycle className="h-5 w-5 text-white" />;
  return (
    <Card
      className={`overflow-hidden ${colors.bg} ${colors.border} border shadow-sm hover:shadow-md transition-shadow duration-200`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <h3 className={`text-base font-medium ${colors.text}`}>{binName}</h3>
            {isActive && (
              <div className="ml-2 h-2 w-2 bg-green-500 rounded-full shadow-[0_0_6px_rgba(34,197,94,0.5)] animate-pulse"></div>
            )}
          </div>
          <div
            className={`h-8 w-8 ${colors.accent} rounded-md flex items-center justify-center shadow-sm`}
          >
            {customIcon || defaultIcon}
          </div>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className={`w-0.5 h-6 rounded-full ${colors.accent} mr-2`}></div>
            <div>
              <p className="text-xs text-gray-500">Capacity</p>
              <p className={`text-sm font-medium ${colors.text}`}>{binCapacity}L</p>
            </div>
          </div>
        </div>
        <div className={`p-3 ${colors.indicator} rounded-md mt-1`}>
          <div className="flex items-baseline justify-between">
            <p className={`text-xs ${colors.muted}`}>Current Weight</p>
            <div className="flex items-baseline">
              <span className={`text-2xl font-bold tracking-tight ${colors.text}`}>
                {Number(currentWeight).toFixed(2)}
              </span>
              <span className="ml-1 text-sm text-gray-500">Kgs</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/* -------------------------------------------------------------------------
   LineChart Component
   Displays waste trend data.
------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------
   BranchContributionCard Component
   Displays the branch's contribution percentage.
------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------
   TipsCarousel Component
   Displays a carousel of tip images.
------------------------------------------------------------------------- */
const TipsCarousel = () => {
  // Note: It's best to import assets so that the bundler resolves the paths.
  const slides = ['../src/assets/Tip1.png', '../src/assets/Tip2.png', '../src/assets/Tip3.png'];
  const [currentIndex, setCurrentIndex] = useState(0);
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
                <img
                  src={src || '/placeholder.svg'}
                  alt={`Tip ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

/* -------------------------------------------------------------------------
   EmployeeBinDisplayDashboard Component
   Main dashboard for displaying bin and analytics data.
------------------------------------------------------------------------- */
export default function EmployeeBinDisplayDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const fromAdmin = location.state?.fromAdmin || false;
  const selectedOffice = location.state?.office;
  const storedUser = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  // Local state for user; using setUserState avoids conflict with updateUser.
  const [user, setUserState] = useState(storedUser);
  const [officeFromAdmin] = useState(selectedOffice || null);
  const [orgUnitOverrideDone, setOrgUnitOverrideDone] = useState(false);
  const [binStatus, setBinStatus] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [branchContribution, setBranchContribution] = useState(0);
  const [diversionRate, setDiversionRate] = useState(65);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [nextUpdate, setNextUpdate] = useState(new Date(Date.now() + 3600000));
  const [isLoading, setIsLoading] = useState(true);
  const prevBinStatusRef = useRef([]);

  // OrgUnit override effect: when navigating from Admin, update user.OrgUnit (and company if provided)
  useEffect(() => {
    if (fromAdmin && officeFromAdmin && user && !orgUnitOverrideDone) {
      const normalizedOffice = { ...officeFromAdmin, branchAddress: officeFromAdmin };
      let updatedUser = { ...user, OrgUnit: normalizedOffice };
      dispatch(updateUser(updatedUser));
      setUserState(updatedUser);
      const companyFromNav = location.state?.company;
      if (companyFromNav && typeof companyFromNav === 'object') {
        updatedUser = { ...updatedUser, company: companyFromNav };
        dispatch(updateUser(updatedUser));
        setUserState(updatedUser);
        setOrgUnitOverrideDone(true);
      } else {
        const fetchCompany = async () => {
          try {
            const { data } = await axios.get(
              `/api/v1/company/${officeFromAdmin.associatedCompany}`,
              { withCredentials: true },
            );
            if (data.success && data.data) {
              updatedUser = { ...updatedUser, company: data.data };
            }
          } catch {
            // Fallback: use existing company data
          } finally {
            dispatch(updateUser(updatedUser));
            setUserState(updatedUser);
            setOrgUnitOverrideDone(true);
          }
        };
        fetchCompany();
      }
    }
  }, [fromAdmin, officeFromAdmin, user, orgUnitOverrideDone, dispatch, location.state]);

  // Helper to check deep equality of bin arrays.
  const areBinsEqual = (bins1, bins2) => {
    if (bins1.length !== bins2.length) return false;
    for (let i = 0; i < bins1.length; i++) {
      if (bins1[i]._id !== bins2[i]._id || bins1[i].currentWeight !== bins2[i].currentWeight) {
        return false;
      }
    }
    return true;
  };

  // Compute branchId once using useMemo.
  const branchId = useMemo(
    () => user?.OrgUnit?.branchAddress?._id || user?.OrgUnit?._id || null,
    [user],
  );

  // Fetch bin status for the branch.
  const fetchBinStatus = useCallback(async () => {
    if (!branchId) return;
    try {
      const response = await axios.get(
        `/api/v1/binDashboardAnalytics/binStatus?branchId=${branchId}`,
        {
          withCredentials: true,
        },
      );
      if (response.data.success) {
        const bins = response.data.data;
        const updatedBins = await Promise.all(
          bins.map(async (bin) => {
            try {
              const latestResponse = await axios.get(
                `/api/v1/binDashboardAnalytics/latestBinWeight?binId=${bin._id}`,
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
            } catch {
              return { ...bin, binCapacity: bin.binCapacity || 20 };
            }
          }),
        );
        if (!areBinsEqual(prevBinStatusRef.current, updatedBins)) {
          prevBinStatusRef.current = updatedBins;
          setBinStatus(updatedBins);
        }
      }
    } catch {
      // Silent error handling
    }
  }, [branchId]);

  // Fetch minimal overview for the branch.
  const fetchMinimalOverview = useCallback(async () => {
    if (!branchId) return;
    try {
      const response = await axios.get(
        `/api/v1/binDashboardAnalytics/minimalOverview?branchId=${branchId}`,
        {
          withCredentials: true,
        },
      );
      if (response.data.success) {
        setTrendData(response.data.data.trendData);
        setBranchContribution(response.data.data.branchContribution);
        if (response.data.data.diversionRate) {
          setDiversionRate(response.data.data.diversionRate);
        }
      }
    } catch {
      // Use default fallback values
      setTrendData([
        { hour: '00:00', weight: 2.1 },
        { hour: '01:00', weight: 1.5 },
        { hour: '02:00', weight: 0.8 },
      ]);
      setBranchContribution(23);
    }
  }, [branchId]);

  // Combined effect for periodic fetches.
  useEffect(() => {
    if (branchId) {
      Promise.all([fetchBinStatus(), fetchMinimalOverview()]).finally(() => setIsLoading(false));
    }
    const interval = setInterval(() => {
      if (branchId) {
        fetchBinStatus();
        fetchMinimalOverview();
        setLastUpdate(new Date());
        setNextUpdate(new Date(Date.now() + 3600000));
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchBinStatus, fetchMinimalOverview, branchId]);

  // Logout handler.
  const handleLogout = async () => {
    try {
      const response = await axios.post('/api/v1/users/logout', {}, { withCredentials: true });
      if (response.data.success) {
        dispatch(clearUser());
        window.location.href = '/login';
      }
    } catch {
      // Silent error handling
    }
  };

  // Render back button if navigated from Admin.
  const renderBackButton = () => {
    if (location.state?.fromAdmin) {
      return (
        <div className="p-2">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            ← Back to Admin Dashboard
          </Button>
        </div>
      );
    }
    return null;
  };

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Header details.
  const branchAddress = user?.OrgUnit?.branchAddress || user?.OrgUnit || {};
  const companyName = user?.company?.CompanyName || 'Company Name';

  // Determine grid columns for bin cards.
  const getGridCols = (binCount) => {
    if (binCount <= 2) return 'grid-cols-1 md:grid-cols-2';
    if (binCount === 3) return 'grid-cols-1 md:grid-cols-3';
    if (binCount === 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    return 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col md:overflow-hidden overflow-auto">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 py-3 px-4 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <img src={user.company?.logo || NetNada_logo} alt="Company Logo" className="h-8" />
            <div className="ml-3 border-l border-gray-200 pl-3">
              <h1 className="text-sm font-medium text-gray-800">{companyName}</h1>
              <p className="text-xs text-gray-500">
                {branchAddress.address || 'Branch Address'}, {branchAddress.city || ''},{' '}
                {branchAddress.country || ''}
              </p>
            </div>
          </div>
          {/* Show extra header items only if not navigated from Admin */}
          <div className="flex items-center space-x-2">
            {fromAdmin ? (
              renderBackButton()
            ) : (
              <>
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
                {renderBackButton()}
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleLogout}>
                  <LogOut className="h-3 w-3 mr-1" />
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-4 flex flex-col space-y-4 justify-center md:overflow-hidden overflow-auto">
        {/* Bin Status Cards */}
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
                binCapacity={bin.binCapacity}
              />
            ))}
          </div>
        )}

        {/* Waste Trend Chart */}
        <div className="h-[300px] md:h-[calc(38vh)]">
          <WasteLineChart
            branchId={user?.OrgUnit?.branchAddress?._id || user?.OrgUnit?._id || null}
          />
        </div>

        {/* Diversion, Branch Contribution, and Tips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-auto md:h-[220px] mb-4">
          <DiversionRateCard rate={diversionRate} />
          <BranchContributionCard
            percentage={branchContribution}
            branchName={
              user?.OrgUnit?.branchAddress?.officeName || user?.OrgUnit?.officeName || 'Your Branch'
            }
          />
          <TipsCarousel />
        </div>
      </main>
    </div>
  );
}
