// 'use client';

// import React from 'react';
// import { useState, useEffect, useCallback } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { clearUser } from '../app/userSlice';
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
//   Filter,
//   ArrowUpRight,
//   PieChart,
//   RefreshCw,
//   ChevronDown,
//   Calendar,
//   Sparkles,
//   TrendingUp,
//   MoreHorizontal,
//   ChevronRight,
// } from 'lucide-react';
// import NetNada_logo from '../assets/NetNada_logo.png';
// import SideMenu from '../components/layouts/SideMenu';

// /**
//  * AdminDashboard component for admin user roles
//  */
// export default function AdminDashboard() {
//   // Get user data from Redux store
//   const user = useSelector((state) => state.user.user);
//   const navigate = useNavigate();
//   const dispatch = useDispatch();

//   // State for filters and data
//   const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
//   const [selectedOrgUnit, setSelectedOrgUnit] = useState('all');
//   const [selectedCompany, setSelectedCompany] = useState('');
//   const [companies, setCompanies] = useState([]);
//   const [orgUnits, setOrgUnits] = useState([]);
//   const [overviewData, setOverviewData] = useState(null);
//   const [wasteStreamData, setWasteStreamData] = useState([]);
//   const [leaderboardData, setLeaderboardData] = useState([]);
//   const [activityData, setActivityData] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // UI state
//   const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
//   const [showOrgUnitDropdown, setShowOrgUnitDropdown] = useState(false);
//   const [showMonthDropdown, setShowMonthDropdown] = useState(false);
//   const [activeTab, setActiveTab] = useState('waste');

//   /**
//    * Handle user logout
//    */
//   const handleLogout = async () => {
//     try {
//       const response = await axios.post('/api/v1/users/logout', {}, { withCredentials: true });
//       if (response.data.success) {
//         // sessionStorage.clear();
//         dispatch(clearUser());
//         window.location.href = '/login';
//       }
//     } catch (error) {
//       console.error('Logout failed:', error);
//     }
//   };

//   /**
//    * Fetch companies for SuperAdmin
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
//       // Set some mock data for demonstration
//       setCompanies([
//         { _id: '1', CompanyName: 'Acme Inc.' },
//         { _id: '2', CompanyName: 'Globex Corporation' },
//         { _id: '3', CompanyName: 'Initech' },
//       ]);
//     }
//   }, [user]);

//   /**
//    * Fetch org units based on user role
//    */
//   const fetchOrgUnits = useCallback(async () => {
//     let orgType = '';
//     switch (user?.role) {
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
//       // Set some mock data for demonstration
//       setOrgUnits([
//         { _id: '1', name: 'Headquarters' },
//         { _id: '2', name: 'East Region' },
//         { _id: '3', name: 'West Region' },
//         { _id: '4', name: 'North Branch' },
//       ]);
//     }
//   }, [user]);

//   /**
//    * Fetch overview data for the dashboard
//    */
//   const fetchOverviewData = useCallback(async () => {
//     const companyId = user?.role === 'SuperAdmin' ? selectedCompany : user?.company?._id;
//     const orgUnitQuery =
//       selectedOrgUnit && selectedOrgUnit !== 'all' ? `&orgUnitId=${selectedOrgUnit}` : '';
//     const companyQuery =
//       user?.role === 'SuperAdmin' && selectedCompany ? `&companyId=${selectedCompany}` : '';

//     try {
//       setIsLoading(true);
//       const response = await axios.get(
//         `/api/v1/analytics/overview?month=${selectedMonth}${orgUnitQuery}${companyQuery}`,
//         { withCredentials: true },
//       );

//       if (response.data.success) {
//         setOverviewData(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching overview data:', error);
//       // Set some mock data for demonstration
//       setOverviewData({
//         officeLocations: 12,
//         wasteBins: 48,
//         totalWaste: '1,245kg',
//         diversionRate: '78%',
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }, [selectedMonth, selectedOrgUnit, selectedCompany, user]);

//   /**
//    * Fetch waste stream data for the chart
//    */
//   const fetchWasteStreamData = useCallback(async () => {
//     const companyId = user?.role === 'SuperAdmin' ? selectedCompany : user?.company?._id;
//     const orgUnitQuery =
//       selectedOrgUnit && selectedOrgUnit !== 'all' ? `&orgUnitId=${selectedOrgUnit}` : '';
//     const companyQuery =
//       user?.role === 'SuperAdmin' && selectedCompany ? `&companyId=${selectedCompany}` : '';

//     if (!companyId && user?.role === 'SuperAdmin') return;

//     try {
//       const response = await axios.get(
//         `/api/v1/analytics/wasteByStream?month=${selectedMonth}${orgUnitQuery}${companyQuery}`,
//         { withCredentials: true },
//       );

//       if (response.data.success) {
//         setWasteStreamData(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching waste stream data:', error);
//       // Set some mock data for demonstration
//       setWasteStreamData([
//         { date: '2023-01-01', Landfill: 45, Commingled: 30, Organic: 25, Paper: 20, Glass: 10 },
//         { date: '2023-01-02', Landfill: 40, Commingled: 35, Organic: 20, Paper: 25, Glass: 15 },
//         // ... more data points
//       ]);
//     }
//   }, [selectedMonth, selectedOrgUnit, selectedCompany, user]);

//   /**
//    * Fetch leaderboard data
//    */
//   const fetchLeaderboardData = useCallback(async () => {
//     const companyId = user?.role === 'SuperAdmin' ? selectedCompany : user?.company?._id;
//     const orgUnitQuery =
//       selectedOrgUnit && selectedOrgUnit !== 'all' ? `&orgUnitId=${selectedOrgUnit}` : '';
//     const companyQuery =
//       user?.role === 'SuperAdmin' && selectedCompany ? `&companyId=${selectedCompany}` : '';

//     if (!companyId && user?.role === 'SuperAdmin') return;

//     try {
//       const response = await axios.get(
//         `/api/v1/analytics/leaderboard?month=${selectedMonth}${orgUnitQuery}${companyQuery}`,
//         { withCredentials: true },
//       );

//       if (response.data.success) {
//         setLeaderboardData(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching leaderboard data:', error);
//       // Set some mock data for demonstration
//       setLeaderboardData([
//         { _id: '1', branchName: 'North Branch', totalWaste: 320, diversionRate: 85 },
//         { _id: '2', branchName: 'East Region', totalWaste: 280, diversionRate: 78 },
//         { _id: '3', branchName: 'West Region', totalWaste: 250, diversionRate: 72 },
//         { _id: '4', branchName: 'South Branch', totalWaste: 220, diversionRate: 65 },
//       ]);
//     }
//   }, [selectedMonth, selectedOrgUnit, selectedCompany, user]);

