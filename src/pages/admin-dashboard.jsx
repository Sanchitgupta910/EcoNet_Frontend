// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { format, subMonths } from 'date-fns';
// import {
//   Bell,
//   LogOut,
//   Building2,
//   Trash2,
//   Recycle,
//   BarChart3,
//   Trophy,
//   Activity,
//   UserPlus,
// } from 'lucide-react';
// import NetNada_logo from '../assets/NetNada_logo.png';
// import SideMenu from '../components/layouts/SideMenu';
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardFooter,
// } from '../components/ui/Card';
// import { Button } from '../components/ui/Button';
// import { Progress } from '../components/ui/Progress';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '../components/ui/Select';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/Tooltip';
// import { Tabs, TabsList, TabsTrigger } from '../components/ui/Tabs';

// /**
//  * StatCard component displays a key metric with an icon.
//  * @param {Object} props - Component props.
//  * @param {string} props.title - Title of the stat.
//  * @param {string|number} props.value - Value to display.
//  * @param {React.ReactNode} props.icon - Icon to display.
//  * @param {string} props.description - Optional description text.
//  * @param {string} props.bgColor - Background color for the icon.
//  */
// const StatCard = ({ title, value, icon, description, bgColor }) => {
//   return (
//     <Card className="shadow-sm">
//       <CardContent className="p-6">
//         <div className="flex justify-between items-start">
//           <div>
//             <p className="text-sm text-gray-500 mb-1">{title}</p>
//             <h3 className="text-2xl font-bold">{value}</h3>
//             {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
//           </div>
//           <div className={`p-3 rounded-full ${bgColor}`}>{icon}</div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// /**
//  * WasteStreamChart component displays waste breakdown by stream.
//  * @param {Object} props - Component props.
//  * @param {Array} props.data - Waste stream data.
//  */
// const WasteStreamChart = ({ data }) => {
//   if (!data || data.length === 0) {
//     return (
//       <Card className="shadow-sm">
//         <CardHeader>
//           <CardTitle>Waste by Stream</CardTitle>
//           <CardDescription>Breakdown of waste by category for the selected month</CardDescription>
//         </CardHeader>
//         <CardContent className="flex items-center justify-center h-64">
//           <BarChart3 className="h-12 w-12 text-gray-300" />
//           <p className="ml-2 text-gray-500">No waste stream data available</p>
//         </CardContent>
//       </Card>
//     );
//   }
//   return (
//     <Card className="shadow-sm">
//       <CardHeader>
//         <CardTitle>Waste by Stream</CardTitle>
//         <CardDescription>Breakdown of waste by category for the selected month</CardDescription>
//       </CardHeader>
//       <CardContent className="h-64 p-4">
//         <div className="h-full w-full bg-gray-50 rounded-md flex items-center justify-center">
//           <BarChart3 className="h-8 w-8 text-primary" />
//           <p className="ml-2 text-gray-600">Waste stream chart would render here</p>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// /**
//  * Leaderboard component displays rankings of sub-organizational units.
//  * @param {Object} props - Component props.
//  * @param {Array} props.data - Leaderboard data.
//  * @param {string} props.metric - Metric to display (e.g., "waste" or "diversion").
//  */
// const Leaderboard = ({ data, metric }) => {
//   if (!data || data.length === 0) {
//     return (
//       <Card className="shadow-sm">
//         <CardHeader>
//           <CardTitle>Leaderboard</CardTitle>
//           <CardDescription>
//             {metric === 'waste'
//               ? 'Branches ranked by total waste reduction'
//               : 'Branches ranked by diversion rate'}
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="flex items-center justify-center h-64">
//           <Trophy className="h-12 w-12 text-gray-300" />
//           <p className="ml-2 text-gray-500">No leaderboard data available</p>
//         </CardContent>
//       </Card>
//     );
//   }
//   return (
//     <Card className="shadow-sm">
//       <CardHeader className="flex flex-row items-center justify-between">
//         <div>
//           <CardTitle>Leaderboard</CardTitle>
//           <CardDescription>
//             {metric === 'waste'
//               ? 'Branches ranked by total waste reduction'
//               : 'Branches ranked by diversion rate'}
//           </CardDescription>
//         </div>
//         <Tabs defaultValue="waste" className="w-[200px]">
//           <TabsList className="grid w-full grid-cols-2">
//             <TabsTrigger value="waste">Waste</TabsTrigger>
//             <TabsTrigger value="diversion">Diversion</TabsTrigger>
//           </TabsList>
//         </Tabs>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           {data.map((item, index) => (
//             <div key={item.id} className="flex items-center">
//               <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full mr-3 font-bold">
//                 {index + 1}
//               </div>
//               <div className="flex-1">
//                 <div className="flex justify-between mb-1">
//                   <span className="font-medium">{item.name}</span>
//                   <span className="font-bold">
//                     {metric === 'waste' ? `${item.waste}kg` : `${item.diversionRate}%`}
//                   </span>
//                 </div>
//                 <Progress
//                   value={
//                     metric === 'waste' ? (item.waste / data[0].waste) * 100 : item.diversionRate
//                   }
//                   className="h-2"
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// /**
//  * ActivityFeed component displays a chronological list of events.
//  * @param {Object} props - Component props.
//  * @param {Array} props.activities - Activity data.
//  */
// const ActivityFeed = ({ activities }) => {
//   if (!activities || activities.length === 0) {
//     return (
//       <Card className="shadow-sm">
//         <CardHeader>
//           <CardTitle>Activity Feed</CardTitle>
//           <CardDescription>Recent events and anomalies</CardDescription>
//         </CardHeader>
//         <CardContent className="flex items-center justify-center h-64">
//           <Activity className="h-12 w-12 text-gray-300" />
//           <p className="ml-2 text-gray-500">No activity data available</p>
//         </CardContent>
//       </Card>
//     );
//   }
//   return (
//     <Card className="shadow-sm">
//       <CardHeader>
//         <CardTitle>Activity Feed</CardTitle>
//         <CardDescription>Recent events and anomalies</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           {activities.map((activity) => (
//             <div key={activity.id} className="border-b pb-4 last:border-0">
//               <div className="flex items-start">
//                 <div className={`p-2 rounded-full ${activity.iconBg} mr-3 mt-1`}>
//                   {activity.icon}
//                 </div>
//                 <div>
//                   <p className="font-medium">{activity.title}</p>
//                   <p className="text-sm text-gray-600">{activity.description}</p>
//                   <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </CardContent>
//       <CardFooter className="border-t pt-4">
//         <Button variant="outline" className="w-full">
//           View All Activities
//         </Button>
//       </CardFooter>
//     </Card>
//   );
// };

