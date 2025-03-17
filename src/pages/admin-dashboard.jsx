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

/* 
  StatCard Component:
  Displays a single metric (e.g. total offices, waste bins, etc.) with an icon.
*/
const StatCard = ({ title, value, icon, description, bgColor }) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
            {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
          </div>
          <div className={`p-3 rounded-full ${bgColor}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

/* 
  WasteStreamChart Component:
  A placeholder component for the waste-by-stream chart.
  Displays a message if no data is available.
*/
const WasteStreamChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Waste by Stream</CardTitle>
          <CardDescription>Breakdown of waste by category for the selected month</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <BarChart3 className="h-12 w-12 text-gray-300" />
          <p className="ml-2 text-gray-500">No waste stream data available</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Waste by Stream</CardTitle>
        <CardDescription>Breakdown of waste by category for the selected month</CardDescription>
      </CardHeader>
      <CardContent className="h-64 p-4">
        <div className="h-full w-full bg-gray-50 rounded-md flex items-center justify-center">
          <BarChart3 className="h-8 w-8 text-primary" />
          <p className="ml-2 text-gray-600">Waste stream chart would render here</p>
        </div>
      </CardContent>
    </Card>
  );
};

/* 
  Leaderboard Component:
  Ranks branches based on total waste reduction (or diversion rate).
  This version uses updated data fields (_id, totalWaste, branchName) from the backend.
*/
const Leaderboard = ({ data, metric }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>
            {metric === 'waste'
              ? 'Branches ranked by total waste reduction'
              : 'Branches ranked by diversion rate'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Trophy className="h-12 w-12 text-gray-300" />
          <p className="ml-2 text-gray-500">No leaderboard data available</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>
            {metric === 'waste'
              ? 'Branches ranked by total waste reduction'
              : 'Branches ranked by diversion rate'}
          </CardDescription>
        </div>
        <Tabs defaultValue="waste" className="w-[200px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="waste">Waste</TabsTrigger>
            <TabsTrigger value="diversion">Diversion</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={item._id} className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full mr-3 font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{item.branchName}</span>
                  <span className="font-bold">
                    {metric === 'waste'
                      ? `${item.totalWaste}kg`
                      : `${item.diversionRate ? item.diversionRate : 0}%`}
                  </span>
                </div>
                <Progress
                  value={
                    metric === 'waste'
                      ? (item.totalWaste / data[0].totalWaste) * 100
                      : item.diversionRate
                  }
                  className="h-2"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/* 
  ActivityFeed Component:
  Displays a list of recent activity events.
*/
const ActivityFeed = ({ activities }) => {
  if (!activities || activities.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
          <CardDescription>Recent events and anomalies</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Activity className="h-12 w-12 text-gray-300" />
          <p className="ml-2 text-gray-500">No activity data available</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Activity Feed</CardTitle>
        <CardDescription>Recent events and anomalies</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="border-b pb-4 last:border-0">
              <div className="flex items-start">
                <div className={`p-2 rounded-full ${activity.iconBg} mr-3 mt-1`}>
                  {activity.icon}
                </div>
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button variant="outline" className="w-full">
          View All Activities
        </Button>
      </CardFooter>
    </Card>
  );
};

/* 
  AdminDashboard Component:
  The main component that drives the admin dashboard.
  It fetches various data (overview, waste stream, leaderboard, activity feed)
  and renders multiple child components.
  Detailed error handling is present in each data fetch function.
*/
export default function AdminDashboard() {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();

  // Dashboard filter state variables
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

  // Logout handler with error handling
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

  // Fetch companies for SuperAdmin
  const fetchCompanies = useCallback(async () => {
    if (user?.role !== 'SuperAdmin') return;
    try {
      const response = await axios.get('/api/v1/company/getCompany', { withCredentials: true });
      if (response.data.success) {
        setCompanies(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    }
  }, [user]);

  // Fetch Organization Units based on user role
  const fetchOrgUnits = useCallback(async () => {
    let orgType = '';
    switch (user.role) {
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
      setOrgUnits([]);
    }
  }, [user]);

  // Fetch Overview Data with error handling
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
      setOverviewData(null);
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedOrgUnit, selectedCompany, user]);

  // Fetch Waste Stream Data with error handling
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
      setWasteStreamData([]);
    }
  }, [selectedMonth, selectedOrgUnit, selectedCompany, user]);

  // Fetch Leaderboard Data with error handling
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
        // The updated endpoint returns objects with _id, totalWaste, and branchName.
        setLeaderboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      setLeaderboardData([]);
    }
  }, [selectedMonth, selectedOrgUnit, selectedCompany, user]);

  // Fetch Activity Data with error handling
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
      setActivityData([]);
    }
  }, [selectedMonth, selectedOrgUnit, selectedCompany, user]);

  // Trigger fetching companies if the user is a SuperAdmin.
  useEffect(() => {
    if (user?.role === 'SuperAdmin') {
      fetchCompanies();
    }
  }, [fetchCompanies, user]);

  // Trigger fetching OrgUnits on component mount or when dependencies change.
  useEffect(() => {
    fetchOrgUnits();
  }, [fetchOrgUnits]);

  // Fetch all dashboard data (overview, waste stream, leaderboard, activity feed).
  useEffect(() => {
    fetchOverviewData();
    fetchWasteStreamData();
    fetchLeaderboardData();
    fetchActivityData();
  }, [fetchOverviewData, fetchWasteStreamData, fetchLeaderboardData, fetchActivityData]);

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Generate month options for the Select dropdown.
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy'),
    };
  });

  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      {user.role === 'SuperAdmin' && <SideMenu />}
      <div className="flex-1 overflow-auto">
        {/* Dashboard Header */}
        <header className="bg-white border-b p-4 shadow-sm">
          <div className="container mx-auto flex items-center justify-between">
            <div>
              {user.role === 'SuperAdmin' ? (
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
              ) : (
                <div className="flex items-center">
                  <img
                    src={user.company?.logo || NetNada_logo}
                    alt="Company Logo"
                    className="h-8 mr-3"
                  />
                  <h1 className="text-xl font-bold">
                    {user.company?.CompanyName || 'Company Name'}
                  </h1>
                </div>
              )}
            </div>
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
              {user.role !== 'SuperAdmin' && (
                <Button
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={() =>
                    navigate(`/invite-user/${user.company?._id}`, {
                      state: { fromDashboard: true },
                    })
                  }
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite User
                </Button>
              )}
              {user.role !== 'SuperAdmin' && (
                <Button variant="outline" className="flex items-center" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="container mx-auto p-6 space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6 items-center">
            <div className="text-sm font-medium text-gray-500">Filters:</div>
            {user.role === 'SuperAdmin' && (
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="h-9 w-[200px] bg-white border-gray-200">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company._id} value={company._id}>
                      {company.CompanyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={selectedOrgUnit} onValueChange={setSelectedOrgUnit}>
              <SelectTrigger className="h-9 w-[275px] bg-white border-gray-200">
                <SelectValue placeholder="Organization unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                {orgUnits.map((unit) => (
                  <SelectItem key={unit._id} value={unit._id}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="h-9 w-[200px] bg-white border-gray-200">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Overview Metrics */}
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Office(s)"
                value={overviewData?.officeLocations || 0}
                icon={<Building2 className="h-6 w-6 text-white" />}
                bgColor="bg-blue-500"
              />
              <StatCard
                title="Waste Bins"
                value={overviewData?.wasteBins || 0}
                icon={<Trash2 className="h-6 w-6 text-white" />}
                bgColor="bg-amber-500"
              />
              <StatCard
                title="Total Waste"
                value={overviewData?.totalWaste || '0kg'}
                icon={<BarChart3 className="h-6 w-6 text-white" />}
                description="For selected month"
                bgColor="bg-purple-500"
              />
              <StatCard
                title="Diversion Rate"
                value={overviewData?.diversionRate || '0%'}
                icon={<Recycle className="h-6 w-6 text-white" />}
                description="Waste diverted from landfill"
                bgColor="bg-emerald-500"
              />
            </div>
          )}

          {/* Waste Stream Chart and Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