//   /**
//    * Fetch activity feed data
//    */
//   const fetchActivityData = useCallback(async () => {
//     const companyId = user?.role === 'SuperAdmin' ? selectedCompany : user?.company?._id;
//     const orgUnitQuery =
//       selectedOrgUnit && selectedOrgUnit !== 'all' ? `&orgUnitId=${selectedOrgUnit}` : '';
//     const companyQuery =
//       user?.role === 'SuperAdmin' && selectedCompany ? `&companyId=${selectedCompany}` : '';

//     if (!companyId && user?.role === 'SuperAdmin') return;

//     try {
//       const response = await axios.get(
//         `/api/v1/analytics/activityFeed?month=${selectedMonth}${orgUnitQuery}${companyQuery}`,
//         { withCredentials: true },
//       );

//       if (response.data.success) {
//         setActivityData(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching activity data:', error);
//       // Set some mock data for demonstration
//       setActivityData([
//         {
//           id: '1',
//           title: 'Anomaly Detected',
//           description: 'Unusual spike in General Waste at North Branch',
//           timestamp: 'Today at 2:30 PM',
//           icon: <Activity className="h-3 w-3 text-white" />,
//           iconBg: 'bg-rose-500',
//         },
//         {
//           id: '2',
//           title: 'Diversion Target Achieved',
//           description: 'East Region reached 80% diversion rate',
//           timestamp: 'Yesterday at 10:15 AM',
//           icon: <Trophy className="h-3 w-3 text-white" />,
//           iconBg: 'bg-emerald-500',
//         },
//         {
//           id: '3',
//           title: 'New Bin Added',
//           description: 'Glass recycling bin added to West Region',
//           timestamp: 'Jan 15, 2023',
//           icon: <Trash2 className="h-3 w-3 text-white" />,
//           iconBg: 'bg-blue-500',
//         },
//       ]);
//     }
//   }, [selectedMonth, selectedOrgUnit, selectedCompany, user]);

//   // Fetch initial data on component mount
//   useEffect(() => {
//     let shouldFetchCompanies = false;
//     const shouldFetchOrgUnits = true;
//     const shouldFetchDashboardData = true;

//     if (user?.role === 'SuperAdmin') {
//       shouldFetchCompanies = true;
//     }

//     if (shouldFetchCompanies) {
//       fetchCompanies();
//     }

//     if (shouldFetchOrgUnits) {
//       fetchOrgUnits();
//     }

//     if (shouldFetchDashboardData) {
//       fetchOverviewData();
//       fetchWasteStreamData();
//       fetchLeaderboardData();
//       fetchActivityData();
//     }
//   }, [
//     fetchCompanies,
//     fetchOrgUnits,
//     fetchOverviewData,
//     fetchWasteStreamData,
//     fetchLeaderboardData,
//     fetchActivityData,
//     user,
//   ]);

//   // If user data is not available, show loading state
//   if (!user) {
//     return (
//       <div className="flex items-center justify-center h-screen bg-[#f8fafc]">
//         <div className="flex flex-col items-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
//           <p className="text-gray-600">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   // Generate month options for the last 12 months
//   const monthOptions = Array.from({ length: 12 }, (_, i) => {
//     const date = subMonths(new Date(), i);
//     return {
//       value: format(date, 'yyyy-MM'),
//       label: format(date, 'MMMM yyyy'),
//     };
//   });

//   // Close all dropdowns when clicking outside
//   useEffect(() => {
//     const handleClickOutside = () => {
//       setShowCompanyDropdown(false);
//       setShowOrgUnitDropdown(false);
//       setShowMonthDropdown(false);
//     };

//     document.addEventListener('click', handleClickOutside);
//     return () => {
//       document.removeEventListener('click', handleClickOutside);
//     };
//   }, []);

//   return (
//     <div className="flex h-screen bg-[#f8fafc]">
//       {/* Show side menu only for SuperAdmin */}
//       {user.role === 'SuperAdmin' && <SideMenu />}

//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Header */}
//         <header className="bg-white border-b border-gray-100 py-3 px-6 shadow-sm">
//           <div className="flex items-center justify-between">
//             {/* Left: Company name or logo */}
//             <div>
//               {user.role === 'SuperAdmin' ? (
//                 <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
//               ) : (
//                 <div className="flex items-center">
//                   <img
//                     src={user.company?.logo || NetNada_logo}
//                     alt="Company Logo"
//                     className="h-9 mr-3"
//                   />
//                   <h1 className="text-xl font-semibold text-gray-800">
//                     {user.company?.CompanyName || 'Company Name'}
//                   </h1>
//                 </div>
//               )}
//             </div>

//             {/* Right: Invite User button, notification bell, and logout */}
//             <div className="flex items-center space-x-3">
//               <div className="relative">
//                 <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
//                   <Bell className="h-5 w-5 text-gray-600" />
//                   <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
//                 </button>
//               </div>

//               {/* Invite User button - not visible for SuperAdmin */}
//               {user.role !== 'SuperAdmin' && (
//                 <button
//                   className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
//                   onClick={() =>
//                     navigate(`/invite-user/${user.company?._id}`, {
//                       state: { fromDashboard: true },
//                     })
//                   }
//                 >
//                   <UserPlus className="h-4 w-4 mr-1.5" />
//                   Invite User
//                 </button>
//               )}

//               {/* Only show logout button if user is not SuperAdmin */}
//               {user.role !== 'SuperAdmin' && (
//                 <button
//                   className="flex items-center px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
//                   onClick={handleLogout}
//                 >
//                   <LogOut className="h-4 w-4 mr-1.5" />
//                   Logout
//                 </button>
//               )}
//             </div>
//           </div>
//         </header>

//         <main className="flex-1 overflow-auto">
//           <div className="max-w-[1600px] mx-auto p-6">
//             {/* Dashboard Header with Filters */}
//             <div className="mb-8">
//               <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900 mb-1">
//                     Waste Management Dashboard
//                   </h2>
//                   <p className="text-gray-500">
//                     Monitor and analyze waste data across your organization
//                   </p>
//                 </div>

//                 <div className="flex items-center space-x-3 mt-4 md:mt-0">
//                   <div className="relative">
//                     <button
//                       className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         setShowMonthDropdown(!showMonthDropdown);
//                         setShowCompanyDropdown(false);
//                         setShowOrgUnitDropdown(false);
//                       }}
//                     >
//                       <Calendar className="h-4 w-4 mr-2 text-gray-500" />
//                       <span>
//                         {monthOptions.find((m) => m.value === selectedMonth)?.label ||
//                           'Select Month'}
//                       </span>
//                       <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
//                     </button>