// /**
//  * AdminDashboard component for admin user roles.
//  * This component fetches dashboard data (overview, waste stream, leaderboard, and activity feed)
//  * using new endpoints. The OrgUnit dropdown is populated from the backend based on the user role.
//  */
// export default function AdminDashboard() {
//   const user = useSelector((state) => state.user.user);
//   const navigate = useNavigate();

//   const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
//   const [selectedOrgUnit, setSelectedOrgUnit] = useState('');
//   const [selectedCompany, setSelectedCompany] = useState('');
//   const [companies, setCompanies] = useState([]);
//   const [orgUnits, setOrgUnits] = useState([]);
//   const [overviewData, setOverviewData] = useState(null);
//   const [wasteStreamData, setWasteStreamData] = useState([]);
//   const [leaderboardData, setLeaderboardData] = useState([]);
//   const [activityData, setActivityData] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   /**
//    * Logout handler: calls backend endpoint then redirects to login.
//    */
//   const handleLogout = async () => {
//     try {
//       const response = await axios.post('/api/v1/users/logout', {}, { withCredentials: true });
//       if (response.data.success) {
//         window.location.href = '/login';
//       }
//     } catch (error) {
//       console.error('Logout failed:', error);
//     }
//   };

//   /**
//    * Fetch companies for SuperAdmin.
//    */
//   const fetchCompanies = useCallback(async () => {
//     if (user?.role !== 'SuperAdmin') return;
//     try {
//       const response = await axios.get('/api/v1/company/getCompany', {
//         withCredentials: true,
//       });
//       if (response.data.success) {
//         setCompanies(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching companies:', error);
//       setCompanies([]);
//     }
//   }, [user]);

