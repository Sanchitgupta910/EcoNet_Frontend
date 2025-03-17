'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, subMonths } from 'date-fns';
import {
  Bell,
  LogOut,
  Building2,
  Trash2,
  Recycle,
  BarChart3,
  Trophy,
  Activity,
  UserPlus,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  RefreshCw,
} from 'lucide-react';
import NetNada_logo from '../assets/NetNada_logo.png';
import SideMenu from '../components/layouts/SideMenu';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Progress } from '../components/ui/Progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/Select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/Tooltip';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';

/**
 * StatCard component displays a key metric with an icon
 */
const StatCard = ({ title, value, icon, description, change, changeType, bgColor, iconColor }) => {
  return (
    <Card className="shadow-sm border border-gray-100/50 backdrop-blur-sm bg-white/80 overflow-hidden">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-500 mb-1">{title}</p>
            <h3 className="text-xl font-bold text-gray-800">{value}</h3>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
            {change && (
              <div
                className={`flex items-center mt-2 text-xs ${
                  changeType === 'increase' ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {changeType === 'increase' ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                <span>{change}</span>
              </div>
            )}
          </div>
          <div className={`p-2 rounded-full ${bgColor}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * WasteStreamChart component displays waste breakdown by stream
 */
const WasteStreamChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm border border-gray-100/50 backdrop-blur-sm bg-white/80 h-full">
        <CardHeader className="pb-2 border-b border-gray-100/50">
          <CardTitle className="text-base font-medium text-gray-800">Waste by Stream</CardTitle>
          <CardDescription className="text-xs text-gray-500">
            Breakdown of waste by category for the selected month
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <PieChart className="h-8 w-8 text-gray-300" />
          <p className="ml-2 text-gray-500 text-sm">No waste stream data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-gray-100/50 backdrop-blur-sm bg-white/80 h-full">
      <CardHeader className="pb-2 border-b border-gray-100/50">
        <CardTitle className="text-base font-medium text-gray-800">Waste by Stream</CardTitle>
        <CardDescription className="text-xs text-gray-500">
          Breakdown of waste by category for the selected month
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] p-4">
        <div className="h-full w-full bg-gray-50/50 rounded-md flex items-center justify-center">
          <PieChart className="h-5 w-5 text-primary" />
          <p className="ml-2 text-gray-600 text-sm">Waste stream chart would render here</p>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Leaderboard component displays rankings of sub-organizational units
 */
const Leaderboard = ({ data, metric }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm border border-gray-100/50 backdrop-blur-sm bg-white/80 h-full">
        <CardHeader className="pb-2 border-b border-gray-100/50">
          <CardTitle className="text-base font-medium text-gray-800">Leaderboard</CardTitle>
          <CardDescription className="text-xs text-gray-500">
            {metric === 'waste'
              ? 'Branches ranked by total waste reduction'
              : 'Branches ranked by diversion rate'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <Trophy className="h-8 w-8 text-gray-300" />
          <p className="ml-2 text-gray-500 text-sm">No leaderboard data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-gray-100/50 backdrop-blur-sm bg-white/80 h-full">
      <CardHeader className="pb-2 border-b border-gray-100/50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-medium text-gray-800">Leaderboard</CardTitle>
          <CardDescription className="text-xs text-gray-500">
            {metric === 'waste'
              ? 'Branches ranked by total waste reduction'
              : 'Branches ranked by diversion rate'}
          </CardDescription>
        </div>
        <Tabs defaultValue="waste" className="w-[180px]">
          <TabsList className="grid w-full grid-cols-2 h-7">
            <TabsTrigger value="waste" className="text-xs">
              Waste
            </TabsTrigger>
            <TabsTrigger value="diversion" className="text-xs">
              Diversion
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={item._id || item.id} className="flex items-center">
              <div className="w-6 h-6 flex items-center justify-center bg-primary/10 text-primary rounded-full mr-3 text-xs font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {item.branchName || item.name}
                  </span>
                  <span className="text-sm font-bold text-gray-800">
                    {metric === 'waste'
                      ? `${item.totalWaste || item.waste}kg`
                      : `${item.diversionRate}%`}
                  </span>
                </div>
                <Progress
                  value={
                    metric === 'waste'
                      ? ((item.totalWaste || item.waste) / (data[0].totalWaste || data[0].waste)) *
                        100
                      : item.diversionRate
                  }
                  className="h-1.5"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * ActivityFeed component displays a chronological list of events
 */
const ActivityFeed = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <Card className="shadow-sm border border-gray-100/50 backdrop-blur-sm bg-white/80">
        <CardHeader className="pb-2 border-b border-gray-100/50">
          <CardTitle className="text-base font-medium text-gray-800">Activity Feed</CardTitle>
          <CardDescription className="text-xs text-gray-500">
            Recent events and anomalies
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <Activity className="h-8 w-8 text-gray-300" />
          <p className="ml-2 text-gray-500 text-sm">No activity data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-gray-100/50 backdrop-blur-sm bg-white/80">
      <CardHeader className="pb-2 border-b border-gray-100/50">
        <CardTitle className="text-base font-medium text-gray-800">Activity Feed</CardTitle>
        <CardDescription className="text-xs text-gray-500">
          Recent events and anomalies
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100/50">
          {activities.map((activity) => (
            <div key={activity.id} className="p-4">
              <div className="flex items-start">
                <div className={`p-1.5 rounded-full ${activity.iconBg} mr-3 mt-0.5`}>
                  {activity.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                  <p className="text-xs text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t border-gray-100/50 p-3">
        <Button variant="ghost" size="sm" className="text-xs w-full">
          View All Activities
        </Button>
      </CardFooter>
    </Card>
  );
};

/**
 * AdminDashboard component for admin user roles
 */
export default function AdminDashboard() {
  // Get user data from Redux store
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();

  // State for filters and data
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedOrgUnit, setSelectedOrgUnit] = useState('all');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [companies, setCompanies] = useState([]);
  const [orgUnits, setOrgUnits] = useState([]);
  const [overviewData, setOverviewData] = useState(null);
  const [wasteStreamData, setWasteStreamData] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Handle user logout
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
   * Fetch companies for SuperAdmin
   */
  const fetchCompanies = useCallback(async () => {
    if (user?.role !== 'SuperAdmin') return;

    try {
      const response = await axios.get('/api/v1/company/getCompany', {
        withCredentials: true,
      });

      if (response.data.success) {
        setCompanies(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      // Set some mock data for demonstration
      setCompanies([
        { _id: '1', CompanyName: 'Acme Inc.' },
        { _id: '2', CompanyName: 'Globex Corporation' },
        { _id: '3', CompanyName: 'Initech' },
      ]);
    }
  }, [user]);

  /**
   * Fetch org units based on user role
   */
  const fetchOrgUnits = useCallback(async () => {
    let orgType = '';
    switch (user?.role) {
      case 'CountryAdmin':
        orgType = 'Country';
        break;
      case 'RegionalAdmin':
        orgType = 'Region';
        break;
      case 'CityAdmin':
        orgType = 'City';
        break;
      case 'OfficeAdmin':
        orgType = 'Branch';
        break;
      default:
        orgType = '';
    }

    if (!orgType) {
      setOrgUnits([]);
      return;
    }

    try {
      const response = await axios.get(`/api/v1/orgUnits/byType?type=${orgType}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setOrgUnits(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching org units:', error);
      // Set some mock data for demonstration
      setOrgUnits([
        { _id: '1', name: 'Headquarters' },
        { _id: '2', name: 'East Region' },
        { _id: '3', name: 'West Region' },
        { _id: '4', name: 'North Branch' },
      ]);
    }
  }, [user]);

  /**
   * Fetch overview data for the dashboard
   */
  const fetchOverviewData = useCallback(async () => {
    const companyId = user?.role === 'SuperAdmin' ? selectedCompany : user?.company?._id;
    const orgUnitQuery =
      selectedOrgUnit && selectedOrgUnit !== 'all' ? `&orgUnitId=${selectedOrgUnit}` : '';
    const companyQuery =
      user?.role === 'SuperAdmin' && selectedCompany ? `&companyId=${selectedCompany}` : '';

    try {
      setIsLoading(true);
      const response = await axios.get(
        `/api/v1/analytics/overview?month=${selectedMonth}${orgUnitQuery}${companyQuery}`,
        { withCredentials: true },
      );

      if (response.data.success) {
        setOverviewData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching overview data:', error);
      // Set some mock data for demonstration
      setOverviewData({
        officeLocations: 12,
        wasteBins: 48,
        totalWaste: '1,245kg',
        diversionRate: '78%',
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedOrgUnit, selectedCompany, user]);

  /**
   * Fetch waste stream data for the chart
   */
  const fetchWasteStreamData = useCallback(async () => {
    const companyId = user?.role === 'SuperAdmin' ? selectedCompany : user?.company?._id;
    const orgUnitQuery =
      selectedOrgUnit && selectedOrgUnit !== 'all' ? `&orgUnitId=${selectedOrgUnit}` : '';
    const companyQuery =
      user?.role === 'SuperAdmin' && selectedCompany ? `&companyId=${selectedCompany}` : '';

    if (!companyId && user?.role === 'SuperAdmin') return;

    try {
      const response = await axios.get(
        `/api/v1/analytics/wasteByStream?month=${selectedMonth}${orgUnitQuery}${companyQuery}`,
        { withCredentials: true },
      );

      if (response.data.success) {
        setWasteStreamData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching waste stream data:', error);
      // Set some mock data for demonstration
      setWasteStreamData([
        { date: '2023-01-01', Landfill: 45, Commingled: 30, Organic: 25, Paper: 20, Glass: 10 },
        { date: '2023-01-02', Landfill: 40, Commingled: 35, Organic: 20, Paper: 25, Glass: 15 },
        // ... more data points
      ]);
    }
  }, [selectedMonth, selectedOrgUnit, selectedCompany, user]);

  /**
   * Fetch leaderboard data
   */
  const fetchLeaderboardData = useCallback(async () => {
    const companyId = user?.role === 'SuperAdmin' ? selectedCompany : user?.company?._id;
    const orgUnitQuery =
      selectedOrgUnit && selectedOrgUnit !== 'all' ? `&orgUnitId=${selectedOrgUnit}` : '';
    const companyQuery =
      user?.role === 'SuperAdmin' && selectedCompany ? `&companyId=${selectedCompany}` : '';

    if (!companyId && user?.role === 'SuperAdmin') return;

    try {
      const response = await axios.get(
        `/api/v1/analytics/leaderboard?month=${selectedMonth}${orgUnitQuery}${companyQuery}`,
        { withCredentials: true },
      );

      if (response.data.success) {
        setLeaderboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      // Set some mock data for demonstration
      setLeaderboardData([
        { _id: '1', branchName: 'North Branch', totalWaste: 320, diversionRate: 85 },
        { _id: '2', branchName: 'East Region', totalWaste: 280, diversionRate: 78 },
        { _id: '3', branchName: 'West Region', totalWaste: 250, diversionRate: 72 },
        { _id: '4', branchName: 'South Branch', totalWaste: 220, diversionRate: 65 },
      ]);
    }
  }, [selectedMonth, selectedOrgUnit, selectedCompany, user]);

  /**
   * Fetch activity feed data
   */
  const fetchActivityData = useCallback(async () => {
    const companyId = user?.role === 'SuperAdmin' ? selectedCompany : user?.company?._id;
    const orgUnitQuery =
      selectedOrgUnit && selectedOrgUnit !== 'all' ? `&orgUnitId=${selectedOrgUnit}` : '';
    const companyQuery =
      user?.role === 'SuperAdmin' && selectedCompany ? `&companyId=${selectedCompany}` : '';

    if (!companyId && user?.role === 'SuperAdmin') return;

    try {
      const response = await axios.get(
        `/api/v1/analytics/activityFeed?month=${selectedMonth}${orgUnitQuery}${companyQuery}`,
        { withCredentials: true },
      );

      if (response.data.success) {
        setActivityData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching activity data:', error);
      // Set some mock data for demonstration
      setActivityData([
        {
          id: '1',
          title: 'Anomaly Detected',
          description: 'Unusual spike in General Waste at North Branch',
          timestamp: 'Today at 2:30 PM',
          icon: <Activity className="h-3 w-3 text-white" />,
          iconBg: 'bg-rose-500',
        },
        {
          id: '2',
          title: 'Diversion Target Achieved',
          description: 'East Region reached 80% diversion rate',
          timestamp: 'Yesterday at 10:15 AM',
          icon: <Trophy className="h-3 w-3 text-white" />,
          iconBg: 'bg-emerald-500',
        },
        {
          id: '3',
          title: 'New Bin Added',
          description: 'Glass recycling bin added to West Region',
          timestamp: 'Jan 15, 2023',
          icon: <Trash2 className="h-3 w-3 text-white" />,
          iconBg: 'bg-blue-500',
        },
      ]);
    }
  }, [selectedMonth, selectedOrgUnit, selectedCompany, user]);

  // Fetch initial data on component mount
  useEffect(() => {
    if (user?.role === 'SuperAdmin') {
      fetchCompanies();
    }
  }, [fetchCompanies, user]);

  // Fetch org units when company changes
  useEffect(() => {
    fetchOrgUnits();
  }, [fetchOrgUnits]);

  // Fetch dashboard data when filters change
  useEffect(() => {
    fetchOverviewData();
    fetchWasteStreamData();
    fetchLeaderboardData();
    fetchActivityData();
  }, [fetchOverviewData, fetchWasteStreamData, fetchLeaderboardData, fetchActivityData]);

  // If user data is not available, show loading state
  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Generate month options for the last 12 months
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy'),
    };
  });

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Show side menu only for SuperAdmin */}
      {user.role === 'SuperAdmin' && <SideMenu />}

      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 py-3 px-4 shadow-sm">
          <div className="container mx-auto flex items-center justify-between">
            {/* Left: Company name or logo */}
            <div>
              {user.role === 'SuperAdmin' ? (
                <h1 className="text-lg font-medium text-gray-800">Admin Dashboard</h1>
              ) : (
                <div className="flex items-center">
                  <img
                    src={user.company?.logo || NetNada_logo}
                    alt="Company Logo"
                    className="h-8 mr-3"
                  />
                  <h1 className="text-lg font-medium text-gray-800">
                    {user.company?.CompanyName || 'Company Name'}
                  </h1>
                </div>
              )}
            </div>

            {/* Right: Invite User button, notification bell, and logout */}
            <div className="flex items-center space-x-2">
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

              {/* Invite User button - not visible for SuperAdmin */}
              {user.role !== 'SuperAdmin' && (
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-white h-8 text-xs"
                  onClick={() =>
                    navigate(`/invite-user/${user.company?._id}`, {
                      state: { fromDashboard: true },
                    })
                  }
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  Invite User
                </Button>
              )}

              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleLogout}>
                <LogOut className="h-3 w-3 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto p-4 space-y-4">
          {/* Filters */}
          <Card className="shadow-sm border border-gray-100/50 backdrop-blur-sm bg-white/80">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-3 items-center">
                <Badge
                  variant="outline"
                  className="bg-gray-50/80 text-gray-600 text-xs font-normal py-1 px-2"
                >
                  <Filter className="h-3 w-3 mr-1" />
                  Filters
                </Badge>

                {/* Company filter for SuperAdmin */}
                {user.role === 'SuperAdmin' && (
                  <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                    <SelectTrigger className="h-8 w-[180px] text-xs bg-white border-gray-200">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company._id} value={company._id} className="text-xs">
                          {company.CompanyName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* OrgUnit filter */}
                <Select value={selectedOrgUnit} onValueChange={setSelectedOrgUnit}>
                  <SelectTrigger className="h-8 w-[180px] text-xs bg-white border-gray-200">
                    <SelectValue placeholder="Organization unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">
                      All Units
                    </SelectItem>
                    {orgUnits.map((unit) => (
                      <SelectItem key={unit._id} value={unit._id} className="text-xs">
                        {unit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Month filter */}
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="h-8 w-[180px] text-xs bg-white border-gray-200">
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-xs">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs ml-auto"
                  onClick={() => {
                    fetchOverviewData();
                    fetchWasteStreamData();
                    fetchLeaderboardData();
                    fetchActivityData();
                  }}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Overview Section */}
          {isLoading ? (
            <div className="flex justify-center items-center h-24 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-100/50 shadow-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Office Locations"
                value={overviewData?.officeLocations || 0}
                icon={<Building2 className="h-4 w-4 text-white" />}
                bgColor="bg-blue-500"
              />
              <StatCard
                title="Waste Bins"
                value={overviewData?.wasteBins || 0}
                icon={<Trash2 className="h-4 w-4 text-white" />}
                bgColor="bg-amber-500"
              />
              <StatCard
                title="Total Waste"
                value={overviewData?.totalWaste || '0kg'}
                icon={<BarChart3 className="h-4 w-4 text-white" />}
                description="For selected month"
                change="3.2% increase"
                changeType="increase"
                bgColor="bg-purple-500"
              />
              <StatCard
                title="Diversion Rate"
                value={overviewData?.diversionRate || '0%'}
                icon={<Recycle className="h-4 w-4 text-white" />}
                description="Waste diverted from landfill"
                change="5.5% increase"
                changeType="increase"
                bgColor="bg-emerald-500"
              />
            </div>
          )}

          {/* Waste Stream Chart and Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <WasteStreamChart data={wasteStreamData} />
            <Leaderboard data={leaderboardData} metric="waste" />
          </div>

          {/* Activity Feed */}
          <ActivityFeed activities={activityData} />
        </main>
      </div>
    </div>
  );
}