//                     {showMonthDropdown && (
//                       <div className="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 max-h-64 overflow-y-auto">
//                         {monthOptions.map((option) => (
//                           <button
//                             key={option.value}
//                             className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
//                               selectedMonth === option.value
//                                 ? 'bg-indigo-50 text-indigo-600 font-medium'
//                                 : 'text-gray-700'
//                             }`}
//                             onClick={() => {
//                               setSelectedMonth(option.value);
//                               setShowMonthDropdown(false);
//                             }}
//                           >
//                             {option.label}
//                           </button>
//                         ))}
//                       </div>
//                     )}
//                   </div>

//                   <button
//                     className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
//                     onClick={() => {
//                       fetchOverviewData();
//                       fetchWasteStreamData();
//                       fetchLeaderboardData();
//                       fetchActivityData();
//                     }}
//                   >
//                     <RefreshCw className="h-4 w-4 mr-2 text-gray-500" />
//                     Refresh
//                   </button>
//                 </div>
//               </div>

//               <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
//                 <div className="flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
//                   <Filter className="h-4 w-4 mr-1.5" />
//                   Filters
//                 </div>

//                 {/* Company filter for SuperAdmin */}
//                 {user.role === 'SuperAdmin' && (
//                   <div className="relative">
//                     <button
//                       className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         setShowCompanyDropdown(!showCompanyDropdown);
//                         setShowOrgUnitDropdown(false);
//                         setShowMonthDropdown(false);
//                       }}
//                     >
//                       <span>
//                         {companies.find((c) => c._id === selectedCompany)?.CompanyName ||
//                           'Select Company'}
//                       </span>
//                       <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
//                     </button>

//                     {showCompanyDropdown && (
//                       <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 max-h-64 overflow-y-auto">
//                         {companies.map((company) => (
//                           <button
//                             key={company._id}
//                             className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
//                               selectedCompany === company._id
//                                 ? 'bg-indigo-50 text-indigo-600 font-medium'
//                                 : 'text-gray-700'
//                             }`}
//                             onClick={() => {
//                               setSelectedCompany(company._id);
//                               setShowCompanyDropdown(false);
//                             }}
//                           >
//                             {company.CompanyName}
//                           </button>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* OrgUnit filter */}
//                 <div className="relative">
//                   <button
//                     className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setShowOrgUnitDropdown(!showOrgUnitDropdown);
//                       setShowCompanyDropdown(false);
//                       setShowMonthDropdown(false);
//                     }}
//                   >
//                     <span>
//                       {selectedOrgUnit === 'all'
//                         ? 'All Units'
//                         : orgUnits.find((u) => u._id === selectedOrgUnit)?.name || 'Select Unit'}
//                     </span>
//                     <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
//                   </button>

//                   {showOrgUnitDropdown && (
//                     <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1 max-h-64 overflow-y-auto">
//                       <button
//                         className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
//                           selectedOrgUnit === 'all'
//                             ? 'bg-indigo-50 text-indigo-600 font-medium'
//                             : 'text-gray-700'
//                         }`}
//                         onClick={() => {
//                           setSelectedOrgUnit('all');
//                           setShowOrgUnitDropdown(false);
//                         }}
//                       >
//                         All Units
//                       </button>
//                       {orgUnits.map((unit) => (
//                         <button
//                           key={unit._id}
//                           className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
//                             selectedOrgUnit === unit._id
//                               ? 'bg-indigo-50 text-indigo-600 font-medium'
//                               : 'text-gray-700'
//                           }`}
//                           onClick={() => {
//                             setSelectedOrgUnit(unit._id);
//                             setShowOrgUnitDropdown(false);
//                           }}
//                         >
//                           {unit.name}
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Overview Section */}
//             {isLoading ? (
//               <div className="flex justify-center items-center h-32 bg-white rounded-xl border border-gray-100 shadow-sm mb-8">
//                 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
//               </div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//                 {/* Office Locations */}
//                 <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md overflow-hidden text-white relative group">
//                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mt-10 -mr-10 group-hover:scale-110 transition-transform duration-500"></div>
//                   <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -mb-8 -ml-8"></div>
//                   <div className="p-6 relative z-10">
//                     <div className="flex justify-between items-start mb-4">
//                       <div className="p-3 bg-white/20 rounded-lg">
//                         <Building2 className="h-6 w-6 text-white" />
//                       </div>
//                       <div className="flex items-center text-white/80 text-sm">
//                         <TrendingUp className="h-4 w-4 mr-1" />
//                         <span>+5% from last month</span>
//                       </div>
//                     </div>
//                     <h3 className="text-3xl font-bold mb-1">
//                       {overviewData?.officeLocations || 0}
//                     </h3>
//                     <p className="text-white/80 font-medium">Office Locations</p>
//                   </div>
//                 </div>

//                 {/* Waste Bins */}
//                 <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-md overflow-hidden text-white relative group">
//                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mt-10 -mr-10 group-hover:scale-110 transition-transform duration-500"></div>
//                   <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -mb-8 -ml-8"></div>
//                   <div className="p-6 relative z-10">
//                     <div className="flex justify-between items-start mb-4">
//                       <div className="p-3 bg-white/20 rounded-lg">
//                         <Trash2 className="h-6 w-6 text-white" />
//                       </div>
//                       <div className="flex items-center text-white/80 text-sm">
//                         <TrendingUp className="h-4 w-4 mr-1" />
//                         <span>+8% from last month</span>
//                       </div>
//                     </div>
//                     <h3 className="text-3xl font-bold mb-1">{overviewData?.wasteBins || 0}</h3>
//                     <p className="text-white/80 font-medium">Waste Bins</p>
//                   </div>
//                 </div>

//                 {/* Total Waste */}
//                 <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md overflow-hidden text-white relative group">
//                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mt-10 -mr-10 group-hover:scale-110 transition-transform duration-500"></div>
//                   <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -mb-8 -ml-8"></div>
//                   <div className="p-6 relative z-10">
//                     <div className="flex justify-between items-start mb-4">
//                       <div className="p-3 bg-white/20 rounded-lg">
//                         <BarChart3 className="h-6 w-6 text-white" />
//                       </div>
//                       <div className="flex items-center text-white/80 text-sm">
//                         <ArrowUpRight className="h-4 w-4 mr-1" />
//                         <span>3.2% increase</span>
//                       </div>
//                     </div>
//                     <h3 className="text-3xl font-bold mb-1">{overviewData?.totalWaste || '0kg'}</h3>
//                     <p className="text-white/80 font-medium">Total Waste</p>
//                   </div>
//                 </div>