//   /**
//    * Fetch OrgUnits from the backend based on the logged-in user's role.
//    * Determines the OrgUnit type based on role:
//    * - CountryAdmin => "Country"
//    * - RegionalAdmin => "Region"
//    * - CityAdmin => "City"
//    * - OfficeAdmin => "Branch"
//    */
//   const fetchOrgUnits = useCallback(async () => {
//     const companyId = selectedCompany || user?.company?._id;
//     if (!companyId) return;
//     let orgType = '';
//     switch (user.role) {
//       case 'CountryAdmin':
//         orgType = 'Country';
//         break;
//       case 'RegionalAdmin':
//         orgType = 'Region';
//         break;
//       case 'CityAdmin':
//         orgType = 'City';
//         break;
//       case 'OfficeAdmin':
//         orgType = 'Branch';
//         break;
//       default:
//         orgType = '';
//     }
//     if (!orgType) {
//       setOrgUnits([]);
//       return;
//     }
//     try {
//       const response = await axios.get(`/api/v1/orgUnits/byType?type=${orgType}`, {
//         withCredentials: true,
//       });
//       if (response.data.success) {
//         setOrgUnits(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching org units:', error);
//       setOrgUnits([]);
//     }
//   }, [selectedCompany, user]);

//   /**
//    * Fetch overview data for the dashboard using the new endpoint.
//    */
//   const fetchOverviewData = useCallback(async () => {
//     const companyId = user?.role === 'SuperAdmin' ? selectedCompany : user?.company?._id;
//     if (!companyId) return;
//     try {
//       setIsLoading(true);
//       const response = await axios.get(
//         `/api/v1/analytics/overview?month=${selectedMonth}&orgUnitId=${selectedOrgUnit}${
//           user?.role === 'SuperAdmin' ? `&companyId=${companyId}` : ''
//         }`,
//         { withCredentials: true },
//       );
//       if (response.data.success) {
//         setOverviewData(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching overview data:', error);
//       setOverviewData(null);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [selectedMonth, selectedOrgUnit, selectedCompany, user]);

//   const fetchWasteStreamData = useCallback(async () => {
//     const companyId = user?.role === 'SuperAdmin' ? selectedCompany : user?.company?._id;
//     if (!companyId) return;
//     try {
//       const response = await axios.get(
//         `/api/v1/analytics/wasteByStream?month=${selectedMonth}&orgUnitId=${selectedOrgUnit}${
//           user?.role === 'SuperAdmin' ? `&companyId=${companyId}` : ''
//         }`,
//         { withCredentials: true },
//       );
//       if (response.data.success) {
//         setWasteStreamData(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching waste stream data:', error);
//       setWasteStreamData([]);
//     }
//   }, [selectedMonth, selectedOrgUnit, selectedCompany, user]);

//   const fetchLeaderboardData = useCallback(async () => {
//     const companyId = user?.role === 'SuperAdmin' ? selectedCompany : user?.company?._id;
//     if (!companyId) return;
//     try {
//       const response = await axios.get(
//         `/api/v1/analytics/leaderboard?month=${selectedMonth}&orgUnitId=${selectedOrgUnit}${
//           user?.role === 'SuperAdmin' ? `&companyId=${companyId}` : ''
//         }`,
//         { withCredentials: true },
//       );
//       if (response.data.success) {
//         setLeaderboardData(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching leaderboard data:', error);
//       setLeaderboardData([]);
//     }
//   }, [selectedMonth, selectedOrgUnit, selectedCompany, user]);

//   const fetchActivityData = useCallback(async () => {
//     const companyId = user?.role === 'SuperAdmin' ? selectedCompany : user?.company?._id;
//     if (!companyId) return;
//     try {
//       const response = await axios.get(
//         `/api/v1/analytics/activityFeed?month=${selectedMonth}&orgUnitId=${selectedOrgUnit}${
//           user?.role === 'SuperAdmin' ? `&companyId=${companyId}` : ''
//         }`,
//         { withCredentials: true },
//       );
//       if (response.data.success) {
//         setActivityData(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching activity data:', error);
//       setActivityData([]);
//     }
//   }, [selectedMonth, selectedOrgUnit, selectedCompany, user]);

//   useEffect(() => {
//     if (user?.role === 'SuperAdmin') {
//       fetchCompanies();
//     }
//   }, [fetchCompanies, user]);

