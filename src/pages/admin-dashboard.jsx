'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutGrid,
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
import axios from 'axios';
import { useTheme } from '@/components/ui/theme-provider';
import { createPortal } from 'react-dom';

// Main AdminDashboard component
export default function AdminDashboard() {
  const { theme } = useTheme();

  // Get user role from sessionStorage; default to 'SuperAdmin'
  const [userRole] = useState(sessionStorage.getItem('userRole') || 'SuperAdmin');

  // Active tab: dashboard, leaderboard, offices
  const [activeTab, setActiveTab] = useState('dashboard');

  // Filter states: selected company, selected org unit, date filter
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedOrgUnit, setSelectedOrgUnit] = useState(null);
  const [dateFilter, setDateFilter] = useState('month'); // 'week' or 'month'

  // Dropdown open state for date, company, and org unit
  const [isDropdownOpen, setIsDropdownOpen] = useState({
    date: false,
    company: false,
    orgUnit: false,
  });

  // API data states for dashboard cards and charts
  const [overviewData, setOverviewData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [officesData, setOfficesData] = useState([]);

  // States for companies and org units (dropdown data)
  const [companies, setCompanies] = useState([]);
  const [orgUnits, setOrgUnits] = useState([]);

  // Loading and error state for each API call
  const [loading, setLoading] = useState({
    overview: true,
    trend: true,
    activity: true,
    leaderboard: true,
    offices: true,
    companies: true,
    orgUnits: true,
  });
  const [error, setError] = useState({
    overview: null,
    trend: null,
    activity: null,
    leaderboard: null,
    offices: null,
    companies: null,
    orgUnits: null,
  });

  // Refs for dropdown button elements (for positioning dropdowns via portal)
  const dateButtonRef = useRef(null);
  const companyButtonRef = useRef(null);
  const orgUnitButtonRef = useRef(null);

  // Set up a portal container to render dropdowns with high z-index
  const [portalContainer, setPortalContainer] = useState(null);
  useEffect(() => {
    const portalDiv = document.createElement('div');
    portalDiv.style.position = 'absolute';
    portalDiv.style.top = '0';
    portalDiv.style.left = '0';
    portalDiv.style.width = '100%';
    portalDiv.style.zIndex = '9999';
    document.body.appendChild(portalDiv);
    setPortalContainer(portalDiv);
    return () => {
      document.body.removeChild(portalDiv);
    };
  }, []);

  // Utility function: Get dropdown position based on button ref
  const getDropdownPosition = (buttonRef) => {
    if (!buttonRef.current) return { top: 0, left: 0, width: 0 };
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
    };
  };

  // ---------------------------
  // API CALLS
  // ---------------------------

  // Fetch companies from backend (GET /api/v1/company/getCompany)
  const fetchCompanies = async () => {
    try {
      setLoading((prev) => ({ ...prev, companies: true }));
      const response = await axios.get('/api/v1/company/getCompany', { withCredentials: true });
      if (response.data.success) {
        console.log('Fetched companies:', response.data.data);
        setCompanies(response.data.data);
      } else {
        console.error('Error fetching companies:', response.data.message);
        setError((prev) => ({ ...prev, companies: response.data.message }));
      }
    } catch (err) {
      console.error('Error in fetchCompanies:', err);
      setError((prev) => ({ ...prev, companies: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, companies: false }));
    }
  };

  // Fetch OrgUnits based on companyId (GET /api/v1/orgUnits/byType?companyId=...)
  const fetchOrgUnits = async (companyId) => {
    try {
      setLoading((prev) => ({ ...prev, orgUnits: true }));
      const response = await axios.get(
        `/api/v1/orgUnits/byType?companyId=${companyId}&type=Branch`,
        {
          withCredentials: true,
        },
      );
      console.log('OrgUnits response:', response.data.data); // Log the data here
      if (response.data.success) {
        setOrgUnits(response.data.data);
      } else {
        setError((prev) => ({ ...prev, orgUnits: response.data.message }));
      }
    } catch (err) {
      setError((prev) => ({ ...prev, orgUnits: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, orgUnits: false }));
    }
  };

  // // Memoize filtered OrgUnits based on selected company
  // const filteredOrgUnits = useMemo(() => {
  //   if (!selectedCompany) return orgUnits;
  //   return orgUnits.filter(
  //     (unit) =>
  //       unit.branchAddress &&
  //       String(unit.branchAddress.associatedCompany) === String(selectedCompany._id),
  //   );
  // }, [selectedCompany, orgUnits]);

  // Fetch aggregated overview data (GET /api/v1/analytics/adminOverview)
  const fetchOverviewData = async () => {
    try {
      setLoading((prev) => ({ ...prev, overview: true }));
      let url = '/api/v1/analytics/adminOverview';
      if (selectedCompany) {
        url += `?companyId=${selectedCompany._id}`;
      }
      const response = await axios.get(url, { withCredentials: true });
      if (response.data.success) {
        setOverviewData(response.data.data);
      } else {
        console.error('Error fetching admin overview:', response.data.message);
        setError((prev) => ({ ...prev, overview: response.data.message }));
      }
    } catch (err) {
      console.error('Error in fetchOverviewData:', err);
      setError((prev) => ({ ...prev, overview: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, overview: false }));
    }
  };

  // Fetch waste trend chart data (GET /api/v1/analytics/wasteTrendChart)
  // Uses selectedOrgUnit.branchAddress as the branchId
  const fetchTrendData = async () => {
    const branchId = selectedOrgUnit && selectedOrgUnit.branchAddress;
    if (!branchId || branchId === 'defaultBranchId') {
      console.warn('No valid branchId available for fetchTrendData');
      return;
    }
    try {
      setLoading((prev) => ({ ...prev, trend: true }));
      const url = `/api/v1/analytics/wasteTrendChart?branchId=${branchId}&days=7`;
      const response = await axios.get(url, { withCredentials: true });
      if (response.data.success) {
        setTrendData(response.data.data);
      } else {
        console.error('Error fetching trend data:', response.data.message);
        setError((prev) => ({ ...prev, trend: response.data.message }));
      }
    } catch (err) {
      console.error('Error in fetchTrendData:', err);
      setError((prev) => ({ ...prev, trend: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, trend: false }));
    }
  };

  // Fetch activity feed data (GET /api/v1/analytics/activityFeed)
  const fetchActivityFeed = async () => {
    const branchId = selectedOrgUnit && selectedOrgUnit.branchAddress;
    if (!branchId || branchId === 'defaultBranchId') {
      console.warn('No valid branchId available for fetchActivityFeed');
      return;
    }
    try {
      setLoading((prev) => ({ ...prev, activity: true }));
      const url = `/api/v1/analytics/activityFeed?branchId=${branchId}`;
      const response = await axios.get(url, { withCredentials: true });
      if (response.data.success) {
        setActivityFeed(response.data.data);
      } else {
        console.error('Error fetching activity feed:', response.data.message);
        setError((prev) => ({ ...prev, activity: response.data.message }));
      }
    } catch (err) {
      console.error('Error in fetchActivityFeed:', err);
      setError((prev) => ({ ...prev, activity: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, activity: false }));
    }
  };

  // Fetch leaderboard data (GET /api/v1/analytics/adminLeaderboard)
  const fetchLeaderboardData = async () => {
    try {
      setLoading((prev) => ({ ...prev, leaderboard: true }));
      let url = '';
      if (userRole === 'SuperAdmin') {
        url = selectedCompany
          ? `/api/v1/analytics/adminLeaderboard?companyId=${selectedCompany._id}`
          : `/api/v1/analytics/adminLeaderboard?companyId=all`;
      } else {
        const branchId = selectedOrgUnit && selectedOrgUnit.branchAddress;
        if (!branchId || branchId === 'defaultBranchId') {
          console.warn('No valid branchId available for fetchLeaderboardData');
          return;
        }
        url = `/api/v1/analytics/adminLeaderboard?branchId=${branchId}`;
      }
      const response = await axios.get(url, { withCredentials: true });
      if (response.data.success) {
        setLeaderboardData(response.data.data);
      } else {
        console.error('Error fetching leaderboard data:', response.data.message);
        setError((prev) => ({ ...prev, leaderboard: response.data.message }));
      }
    } catch (err) {
      console.error('Error in fetchLeaderboardData:', err);
      setError((prev) => ({ ...prev, leaderboard: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, leaderboard: false }));
    }
  };

  // Fetch offices data (GET /api/v1/analytics/offices)
  const fetchOfficesData = async () => {
    try {
      setLoading((prev) => ({ ...prev, offices: true }));
      let url = '/api/v1/analytics/offices';
      if (selectedCompany) {
        url += `?companyId=${selectedCompany._id}`;
      }
      const response = await axios.get(url, { withCredentials: true });
      if (response.data.success) {
        setOfficesData(response.data.data);
      } else {
        console.error('Error fetching offices data:', response.data.message);
        setError((prev) => ({ ...prev, offices: response.data.message }));
      }
    } catch (err) {
      console.error('Error in fetchOfficesData:', err);
      setError((prev) => ({ ...prev, offices: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, offices: false }));
    }
  };

  // ---------------------------
  // useEffect Hooks
  // ---------------------------
  // On mount, if user is SuperAdmin, fetch companies
  useEffect(() => {
    if (userRole === 'SuperAdmin') {
      fetchCompanies();
    }
  }, [userRole]);

  // Fetch dashboard data when filters change
  useEffect(() => {
    fetchOverviewData();
    fetchTrendData();
    fetchActivityFeed();
    fetchLeaderboardData();
    fetchOfficesData();
  }, [selectedCompany, selectedOrgUnit, dateFilter]);

  // Close dropdowns when clicking outside their buttons
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dateButtonRef.current &&
        !dateButtonRef.current.contains(event.target) &&
        companyButtonRef.current &&
        !companyButtonRef.current.contains(event.target) &&
        orgUnitButtonRef.current &&
        !orgUnitButtonRef.current.contains(event.target)
      ) {
        setIsDropdownOpen({ date: false, company: false, orgUnit: false });
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---------------------------
  // Dropdown Handlers
  // ---------------------------
  const toggleDropdown = (dropdown) => {
    setIsDropdownOpen((prev) => ({ ...prev, [dropdown]: !prev[dropdown] }));
  };

  // When a company is selected, reset the OrgUnit and fetch its OrgUnits
  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setSelectedOrgUnit(null);
    setIsDropdownOpen((prev) => ({ ...prev, company: false }));
    if (company && company._id) {
      fetchOrgUnits(company._id);
    }
  };

  const handleOrgUnitSelect = (orgUnit) => {
    setSelectedOrgUnit(orgUnit);
    setIsDropdownOpen((prev) => ({ ...prev, orgUnit: false }));
  };

  const handleDateFilterChange = (filter) => {
    setDateFilter(filter);
    setIsDropdownOpen((prev) => ({ ...prev, date: false }));
  };
  return (
    <div
      className={`min-h-screen ${
        theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}
    >
      <div className="container mx-auto px-4 py-6">
        {/* Tabs and Filters */}
        <div
          className={`mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 rounded-xl border ${
            theme === 'dark'
              ? 'backdrop-blur-sm bg-slate-800/30 border-slate-700/50'
              : 'backdrop-blur-sm bg-white/50 border-slate-200/70'
          }`}
          style={{ position: 'relative', zIndex: 10 }}
        >
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white'
                  : theme === 'dark'
                  ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
                  : 'bg-slate-200/70 hover:bg-slate-300 text-slate-700'
              }`}
            >
              <LayoutGrid />
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'leaderboard'
                  ? 'bg-indigo-600 text-white'
                  : theme === 'dark'
                  ? 'bg-slate-700/50 hover:bg-slate-700 text-slate-300'
                  : 'bg-slate-200/70 hover:bg-slate-300 text-slate-700'
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
                  : 'bg-slate-200/70 hover:bg-slate-300 text-slate-700'
              }`}
            >
              Offices
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Date Filter */}
            <div className="relative">
              <button
                ref={dateButtonRef}
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

              {portalContainer &&
                isDropdownOpen.date &&
                createPortal(
                  <div
                    onMouseDown={(e) => e.stopPropagation()}
                    className={`w-40 rounded-lg shadow-lg ${
                      theme === 'dark'
                        ? 'bg-slate-800 border border-slate-700'
                        : 'bg-white border border-slate-200'
                    }`}
                    style={{
                      position: 'absolute',
                      top: `${getDropdownPosition(dateButtonRef).top}px`,
                      left: `${getDropdownPosition(dateButtonRef).left}px`,
                      width: `${getDropdownPosition(dateButtonRef).width}px`,
                    }}
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
                  </div>,
                  portalContainer,
                )}
            </div>

            {/* Company Dropdown (Only for SuperAdmin) */}
            {userRole === 'SuperAdmin' && (
              <div className="relative">
                <button
                  ref={companyButtonRef}
                  onClick={() => toggleDropdown('company')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                    theme === 'dark'
                      ? 'bg-slate-700/70 hover:bg-slate-600/70 text-white'
                      : 'bg-slate-200/70 hover:bg-slate-300/70 text-slate-800'
                  }`}
                >
                  <Building size={16} />
                  <span>{selectedCompany ? selectedCompany.CompanyName : 'All Organizations'}</span>
                  <ChevronDown size={16} />
                </button>

                {portalContainer &&
                  isDropdownOpen.company &&
                  createPortal(
                    <div
                      onMouseDown={(e) => e.stopPropagation()}
                      className={`w-64 rounded-lg shadow-lg max-h-60 overflow-y-auto ${
                        theme === 'dark'
                          ? 'bg-slate-800 border border-slate-700'
                          : 'bg-white border border-slate-200'
                      }`}
                      style={{
                        position: 'absolute',
                        top: `${getDropdownPosition(companyButtonRef).top}px`,
                        left: `${getDropdownPosition(companyButtonRef).left}px`,
                        width: `${getDropdownPosition(companyButtonRef).width}px`,
                      }}
                    >
                      <button
                        onClick={() => handleCompanySelect(null)}
                        className={`w-full text-left px-4 py-2 rounded-t-lg text-sm ${
                          theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                        }`}
                      >
                        All Organizations
                      </button>
                      {loading.companies ? (
                        <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                      ) : companies.length > 0 ? (
                        companies.map((company) => (
                          <button
                            key={company._id}
                            onClick={() => handleCompanySelect(company)}
                            className={`w-full text-left px-4 py-2 text-sm ${
                              theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                            }`}
                          >
                            {company.CompanyName}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-red-500">No companies found.</div>
                      )}
                    </div>,
                    portalContainer,
                  )}
              </div>
            )}

            {/* Org Unit Dropdown */}
            <div className="relative">
              <button
                ref={orgUnitButtonRef}
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

              {portalContainer &&
                isDropdownOpen.orgUnit &&
                (userRole !== 'SuperAdmin' || selectedCompany) &&
                createPortal(
                  <div
                    onMouseDown={(e) => e.stopPropagation()}
                    className={`w-64 rounded-lg shadow-lg max-h-60 overflow-y-auto ${
                      theme === 'dark'
                        ? 'bg-slate-800 border border-slate-700'
                        : 'bg-white border border-slate-200'
                    }`}
                    style={{
                      position: 'absolute',
                      top: `${getDropdownPosition(orgUnitButtonRef).top}px`,
                      left: `${getDropdownPosition(orgUnitButtonRef).left}px`,
                      width: `${getDropdownPosition(orgUnitButtonRef).width}px`,
                    }}
                  >
                    <button
                      onClick={() => handleOrgUnitSelect(null)}
                      className={`w-full text-left px-4 py-2 rounded-t-lg text-sm ${
                        theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                      }`}
                    >
                      All Organization Units
                    </button>
                    {loading.orgUnits ? (
                      <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                    ) : orgUnits.length > 0 ? (
                      orgUnits.map((orgUnit) => (
                        <button
                          key={orgUnit._id}
                          onClick={() => handleOrgUnitSelect(orgUnit)}
                          className={`w-full text-left px-4 py-2 text-sm ${
                            theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                          }`}
                        >
                          {orgUnit.name}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-red-500">No Org Units found.</div>
                    )}
                  </div>,
                  portalContainer,
                )}
            </div>
          </div>
        </div>

        {/* Dashboard Tab Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {activeTab === 'dashboard' && (
            <>
              {/* Analytics Cards - First Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Bins Card */}
                <div
                  className={`rounded-xl border p-6 shadow-lg transition-all group ${
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
                        {overviewData ? overviewData.totalBins : '...'}
                      </h3>
                    </div>
                    <div
                      className={`p-3 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'bg-indigo-500/20 text-indigo-400'
                          : 'bg-indigo-100 text-indigo-600'
                      }`}
                    >
                      <Trash2 size={24} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-emerald-500 flex items-center">
                      <ArrowUp size={14} className="mr-1" />
                      {/* You can integrate percentage change data if available */}
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
                  className={`rounded-xl border p-6 shadow-lg transition-all group ${
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
                        {overviewData ? Number(overviewData.landfillDiversion).toFixed(2) : '...'}
                      </h3>
                    </div>
                    <div
                      className={`p-3 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-emerald-100 text-emerald-600'
                      }`}
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
                  className={`rounded-xl border p-6 shadow-lg transition-all group ${
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
                        {overviewData ? Number(overviewData.totalWaste).toFixed(2) : '...'}
                      </h3>
                    </div>
                    <div
                      className={`p-3 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-amber-100 text-amber-600'
                      }`}
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
                  {loading.trend ? (
                    <div className="flex justify-center items-center h-full">
                      <p>Loading trend data...</p>
                    </div>
                  ) : error.trend ? (
                    <div className="flex justify-center items-center h-full">
                      <p className="text-red-500">{error.trend}</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={trendData}
                        margin={{ top: 20, right: 20, left: 5, bottom: 20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={theme === 'dark' ? '#f0f0f0' : '#f0f0f0'}
                        />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={10}
                          fontSize={12}
                          stroke={theme === 'dark' ? '#9CA3AF' : '#9CA3AF'}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          tickMargin={10}
                          fontSize={12}
                          stroke={theme === 'dark' ? '#9CA3AF' : '#9CA3AF'}
                          tickCount={5}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor:
                              theme === 'dark'
                                ? 'rgba(15, 23, 42, 0.9)'
                                : 'rgba(255, 255, 255, 0.9)',
                            borderColor:
                              theme === 'dark'
                                ? 'rgba(148, 163, 184, 0.2)'
                                : 'rgba(148, 163, 184, 0.3)',
                            borderRadius: '0.5rem',
                          }}
                          itemStyle={{ color: theme === 'dark' ? '#f8fafc' : '#1e293b' }}
                          labelStyle={{
                            color: theme === 'dark' ? '#f8fafc' : '#1e293b',
                            fontWeight: 'bold',
                          }}
                        />
                        <Legend />
                        {/* Dynamically render lines for each bin type */}
                        {trendData &&
                          trendData.length > 0 &&
                          Object.keys(trendData[0])
                            .filter((key) => key !== 'date')
                            .map((binKey, idx) => (
                              <Line
                                key={idx}
                                type="monotone"
                                dataKey={binKey}
                                stroke={idx % 2 === 0 ? '#ef4444' : '#3b82f6'} // Replace with dynamic color if needed
                                strokeWidth={2.5}
                                dot={{ r: 0 }}
                                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                              />
                            ))}
                      </LineChart>
                    </ResponsiveContainer>
                  )}
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
                    {loading.activity ? (
                      <p>Loading activity feed...</p>
                    ) : error.activity ? (
                      <p className="text-red-500">{error.activity}</p>
                    ) : activityFeed && activityFeed.length > 0 ? (
                      activityFeed.map((activity) => (
                        <div
                          key={activity.id || activity._id}
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
                            {activity.trend === 'up' ? (
                              <ArrowUp size={16} />
                            ) : (
                              <ArrowDown size={16} />
                            )}
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
                              <span className="text-emerald-500 font-semibold">
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
                                  theme === 'dark'
                                    ? 'text-slate-400 text-sm'
                                    : 'text-slate-500 text-sm'
                                }
                              >
                                {activity.date}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>No activity feed data available</p>
                    )}
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
                    <div className="p-2 rounded-lg cursor-pointer transition-colors bg-slate-200/70 hover:bg-slate-300/70">
                      <Award size={18} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {loading.leaderboard ? (
                      <p>Loading leaderboard...</p>
                    ) : error.leaderboard ? (
                      <p className="text-red-500">{error.leaderboard}</p>
                    ) : leaderboardData && leaderboardData.length > 0 ? (
                      leaderboardData.slice(0, 5).map((item, index) => (
                        <div
                          key={item.id || item._id}
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
                              <span
                                className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}
                              >
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
                      ))
                    ) : (
                      <p>No leaderboard data available</p>
                    )}
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
                  <button className="p-2 rounded-lg transition-colors bg-slate-200/70 hover:bg-slate-300/70">
                    <Filter size={18} />
                  </button>
                  <button className="p-2 rounded-lg transition-colors bg-slate-200/70 hover:bg-slate-300/70">
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
                    {loading.leaderboard ? (
                      <tr>
                        <td colSpan="5" className="py-3 px-4">
                          Loading leaderboard...
                        </td>
                      </tr>
                    ) : error.leaderboard ? (
                      <tr>
                        <td colSpan="5" className="py-3 px-4 text-red-500">
                          {error.leaderboard}
                        </td>
                      </tr>
                    ) : leaderboardData && leaderboardData.length > 0 ? (
                      leaderboardData.slice(0, 5).map((item, index) => (
                        <tr
                          key={item.id || item._id}
                          className={
                            theme === 'dark'
                              ? 'border-b border-slate-700/30 hover:bg-slate-700/20'
                              : 'border-b border-slate-200/50 hover:bg-slate-100/50'
                          }
                        >
                          <td className="py-3 px-4">
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
                          </td>
                          <td
                            className={`py-3 px-4 font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-slate-800'
                            }`}
                          >
                            {item.name}
                          </td>
                          <td className="py-3 px-4 text-emerald-500 font-medium">
                            {item.diversion}
                          </td>
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
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-3 px-4">
                          No leaderboard data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Offices Tab Content */}
          {activeTab === 'offices' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading.offices ? (
                <p>Loading offices...</p>
              ) : error.offices ? (
                <p className="text-red-500">{error.offices}</p>
              ) : officesData && officesData.length > 0 ? (
                officesData.map((office) => (
                  <div
                    key={office.id || office._id}
                    className={`rounded-xl border p-6 shadow-lg transition-all group ${
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
                    <div className="flex items-center mb-4 text-sm text-slate-500">
                      <MapPin size={16} className="mr-2" />
                      <span>{office.location}</span>
                    </div>
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-slate-500">Diversion Rate</span>
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
                      <div className="text-sm mb-2 text-slate-500">Bin Configuration</div>
                      <div className="flex flex-wrap gap-2">
                        {office.bins &&
                          office.bins.map((bin, index) => (
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
                ))
              ) : (
                <p>No offices found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