//                 {/* Diversion Rate */}
//                 <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-md overflow-hidden text-white relative group">
//                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mt-10 -mr-10 group-hover:scale-110 transition-transform duration-500"></div>
//                   <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -mb-8 -ml-8"></div>
//                   <div className="p-6 relative z-10">
//                     <div className="flex justify-between items-start mb-4">
//                       <div className="p-3 bg-white/20 rounded-lg">
//                         <Recycle className="h-6 w-6 text-white" />
//                       </div>
//                       <div className="flex items-center text-white/80 text-sm">
//                         <ArrowUpRight className="h-4 w-4 mr-1" />
//                         <span>5.5% increase</span>
//                       </div>
//                     </div>
//                     <h3 className="text-3xl font-bold mb-1">
//                       {overviewData?.diversionRate || '0%'}
//                     </h3>
//                     <p className="text-white/80 font-medium">Diversion Rate</p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Waste Stream Chart and Leaderboard */}
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//               {/* Waste Stream Chart */}
//               <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
//                 <div className="flex items-center justify-between p-5 border-b border-gray-100">
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-800">Waste by Stream</h3>
//                     <p className="text-sm text-gray-500">
//                       Breakdown of waste by category for the selected month
//                     </p>
//                   </div>
//                   <div className="flex space-x-2">
//                     <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
//                       <Sparkles className="h-4 w-4 text-gray-500" />
//                     </button>
//                     <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors">
//                       <MoreHorizontal className="h-4 w-4 text-gray-500" />
//                     </button>
//                   </div>
//                 </div>

//                 {!wasteStreamData || wasteStreamData.length === 0 ? (
//                   <div className="flex flex-col items-center justify-center h-[300px] p-6">
//                     <PieChart className="h-12 w-12 text-gray-200 mb-3" />
//                     <p className="text-gray-500 text-sm">No waste stream data available</p>
//                   </div>
//                 ) : (
//                   <div className="p-5">
//                     <div className="flex flex-wrap gap-3 mb-4">
//                       <div className="flex items-center">
//                         <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
//                         <span className="text-sm text-gray-600">Landfill</span>
//                       </div>
//                       <div className="flex items-center">
//                         <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
//                         <span className="text-sm text-gray-600">Commingled</span>
//                       </div>
//                       <div className="flex items-center">
//                         <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
//                         <span className="text-sm text-gray-600">Organic</span>
//                       </div>
//                       <div className="flex items-center">
//                         <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
//                         <span className="text-sm text-gray-600">Paper</span>
//                       </div>
//                       <div className="flex items-center">
//                         <div className="w-3 h-3 rounded-full bg-gray-500 mr-2"></div>
//                         <span className="text-sm text-gray-600">Glass</span>
//                       </div>
//                     </div>

//                     <div className="h-[250px] w-full bg-gradient-to-b from-indigo-50 to-white rounded-lg flex items-center justify-center">
//                       <div className="text-center">
//                         <PieChart className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
//                         <p className="text-gray-600 text-sm">
//                           Waste stream chart would render here
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Leaderboard */}
//               <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
//                 <div className="flex items-center justify-between p-5 border-b border-gray-100">
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-800">Leaderboard</h3>
//                     <p className="text-sm text-gray-500">
//                       {activeTab === 'waste'
//                         ? 'Branches ranked by total waste reduction'
//                         : 'Branches ranked by diversion rate'}
//                     </p>
//                   </div>

//                   <div className="flex bg-gray-100 p-1 rounded-lg">
//                     <button
//                       className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
//                         activeTab === 'waste' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600'
//                       }`}
//                       onClick={() => setActiveTab('waste')}
//                     >
//                       Waste
//                     </button>
//                     <button
//                       className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
//                         activeTab === 'diversion'
//                           ? 'bg-white text-gray-800 shadow-sm'
//                           : 'text-gray-600'
//                       }`}
//                       onClick={() => setActiveTab('diversion')}
//                     >
//                       Diversion
//                     </button>
//                   </div>
//                 </div>

//                 {!leaderboardData || leaderboardData.length === 0 ? (
//                   <div className="flex flex-col items-center justify-center h-[300px] p-6">
//                     <Trophy className="h-12 w-12 text-gray-200 mb-3" />
//                     <p className="text-gray-500 text-sm">No leaderboard data available</p>
//                   </div>
//                 ) : (
//                   <div className="p-5">
//                     <div className="space-y-5">
//                       {leaderboardData.map((item, index) => (
//                         <div key={item._id || item.id} className="group">
//                           <div className="flex items-center mb-2">
//                             <div
//                               className={`w-10 h-10 flex items-center justify-center rounded-lg mr-4 ${
//                                 index === 0
//                                   ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white'
//                                   : index === 1
//                                   ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white'
//                                   : index === 2
//                                   ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white'
//                                   : 'bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700'
//                               }`}
//                             >
//                               {index === 0 ? (
//                                 <Trophy className="h-5 w-5" />
//                               ) : (
//                                 <span className="text-base font-bold">{index + 1}</span>
//                               )}
//                             </div>
//                             <div className="flex-1">
//                               <div className="flex justify-between mb-2">
//                                 <span className="text-base font-medium text-gray-800 group-hover:text-indigo-600 transition-colors">
//                                   {item.branchName || item.name}
//                                 </span>
//                                 <span className="text-base font-bold text-gray-900">
//                                   {activeTab === 'waste'
//                                     ? `${item.totalWaste || item.waste}kg`
//                                     : `${item.diversionRate}%`}
//                                 </span>
//                               </div>
//                               <div className="relative h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
//                                 <div
//                                   className={`absolute top-0 left-0 h-full rounded-full ${
//                                     index === 0
//                                       ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
//                                       : index === 1
//                                       ? 'bg-gradient-to-r from-gray-300 to-gray-400'
//                                       : index === 2
//                                       ? 'bg-gradient-to-r from-amber-600 to-amber-700'
//                                       : 'bg-gradient-to-r from-indigo-400 to-indigo-500'
//                                   }`}
//                                   style={{
//                                     width: `${
//                                       activeTab === 'waste'
//                                         ? ((item.totalWaste || item.waste) /
//                                             (leaderboardData[0].totalWaste ||
//                                               leaderboardData[0].waste)) *
//                                           100
//                                         : item.diversionRate
//                                     }%`,
//                                   }}
//                                 ></div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Activity Feed */}
//             <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
//               <div className="flex items-center justify-between p-5 border-b border-gray-100">
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-800">Activity Feed</h3>
//                   <p className="text-sm text-gray-500">Recent events and anomalies</p>
//                 </div>
//                 <button className="px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors">
//                   View All
//                 </button>
//               </div>