//   useEffect(() => {
//     fetchOrgUnits();
//   }, [fetchOrgUnits]);

//   useEffect(() => {
//     fetchOverviewData();
//     fetchWasteStreamData();
//     fetchLeaderboardData();
//     fetchActivityData();
//   }, [fetchOverviewData, fetchWasteStreamData, fetchLeaderboardData, fetchActivityData]);

//   if (!user) {
//     return <div className="flex items-center justify-center h-screen">Loading...</div>;
//   }

//   const monthOptions = Array.from({ length: 12 }, (_, i) => {
//     const date = subMonths(new Date(), i);
//     return {
//       value: format(date, 'yyyy-MM'),
//       label: format(date, 'MMMM yyyy'),
//     };
//   });

//   return (
//     <div className="flex h-screen bg-[#F9FAFB]">
//       {user.role === 'SuperAdmin' && <SideMenu />}

//       <div className="flex-1 overflow-auto">
//         {/* Header */}
//         <header className="bg-white border-b p-4 shadow-sm">
//           <div className="container mx-auto flex items-center justify-between">
//             <div>
//               {user.role === 'SuperAdmin' ? (
//                 <h1 className="text-xl font-bold">Admin Dashboard</h1>
//               ) : (
//                 <div className="flex items-center">
//                   <img
//                     src={user.company?.logo || NetNada_logo}
//                     alt="Company Logo"
//                     className="h-8 mr-3"
//                   />
//                   <h1 className="text-xl font-bold">
//                     {user.company?.CompanyName || 'Company Name'}
//                   </h1>
//                 </div>
//               )}
//             </div>

//             <div className="flex items-center space-x-4">
//               <TooltipProvider>
//                 <Tooltip>
//                   <TooltipTrigger asChild>
//                     <Button variant="ghost" size="icon">
//                       <Bell className="h-5 w-5" />
//                     </Button>
//                   </TooltipTrigger>
//                   <TooltipContent>Notifications</TooltipContent>
//                 </Tooltip>
//               </TooltipProvider>

//               {user.role !== 'SuperAdmin' && (
//                 <Button
//                   className="bg-primary hover:bg-primary/90 text-white"
//                   onClick={() =>
//                     navigate(`/invite-user/${user.company?._id}`, {
//                       state: { fromDashboard: true },
//                     })
//                   }
//                 >
//                   <UserPlus className="h-4 w-4 mr-2" />
//                   Invite User
//                 </Button>
//               )}

//               {user.role !== 'SuperAdmin' && (
//                 <Button variant="outline" className="flex items-center" onClick={handleLogout}>
//                   <LogOut className="h-4 w-4 mr-2" />
//                   Logout
//                 </Button>
//               )}
//             </div>
//           </div>
//         </header>

//         <main className="container mx-auto p-6 space-y-6">
//           <div className="flex flex-wrap gap-3 mb-6 items-center">
//             <div className="text-sm font-medium text-gray-500">Filters:</div>
//             {user.role === 'SuperAdmin' && (
//               <Select value={selectedCompany} onValueChange={setSelectedCompany}>
//                 <SelectTrigger className="h-9 w-[200px] bg-white border-gray-200 ">
//                   <SelectValue placeholder="Select company" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {companies.map((company) => (
//                     <SelectItem key={company._id} value={company._id}>
//                       {company.CompanyName}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             )}