//               {!activityData || activityData.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center h-[300px] p-6">
//                   <Activity className="h-12 w-12 text-gray-200 mb-3" />
//                   <p className="text-gray-500 text-sm">No activity data available</p>
//                 </div>
//               ) : (
//                 <div className="divide-y divide-gray-100">
//                   {activityData.map((activity) => (
//                     <div key={activity.id} className="p-5 hover:bg-gray-50 transition-colors">
//                       <div className="flex">
//                         <div className={`${activity.iconBg} p-3 rounded-xl mr-4`}>
//                           {React.isValidElement(activity.icon) ? (
//                             React.cloneElement(activity.icon, { className: 'h-5 w-5 text-white' })
//                           ) : (
//                             <Activity className="h-5 w-5 text-white" />
//                           )}
//                         </div>
//                         <div className="flex-1">
//                           <div className="flex items-center justify-between mb-1">
//                             <h4 className="text-base font-semibold text-gray-800">
//                               {activity.title}
//                             </h4>
//                             <span className="text-xs text-gray-400">{activity.timestamp}</span>
//                           </div>
//                           <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
//                           <div className="flex items-center">
//                             <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center">
//                               View Details
//                               <ChevronRight className="h-3 w-3 ml-1" />
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }
'use client';

import { useState, useMemo } from 'react';
import {
  Bell,
  LogOut,
  UserPlus,
  ChevronDown,
  Calendar,
  TrendingUp,
  Trash2,
  Recycle,
  Award,
  Activity,
  Tv,
  MapPin,
  Building,
  Filter,
  Users,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Mock data for demonstration
const mockAnalyticsData = {
  totalBins: 1245,
  landfillDiversion: '78%',
  totalWasteCollected: '3,450 kg',
};

const mockWasteTrendData = [
  { date: 'Mon', 'General Waste': 400, Paper: 240, Plastic: 180, Compost: 320 },
  { date: 'Tue', 'General Waste': 300, Paper: 280, Plastic: 220, Compost: 340 },
  { date: 'Wed', 'General Waste': 350, Paper: 250, Plastic: 190, Compost: 280 },
  { date: 'Thu', 'General Waste': 280, Paper: 290, Plastic: 230, Compost: 310 },
  { date: 'Fri', 'General Waste': 320, Paper: 270, Plastic: 210, Compost: 290 },
  { date: 'Sat', 'General Waste': 250, Paper: 230, Plastic: 170, Compost: 250 },
  { date: 'Sun', 'General Waste': 200, Paper: 210, Plastic: 150, Compost: 220 },
];

const mockActivityFeed = [
  { id: 1, event: 'Highest diversion rate', value: '92%', date: 'Monday, March 15', trend: 'up' },
  {
    id: 2,
    event: 'Lowest general waste',
    value: '120 kg',
    date: 'Wednesday, March 17',
    trend: 'up',
  },
  { id: 3, event: 'Highest recycling day', value: '450 kg', date: 'Friday, March 19', trend: 'up' },
  { id: 4, event: 'Lowest diversion rate', value: '65%', date: 'Tuesday, March 16', trend: 'down' },
];

const mockLeaderboardData = [
  { id: 1, name: 'EcoTech Solutions', diversion: '92%', waste: '1,200 kg' },
  { id: 2, name: 'Green Innovations', diversion: '88%', waste: '980 kg' },
  { id: 3, name: 'Sustainable Corp', diversion: '85%', waste: '1,050 kg' },
  { id: 4, name: 'EcoFriendly Inc', diversion: '82%', waste: '890 kg' },
  { id: 5, name: 'Planet Savers Ltd', diversion: '79%', waste: '1,100 kg' },
];

const mockOfficesData = [
  {
    id: 1,
    name: 'Downtown HQ',
    location: '123 Main St, New York',
    bins: ['General Waste', 'Paper', 'Plastic', 'Compost'],
    diversion: '89%',
  },
  {
    id: 2,
    name: 'West Side Branch',
    location: '456 Park Ave, New York',
    bins: ['General Waste', 'Paper', 'Plastic'],
    diversion: '76%',
  },
  {
    id: 3,
    name: 'South Campus',
    location: '789 Broadway, New York',
    bins: ['General Waste', 'Paper', 'Plastic', 'Compost', 'Glass'],
    diversion: '92%',
  },
  {
    id: 4,
    name: 'East Side Office',
    location: '101 East End Ave, New York',
    bins: ['General Waste', 'Paper', 'Plastic', 'Compost'],
    diversion: '84%',
  },
];

const mockCompanies = [
  { id: 1, name: 'EcoTech Solutions' },
  { id: 2, name: 'Green Innovations' },
  { id: 3, name: 'Sustainable Corp' },
  { id: 4, name: 'EcoFriendly Inc' },
  { id: 5, name: 'Planet Savers Ltd' },
];

const mockOrgUnits = [
  { id: 1, name: 'North America', companyId: 1 },
  { id: 2, name: 'Europe', companyId: 1 },
  { id: 3, name: 'Asia Pacific', companyId: 1 },
  { id: 4, name: 'United States', companyId: 2 },
  { id: 5, name: 'Canada', companyId: 2 },
  { id: 6, name: 'UK Division', companyId: 3 },
  { id: 7, name: 'Germany Division', companyId: 3 },
  { id: 8, name: 'East Coast', companyId: 4 },
  { id: 9, name: 'West Coast', companyId: 4 },
  { id: 10, name: 'Australia', companyId: 5 },
];

// Color palette for the dashboard
const colors = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  background: '#0f172a',
  cardBg: 'rgba(30, 41, 59, 0.8)',
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  border: 'rgba(148, 163, 184, 0.2)',
  chartColors: ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
};