//             <Select value={selectedOrgUnit} onValueChange={setSelectedOrgUnit}>
//               <SelectTrigger className="h-9 w-[275px] bg-white border-gray-200">
//                 <SelectValue placeholder="Organization unit" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Units</SelectItem>
//                 {orgUnits.map((unit) => (
//                   <SelectItem key={unit._id} value={unit._id}>
//                     {unit.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             <Select value={selectedMonth} onValueChange={setSelectedMonth}>
//               <SelectTrigger className="h-9 w-[200px] bg-white border-gray-200">
//                 <SelectValue placeholder="Select month" />
//               </SelectTrigger>
//               <SelectContent>
//                 {monthOptions.map((option) => (
//                   <SelectItem key={option.value} value={option.value}>
//                     {option.label}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {isLoading ? (
//             <div className="flex justify-center items-center h-40">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//               <StatCard
//                 title="Office Locations"
//                 value={overviewData?.officeLocations || 0}
//                 icon={<Building2 className="h-6 w-6 text-white" />}
//                 bgColor="bg-blue-500"
//               />
//               <StatCard
//                 title="Waste Bins"
//                 value={overviewData?.wasteBins || 0}
//                 icon={<Trash2 className="h-6 w-6 text-white" />}
//                 bgColor="bg-amber-500"
//               />
//               <StatCard
//                 title="Total Waste"
//                 value={overviewData?.totalWaste || '0kg'}
//                 icon={<BarChart3 className="h-6 w-6 text-white" />}
//                 description="For selected month"
//                 bgColor="bg-purple-500"
//               />
//               <StatCard
//                 title="Diversion Rate"
//                 value={overviewData?.diversionRate || '0%'}
//                 icon={<Recycle className="h-6 w-6 text-white" />}
//                 description="Waste diverted from landfill"
//                 bgColor="bg-emerald-500"
//               />
//             </div>
//           )}

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             <WasteStreamChart data={wasteStreamData} />
//             <Leaderboard data={leaderboardData} metric="waste" />
//           </div>

//           <ActivityFeed activities={activityData} />
//         </main>
//       </div>
//     </div>
//   );
// }
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
  StatCard: Displays a single metric.
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
  WasteStreamChart: Placeholder for waste stream chart.
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
  Leaderboard: Ranks branches by waste metrics.
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
            <div key={item.id} className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full mr-3 font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{item.name}</span>
                  <span className="font-bold">
                    {metric === 'waste' ? `${item.waste}kg` : `${item.diversionRate}%`}
                  </span>
                </div>
                <Progress
                  value={
                    metric === 'waste' ? (item.waste / data[0].waste) * 100 : item.diversionRate
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
  ActivityFeed: Displays recent activity events.
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

/**
 * AdminDashboard component for admin user roles.
 * This component fetches dashboard data using new endpoints.
 * It populates the Organization Unit dropdown by querying the backend via
 * the updated getOrgUnitsByType endpoint.
 */
export default function AdminDashboard() {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();

  // Dashboard filters
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  // When no OrgUnit is selected, set default value to "all"
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
   * Logout handler: calls backend endpoint then redirects to login.
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
   * Fetch companies for SuperAdmin.
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
      setCompanies([]);
    }
  }, [user]);

  /**
   * Fetch OrgUnits based on the logged-in user's role.
   * The OrgUnit type is determined by the admin level.
   */
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
      // Fetch OrgUnits by type from the backend (no dummy data)
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

  /**
   * Fetch overview data for the dashboard.
   * For SuperAdmin, if no company is selected then data aggregates for all companies.
   * If selectedOrgUnit equals "all", the orgUnit filter is not applied.
   */
  const fetchOverviewData = useCallback(async () => {
    const companyId = user?.role === 'SuperAdmin' ? selectedCompany : user?.company?._id;
    if (!companyId) {
      // If companyId is not available for SuperAdmin, aggregate data across all companies.
      // Pass an empty string for companyId to the endpoint.
    }
    // Build query strings based on filters
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
      setLeaderboardData([]);
    }
  }, [selectedMonth, selectedOrgUnit, selectedCompany, user]);

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

  useEffect(() => {
    if (user?.role === 'SuperAdmin') {
      fetchCompanies();
    }
  }, [fetchCompanies, user]);

  useEffect(() => {
    fetchOrgUnits();
  }, [fetchOrgUnits]);

  useEffect(() => {
    fetchOverviewData();
    fetchWasteStreamData();
    fetchLeaderboardData();
    fetchActivityData();
  }, [fetchOverviewData, fetchWasteStreamData, fetchLeaderboardData, fetchActivityData]);

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

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
        {/* Header */}
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

        <main className="container mx-auto p-6 space-y-6">
          <div className="flex flex-wrap gap-3 mb-6 items-center">
            <div className="text-sm font-medium text-gray-500">Filters:</div>
            {user.role === 'SuperAdmin' && (
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="h-9 w-[200px] bg-white border-gray-200 ">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WasteStreamChart data={wasteStreamData} />
            <Leaderboard data={leaderboardData} metric="waste" />
          </div>

          <ActivityFeed activities={activityData} />
        </main>
      </div>
    </div>
  );
}