// Main Dashboard Component
const AdminDashboard = () => {
  // Add theme state at the top of the AdminDashboard component
  const [theme, setTheme] = useState('dark');
  const [userRole, setUserRole] = useState('SuperAdmin'); // Options: SuperAdmin, CountryAdmin, RegionalAdmin, CityAdmin, OfficeAdmin
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedOrgUnit, setSelectedOrgUnit] = useState(null);
  const [dateFilter, setDateFilter] = useState('month'); // Options: week, month
  const [isDropdownOpen, setIsDropdownOpen] = useState({
    date: false,
    company: false,
    orgUnit: false,
  });

  // Filter org units based on selected company
  const filteredOrgUnits = useMemo(() => {
    if (!selectedCompany) return [];
    return mockOrgUnits.filter((unit) => unit.companyId === selectedCompany.id);
  }, [selectedCompany]);

  // Handle company selection
  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setSelectedOrgUnit(null); // Reset org unit when company changes
    setIsDropdownOpen({ ...isDropdownOpen, company: false });
  };

  // Handle org unit selection
  const handleOrgUnitSelect = (orgUnit) => {
    setSelectedOrgUnit(orgUnit);
    setIsDropdownOpen({ ...isDropdownOpen, orgUnit: false });
  };

  // Toggle dropdown visibility
  const toggleDropdown = (dropdown) => {
    setIsDropdownOpen({
      ...isDropdownOpen,
      [dropdown]: !isDropdownOpen[dropdown],
    });
  };

  // Handle date filter change
  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    setIsDropdownOpen({ ...isDropdownOpen, date: false });
  };

  // Handle logout
  const handleLogout = () => {
    console.log('Logging out...');
    // In a real app, you would call the logout API endpoint
    // POST /api/v1/users/logout
  };

  // Handle invite user
  const handleInviteUser = () => {
    console.log('Inviting user...');
    // In a real app, you would open a modal or navigate to invite user page
  };

  // Add toggleTheme function after the handleInviteUser function
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Replace the outer div in the return statement with this theme-aware container
  return (
    <div
      className={`min-h-screen font-sans ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-900 to-slate-800 text-slate-100'
          : 'bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800'
      }`}
    >
      {/* Header */}
      <header
        className={`border-b sticky top-0 z-10 backdrop-blur-sm ${
          theme === 'dark'
            ? 'border-slate-700/50 bg-slate-900/70'
            : 'border-slate-200/70 bg-white/70'
        }`}
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              EcoNet<span className="text-indigo-400">Admin</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-800/70 hover:bg-slate-700/70 text-yellow-400'
                  : 'bg-slate-200/70 hover:bg-slate-300/70 text-indigo-600'
              }`}
            >
              {theme === 'dark' ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              )}
            </button>

            <button
              className={`p-2 rounded-full relative ${
                theme === 'dark'
                  ? 'bg-slate-800/70 hover:bg-slate-700/70'
                  : 'bg-slate-200/70 hover:bg-slate-300/70'
              }`}
            >
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500"></span>
            </button>

            {userRole !== 'SuperAdmin' && (
              <button
                onClick={handleInviteUser}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors text-white text-sm"
              >
                <UserPlus size={16} />
                <span>Invite User</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm ${
                theme === 'dark'
                  ? 'bg-slate-700/70 hover:bg-slate-600/70 text-white'
                  : 'bg-slate-200/70 hover:bg-slate-300/70 text-slate-800'
              }`}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Tabs and Filters */}
        <div
          className={`mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 rounded-xl border ${
            theme === 'dark'
              ? 'backdrop-blur-sm bg-slate-800/30 border-slate-700/50'
              : 'backdrop-blur-sm bg-white/50 border-slate-200/70'
          }`}
        >
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white'
                  : theme === 'dark'
                  ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
                  : 'bg-slate-200/70 hover:bg-slate-300/70 text-slate-700'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'leaderboard'
                  ? 'bg-indigo-600 text-white'
                  : theme === 'dark'
                  ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
                  : 'bg-slate-200/70 hover:bg-slate-300/70 text-slate-700'
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('offices')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'offices'
                  ? 'bg-indigo-600 text-white'
                  : theme === 'dark'
                  ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
                  : 'bg-slate-200/70 hover:bg-slate-300/70 text-slate-700'
              }`}
            >
              Offices
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Date Filter */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('date')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                  theme === 'dark'
                    ? 'bg-slate-700/70 hover:bg-slate-600/70 text-white'
                    : 'bg-slate-200/70 hover:bg-slate-300/70 text-slate-800'
                }`}
              >
                <Calendar size={16} />
                <span>{dateFilter === 'week' ? 'This Week' : 'This Month'}</span>
                <ChevronDown size={16} />
              </button>

              {isDropdownOpen.date && (
                <div
                  className={`absolute right-0 mt-2 w-40 rounded-lg shadow-lg z-50 ${
                    theme === 'dark'
                      ? 'bg-slate-800 border border-slate-700'
                      : 'bg-white border border-slate-200'
                  }`}
                >
                  <button
                    onClick={() => handleDateFilterChange('week')}
                    className={`w-full text-left px-4 py-2 rounded-t-lg text-sm ${
                      theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                    }`}
                  >
                    This Week
                  </button>
                  <button
                    onClick={() => handleDateFilterChange('month')}
                    className={`w-full text-left px-4 py-2 rounded-b-lg text-sm ${
                      theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                    }`}
                  >
                    This Month
                  </button>
                </div>
              )}
            </div>

            {/* Company Dropdown (Only for SuperAdmin) */}
            {userRole === 'SuperAdmin' && (
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('company')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                    theme === 'dark'
                      ? 'bg-slate-700/70 hover:bg-slate-600/70 text-white'
                      : 'bg-slate-200/70 hover:bg-slate-300/70 text-slate-800'
                  }`}
                >
                  <Building size={16} />
                  <span>{selectedCompany ? selectedCompany.name : 'All Organizations'}</span>
                  <ChevronDown size={16} />
                </button>

                {isDropdownOpen.company && (
                  <div
                    className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto ${
                      theme === 'dark'
                        ? 'bg-slate-800 border border-slate-700'
                        : 'bg-white border border-slate-200'
                    }`}
                  >
                    <button
                      onClick={() => handleCompanySelect(null)}
                      className={`w-full text-left px-4 py-2 rounded-t-lg text-sm ${
                        theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                      }`}
                    >
                      All Organizations
                    </button>
                    {mockCompanies.map((company) => (
                      <button
                        key={company.id}
                        onClick={() => handleCompanySelect(company)}
                        className={`w-full text-left px-4 py-2 text-sm ${
                          theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                        }`}
                      >
                        {company.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Org Unit Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('orgUnit')}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                  userRole === 'SuperAdmin' && !selectedCompany
                    ? theme === 'dark'
                      ? 'bg-slate-700/40 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-200/40 text-slate-400 cursor-not-allowed'
                    : theme === 'dark'
                    ? 'bg-slate-700/70 hover:bg-slate-600/70 text-white'
                    : 'bg-slate-200/70 hover:bg-slate-300/70 text-slate-800'
                }`}
                disabled={userRole === 'SuperAdmin' && !selectedCompany}
              >
                <Users size={16} />
                <span>{selectedOrgUnit ? selectedOrgUnit.name : 'All Organization Units'}</span>
                <ChevronDown size={16} />
              </button>

              {isDropdownOpen.orgUnit && (userRole !== 'SuperAdmin' || selectedCompany) && (
                <div
                  className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto ${
                    theme === 'dark'
                      ? 'bg-slate-800 border border-slate-700'
                      : 'bg-white border border-slate-200'
                  }`}
                >
                  <button
                    onClick={() => handleOrgUnitSelect(null)}
                    className={`w-full text-left px-4 py-2 rounded-t-lg text-sm ${
                      theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                    }`}
                  >
                    All Organization Units
                  </button>
                  {filteredOrgUnits.map((orgUnit) => (
                    <button
                      key={orgUnit.id}
                      onClick={() => handleOrgUnitSelect(orgUnit)}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                      }`}
                    >
                      {orgUnit.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Tab Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* Analytics Cards - First Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Bins Card */}
              <div
                className={`rounded-xl border p-6 shadow-lg hover:shadow-indigo-500/10 transition-all group ${
                  theme === 'dark'
                    ? 'backdrop-blur-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50'
                    : 'backdrop-blur-md bg-white border-slate-200/70'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Total Bins
                    </p>
                    <h3
                      className={`text-3xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {mockAnalyticsData.totalBins}
                    </h3>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/30'
                        : 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200'
                    } transition-colors`}
                  >
                    <Trash2 size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-emerald-500 flex items-center">
                    <ArrowUp size={14} className="mr-1" />
                    12%
                  </span>
                  <span
                    className={`ml-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
                  >
                    from last month
                  </span>
                </div>
              </div>

              {/* Landfill Diversion Card */}
              <div
                className={`rounded-xl border p-6 shadow-lg hover:shadow-emerald-500/10 transition-all group ${
                  theme === 'dark'
                    ? 'backdrop-blur-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50'
                    : 'backdrop-blur-md bg-white border-slate-200/70'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Landfill Diversion
                    </p>
                    <h3
                      className={`text-3xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {mockAnalyticsData.landfillDiversion}
                    </h3>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30'
                        : 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200'
                    } transition-colors`}
                  >
                    <Recycle size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-emerald-500 flex items-center">
                    <ArrowUp size={14} className="mr-1" />
                    8%
                  </span>
                  <span
                    className={`ml-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
                  >
                    from last month
                  </span>
                </div>
              </div>

              {/* Total Waste Collected Card */}
              <div
                className={`rounded-xl border p-6 shadow-lg hover:shadow-amber-500/10 transition-all group ${
                  theme === 'dark'
                    ? 'backdrop-blur-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50'
                    : 'backdrop-blur-md bg-white border-slate-200/70'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Total Waste Collected
                    </p>
                    <h3
                      className={`text-3xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {mockAnalyticsData.totalWasteCollected}
                    </h3>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-amber-500/20 text-amber-400 group-hover:bg-amber-500/30'
                        : 'bg-amber-100 text-amber-600 group-hover:bg-amber-200'
                    } transition-colors`}
                  >
                    <TrendingUp size={24} />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-emerald-500 flex items-center">
                    <ArrowUp size={14} className="mr-1" />
                    15%
                  </span>
                  <span
                    className={`ml-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
                  >
                    from last month
                  </span>
                </div>
              </div>
            </div>

            {/* Waste Line Chart - Second Row */}
            <div
              className={`rounded-xl border p-6 shadow-lg mb-8 ${
                theme === 'dark'
                  ? 'backdrop-blur-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50'
                  : 'backdrop-blur-md bg-white border-slate-200/70'
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h3
                  className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}
                >
                  Waste Collection Trends
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    className={`p-1.5 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-700/70 hover:bg-slate-600/70'
                        : 'bg-slate-200/70 hover:bg-slate-300/70'
                    }`}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    className={`p-1.5 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-700/70 hover:bg-slate-600/70'
                        : 'bg-slate-200/70 hover:bg-slate-300/70'
                    }`}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockWasteTrendData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={
                        theme === 'dark' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.3)'
                      }
                    />
                    <XAxis
                      dataKey="date"
                      stroke={theme === 'dark' ? '#cbd5e1' : '#64748b'}
                      tick={{ fill: theme === 'dark' ? '#cbd5e1' : '#64748b' }}
                    />
                    <YAxis
                      stroke={theme === 'dark' ? '#cbd5e1' : '#64748b'}
                      tick={{ fill: theme === 'dark' ? '#cbd5e1' : '#64748b' }}
                      tickFormatter={(value) => `${value} kg`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor:
                          theme === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                        borderColor:
                          theme === 'dark'
                            ? 'rgba(148, 163, 184, 0.2)'
                            : 'rgba(148, 163, 184, 0.3)',
                        borderRadius: '0.5rem',
                        color: theme === 'dark' ? '#f8fafc' : '#1e293b',
                      }}
                      itemStyle={{ color: theme === 'dark' ? '#f8fafc' : '#1e293b' }}
                      labelStyle={{
                        color: theme === 'dark' ? '#f8fafc' : '#1e293b',
                        fontWeight: 'bold',
                      }}
                    />
                    <Legend wrapperStyle={{ color: theme === 'dark' ? '#cbd5e1' : '#64748b' }} />
                    <Line
                      type="monotone"
                      dataKey="General Waste"
                      stroke="#ef4444"
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Paper"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Plastic"
                      stroke="#10b981"
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Compost"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Third Row - Activity Feed and Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Activity Feed Card */}
              <div
                className={`rounded-xl border p-6 shadow-lg ${
                  theme === 'dark'
                    ? 'backdrop-blur-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50'
                    : 'backdrop-blur-md bg-white border-slate-200/70'
                }`}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3
                    className={`text-xl font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    Activity Feed
                  </h3>
                  <div
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-700/70 hover:bg-slate-600/70'
                        : 'bg-slate-200/70 hover:bg-slate-300/70'
                    }`}
                  >
                    <Activity size={18} />
                  </div>
                </div>
                <div className="space-y-4">
                  {mockActivityFeed.map((activity) => (
                    <div
                      key={activity.id}
                      className={`flex items-start p-3 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'bg-slate-700/30 hover:bg-slate-700/50'
                          : 'bg-slate-100/70 hover:bg-slate-200/70'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-full mr-3 ${
                          activity.trend === 'up'
                            ? theme === 'dark'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-emerald-100 text-emerald-600'
                            : theme === 'dark'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {activity.trend === 'up' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                      </div>
                      <div>
                        <p
                          className={
                            theme === 'dark'
                              ? 'text-white font-medium'
                              : 'text-slate-800 font-medium'
                          }
                        >
                          {activity.event}
                        </p>
                        <div className="flex items-center mt-1">
                          <span
                            className={
                              theme === 'dark'
                                ? 'text-slate-300 font-semibold'
                                : 'text-slate-700 font-semibold'
                            }
                          >
                            {activity.value}
                          </span>
                          <span
                            className={
                              theme === 'dark' ? 'mx-2 text-slate-500' : 'mx-2 text-slate-400'
                            }
                          >
                            •
                          </span>
                          <span
                            className={
                              theme === 'dark' ? 'text-slate-400 text-sm' : 'text-slate-500 text-sm'
                            }
                          >
                            {activity.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Leaderboard Card */}
              <div
                className={`rounded-xl border p-6 shadow-lg ${
                  theme === 'dark'
                    ? 'backdrop-blur-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50'
                    : 'backdrop-blur-md bg-white border-slate-200/70'
                }`}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3
                    className={`text-xl font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {userRole === 'SuperAdmin' ? 'Company Leaderboard' : 'Office Leaderboard'}
                  </h3>
                  <div
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      theme === 'dark'
                        ? 'bg-slate-700/70 hover:bg-slate-600/70'
                        : 'bg-slate-200/70 hover:bg-slate-300/70'
                    }`}
                  >
                    <Award size={18} />
                  </div>
                </div>
                <div className="space-y-3">
                  {mockLeaderboardData.slice(0, 5).map((item, index) => (
                    <div
                      key={item.id}
                      className={`flex items-center p-3 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'bg-slate-700/30 hover:bg-slate-700/50'
                          : 'bg-slate-100/70 hover:bg-slate-200/70'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 font-bold ${
                          index === 0
                            ? theme === 'dark'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-amber-100 text-amber-600'
                            : index === 1
                            ? theme === 'dark'
                              ? 'bg-slate-400/20 text-slate-300'
                              : 'bg-slate-300/70 text-slate-600'
                            : index === 2
                            ? theme === 'dark'
                              ? 'bg-amber-700/20 text-amber-600'
                              : 'bg-amber-200/70 text-amber-700'
                            : theme === 'dark'
                            ? 'bg-slate-600/20 text-slate-400'
                            : 'bg-slate-200/70 text-slate-500'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p
                          className={
                            theme === 'dark'
                              ? 'text-white font-medium'
                              : 'text-slate-800 font-medium'
                          }
                        >
                          {item.name}
                        </p>
                        <div className="flex items-center mt-1 text-sm">
                          <span className="text-emerald-500">Diversion: {item.diversion}</span>
                          <span
                            className={
                              theme === 'dark' ? 'mx-2 text-slate-500' : 'mx-2 text-slate-400'
                            }
                          >
                            •
                          </span>
                          <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>
                            Waste: {item.waste}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`h-2 w-24 rounded-full overflow-hidden ${
                          theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
                        }`}
                      >
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                          style={{ width: item.diversion }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Leaderboard Tab Content */}
        {activeTab === 'leaderboard' && (
          <div
            className={`rounded-xl border p-6 shadow-lg ${
              theme === 'dark'
                ? 'backdrop-blur-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50'
                : 'backdrop-blur-md bg-white border-slate-200/70'
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3
                className={`text-xl font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                }`}
              >
                {userRole === 'SuperAdmin' ? 'Company Leaderboard' : 'Office Leaderboard'}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-700/70 hover:bg-slate-600/70'
                      : 'bg-slate-200/70 hover:bg-slate-300/70'
                  }`}
                >
                  <Filter size={18} />
                </button>
                <button
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-700/70 hover:bg-slate-600/70'
                      : 'bg-slate-200/70 hover:bg-slate-300/70'
                  }`}
                >
                  <Award size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className={
                      theme === 'dark'
                        ? 'border-b border-slate-700/50'
                        : 'border-b border-slate-200/70'
                    }
                  >
                    <th
                      className={`text-left py-3 px-4 font-medium ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Rank
                    </th>
                    <th
                      className={`text-left py-3 px-4 font-medium ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Name
                    </th>
                    <th
                      className={`text-left py-3 px-4 font-medium ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Diversion Rate
                    </th>
                    <th
                      className={`text-left py-3 px-4 font-medium ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Total Waste
                    </th>
                    <th
                      className={`text-left py-3 px-4 font-medium ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Performance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockLeaderboardData.map((item, index) => (
                    <tr
                      key={item.id}
                      className={
                        theme === 'dark'
                          ? 'border-b border-slate-700/30 hover:bg-slate-700/20'
                          : 'border-b border-slate-200/50 hover:bg-slate-100/50'
                      }
                    >
                      <td className="py-3 px-4">
                        <div
                          className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                            index === 0
                              ? theme === 'dark'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-amber-100 text-amber-600'
                              : index === 1
                              ? theme === 'dark'
                                ? 'bg-slate-400/20 text-slate-300'
                                : 'bg-slate-300/70 text-slate-600'
                              : index === 2
                              ? theme === 'dark'
                                ? 'bg-amber-700/20 text-amber-600'
                                : 'bg-amber-200/70 text-amber-700'
                              : theme === 'dark'
                              ? 'bg-slate-600/20 text-slate-400'
                              : 'bg-slate-200/70 text-slate-500'
                          }`}
                        >
                          {index + 1}
                        </div>
                      </td>
                      <td
                        className={`py-3 px-4 font-medium ${
                          theme === 'dark' ? 'text-white' : 'text-slate-800'
                        }`}
                      >
                        {item.name}
                      </td>
                      <td className="py-3 px-4 text-emerald-500 font-medium">{item.diversion}</td>
                      <td
                        className={`py-3 px-4 ${
                          theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        {item.waste}
                      </td>
                      <td className="py-3 px-4">
                        <div
                          className={`h-2 w-full max-w-[150px] rounded-full overflow-hidden ${
                            theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
                          }`}
                        >
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                            style={{ width: item.diversion }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Offices Tab Content */}
        {activeTab === 'offices' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockOfficesData.map((office) => (
              <div
                key={office.id}
                className={`rounded-xl border p-6 shadow-lg hover:shadow-indigo-500/10 transition-all group ${
                  theme === 'dark'
                    ? 'backdrop-blur-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50'
                    : 'backdrop-blur-md bg-white border-slate-200/70'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3
                    className={`text-lg font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    {office.name}
                  </h3>
                  <button
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'
                        : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                    }`}
                  >
                    <Tv size={18} />
                  </button>
                </div>

                <div
                  className={`flex items-center mb-4 ${
                    theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  <MapPin size={16} className="mr-2 flex-shrink-0" />
                  <span className="text-sm">{office.location}</span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className={`text-sm ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Diversion Rate
                    </span>
                    <span className="text-emerald-500 font-medium">{office.diversion}</span>
                  </div>
                  <div
                    className={`h-2 w-full rounded-full overflow-hidden ${
                      theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
                    }`}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                      style={{ width: office.diversion }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div
                    className={`text-sm mb-2 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Bin Configuration
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {office.bins.map((bin, index) => (
                      <span
                        key={index}
                        className={`text-xs px-2 py-1 rounded-full ${
                          bin === 'General Waste'
                            ? theme === 'dark'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-red-100 text-red-600'
                            : bin === 'Paper'
                            ? theme === 'dark'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-blue-100 text-blue-600'
                            : bin === 'Plastic'
                            ? theme === 'dark'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-green-100 text-green-600'
                            : bin === 'Compost'
                            ? theme === 'dark'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-amber-100 text-amber-600'
                            : theme === 'dark'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-purple-100 text-purple-600'
                        }`}
                      >
                        {bin}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
