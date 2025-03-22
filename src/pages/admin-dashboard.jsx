'use client';

import { useState, useEffect, useRef } from 'react';
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
  Building,
  MapPin,
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

export default function AdminDashboard() {
  const { theme } = useTheme();

  const [userRole] = useState(sessionStorage.getItem('userRole') || 'SuperAdmin');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedOrgUnit, setSelectedOrgUnit] = useState(null);
  const [dateFilter, setDateFilter] = useState('today');

  const [isDropdownOpen, setIsDropdownOpen] = useState({
    date: false,
    company: false,
    orgUnit: false,
  });
  const [overviewData, setOverviewData] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [officesData, setOfficesData] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [orgUnits, setOrgUnits] = useState([]);

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

  const dateButtonRef = useRef(null);
  const companyButtonRef = useRef(null);
  const orgUnitButtonRef = useRef(null);
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
    return () => document.body.removeChild(portalDiv);
  }, []);

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
  // API CALLS WITH DEBUG LOGGING
  // ---------------------------
  const fetchCompanies = async () => {
    try {
      console.log('Fetching companies...');
      setLoading((prev) => ({ ...prev, companies: true }));
      const response = await axios.get('/api/v1/company/getCompany', { withCredentials: true });
      console.log('Companies response:', response.data);
      if (response.data.success) {
        setCompanies(response.data.data);
      } else {
        console.error('Error fetching companies:', response.data.message);
        setError((prev) => ({ ...prev, companies: response.data.message }));
      }
    } catch (err) {
      console.error('Fetch companies error:', err);
      setError((prev) => ({ ...prev, companies: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, companies: false }));
    }
  };

  // Fetch grouped OrgUnits using new endpoint.
  const fetchOrgUnits = async (companyId) => {
    try {
      console.log('Fetching grouped OrgUnits for companyId:', companyId);
      setLoading((prev) => ({ ...prev, orgUnits: true }));
      const response = await axios.get(`/api/v1/orgUnits/grouped?companyId=${companyId}`, {
        withCredentials: true,
      });
      console.log('Grouped OrgUnits response:', response.data);
      if (response.data.success) {
        const flatUnits = response.data.data.reduce((acc, group) => acc.concat(group.units), []);
        console.log('Flattened OrgUnits:', flatUnits);
        setOrgUnits(flatUnits);
      } else {
        console.error('Error fetching OrgUnits:', response.data.message);
        setError((prev) => ({ ...prev, orgUnits: response.data.message }));
      }
    } catch (err) {
      console.error('Fetch OrgUnits error:', err);
      setError((prev) => ({ ...prev, orgUnits: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, orgUnits: false }));
    }
  };

  // Helper: recursively get descendant Branch OrgUnits.
  const getDescendantBranchUnits = (selectedUnit, allUnits) => {
    const children = allUnits.filter((unit) => String(unit.parent) === String(selectedUnit._id));
    let branchUnits = [];
    children.forEach((child) => {
      if (child.type === 'Branch') {
        branchUnits.push(child);
      } else {
        branchUnits = branchUnits.concat(getDescendantBranchUnits(child, allUnits));
      }
    });
    return branchUnits;
  };

  // Helper: get branch IDs from the selected OrgUnit.
  const getBranchIds = (selectedOrgUnit, allUnits) => {
    if (!selectedOrgUnit) return [];
    if (selectedOrgUnit.type === 'Branch') {
      if (typeof selectedOrgUnit.branchAddress === 'string') return [selectedOrgUnit.branchAddress];
      if (selectedOrgUnit.branchAddress && typeof selectedOrgUnit.branchAddress === 'object') {
        return [selectedOrgUnit.branchAddress._id || selectedOrgUnit.branchAddress.id].filter(
          Boolean,
        );
      }
      return [];
    }
    const branchUnits = getDescendantBranchUnits(selectedOrgUnit, allUnits);
    const ids = branchUnits
      .map((unit) => {
        if (typeof unit.branchAddress === 'string') return unit.branchAddress;
        if (unit.branchAddress && typeof unit.branchAddress === 'object')
          return unit.branchAddress._id || unit.branchAddress.id;
        return null;
      })
      .filter(Boolean);
    console.log('Extracted branch IDs from OrgUnit:', ids);
    return ids;
  };

  const fetchOverviewData = async () => {
    try {
      console.log('Fetching overview data...');
      setLoading((prev) => ({ ...prev, overview: true }));
      let url = '/api/v1/analytics/adminOverview';
      const params = [];
      if (selectedCompany) params.push(`companyId=${selectedCompany._id}`);
      if (selectedOrgUnit) params.push(`orgUnitId=${selectedOrgUnit._id}`);
      params.push(`filter=${dateFilter}`);
      if (params.length) url += '?' + params.join('&');
      console.log('Overview URL:', url);
      const response = await axios.get(url, { withCredentials: true });
      console.log('Overview response:', response.data);
      if (response.data.success) {
        setOverviewData(response.data.data);
      } else {
        console.error('Overview error:', response.data.message);
        setError((prev) => ({ ...prev, overview: response.data.message }));
      }
    } catch (err) {
      console.error('Fetch overview error:', err);
      setError((prev) => ({ ...prev, overview: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, overview: false }));
    }
  };

  const fetchTrendData = async () => {
    const branchIds = getBranchIds(selectedOrgUnit, orgUnits);
    let url = '';
    if (branchIds.length > 0) {
      url = `/api/v1/analytics/wasteTrendChart?branchId=${branchIds.join(
        ',',
      )}&days=7&filter=${dateFilter}`;
    } else if (selectedCompany) {
      url = `/api/v1/analytics/wasteTrendChart?companyId=${selectedCompany._id}&days=7&filter=${dateFilter}`;
    } else {
      console.warn('No valid branchIds or companyId available for fetchTrendData');
      return;
    }
    console.log('Fetching trend data from URL:', url);
    try {
      setLoading((prev) => ({ ...prev, trend: true }));
      const response = await axios.get(url, { withCredentials: true });
      console.log('Trend data response:', response.data);
      if (response.data.success) {
        setTrendData(response.data.data);
      } else {
        console.error('Trend data error:', response.data.message);
        setError((prev) => ({ ...prev, trend: response.data.message }));
      }
    } catch (err) {
      console.error('Fetch trend data error:', err);
      setError((prev) => ({ ...prev, trend: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, trend: false }));
    }
  };

  const fetchActivityFeed = async () => {
    const branchIds = getBranchIds(selectedOrgUnit, orgUnits);
    let url = '';
    if (branchIds.length > 0) {
      url = `/api/v1/analytics/activityFeed?branchId=${branchIds.join(',')}`;
    } else if (selectedCompany) {
      url = `/api/v1/analytics/activityFeed?companyId=${selectedCompany._id}`;
    } else {
      console.warn('No valid branchIds or companyId available for fetchActivityFeed');
      return;
    }
    console.log('Fetching activity feed from URL:', url);
    try {
      setLoading((prev) => ({ ...prev, activity: true }));
      const response = await axios.get(url, { withCredentials: true });
      console.log('Activity feed response:', response.data);
      if (response.data.success) {
        setActivityFeed(response.data.data);
      } else {
        console.error('Activity feed error:', response.data.message);
        setError((prev) => ({ ...prev, activity: response.data.message }));
      }
    } catch (err) {
      console.error('Fetch activity feed error:', err);
      setError((prev) => ({ ...prev, activity: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, activity: false }));
    }
  };

  const fetchLeaderboardData = async () => {
    let url = '';
    if (userRole === 'SuperAdmin') {
      url = selectedCompany
        ? `/api/v1/analytics/adminLeaderboard?companyId=${selectedCompany._id}`
        : `/api/v1/analytics/adminLeaderboard?companyId=all`;
    } else {
      const branchIds = getBranchIds(selectedOrgUnit, orgUnits);
      if (branchIds.length > 0) {
        url = `/api/v1/analytics/adminLeaderboard?branchId=${branchIds.join(',')}`;
      } else {
        console.warn('No valid branchIds available for fetchLeaderboardData');
        return;
      }
    }
    console.log('Fetching leaderboard data from URL:', url);
    try {
      setLoading((prev) => ({ ...prev, leaderboard: true }));
      const response = await axios.get(url, { withCredentials: true });
      console.log('Leaderboard response:', response.data);
      if (response.data.success) {
        setLeaderboardData(response.data.data);
      } else {
        console.error('Leaderboard error:', response.data.message);
        setError((prev) => ({ ...prev, leaderboard: response.data.message }));
      }
    } catch (err) {
      console.error('Fetch leaderboard error:', err);
      setError((prev) => ({ ...prev, leaderboard: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, leaderboard: false }));
    }
  };

  const fetchOfficesData = async () => {
    try {
      setLoading((prev) => ({ ...prev, offices: true }));
      let url = '/api/v1/analytics/offices';
      const params = [];
      if (selectedOrgUnit) {
        const orgUnitId = selectedOrgUnit._id || selectedOrgUnit.id;
        if (orgUnitId) {
          params.push(`orgUnitId=${orgUnitId}`);
        } else {
          console.warn('selectedOrgUnit does not have _id or id:', selectedOrgUnit);
        }
      } else if (selectedCompany) {
        params.push(`companyId=${selectedCompany._id}`);
      }
      if (params.length) {
        url += '?' + params.join('&');
      }
      const response = await axios.get(url, { withCredentials: true });
      if (response.data.success) {
        setOfficesData(response.data.data);
      } else {
        console.error('Offices error:', response.data.message);
        setError((prev) => ({ ...prev, offices: response.data.message }));
      }
    } catch (err) {
      console.error('Fetch offices error:', err);
      setError((prev) => ({ ...prev, offices: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, offices: false }));
    }
  };

  useEffect(() => {
    if (userRole === 'SuperAdmin') fetchCompanies();
  }, [userRole]);

  useEffect(() => {
    if (selectedCompany) fetchOrgUnits(selectedCompany._id);
  }, [selectedCompany]);

  useEffect(() => {
    fetchOverviewData();
    fetchTrendData();
    fetchActivityFeed();
    fetchLeaderboardData();
    fetchOfficesData();
  }, [selectedCompany, selectedOrgUnit, dateFilter]);

  const toggleDropdown = (dropdown) => {
    // Only allow toggling if activeTab is 'dashboard' for date and org unit filters
    if (dropdown === 'date' || dropdown === 'orgUnit') {
      if (activeTab !== 'dashboard') return;
    }
    setIsDropdownOpen((prev) => ({ ...prev, [dropdown]: !prev[dropdown] }));
  };

  const handleCompanySelect = (company) => {
    console.log('Company selected:', company);
    setSelectedCompany(company);
    setSelectedOrgUnit(null);
    setIsDropdownOpen((prev) => ({ ...prev, company: false }));
    if (company && company._id) fetchOrgUnits(company._id);
  };

  const handleOrgUnitSelect = (orgUnit) => {
    console.log('OrgUnit selected:', orgUnit);
    setSelectedOrgUnit(orgUnit);
    setIsDropdownOpen((prev) => ({ ...prev, orgUnit: false }));
  };

  const handleDateFilterChange = (filter) => {
    console.log('Date filter changed to:', filter);
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
            {/* Date Filter - Always visible but disabled if not on dashboard */}
            <div className="relative">
              <button
                ref={dateButtonRef}
                onClick={() => activeTab === 'dashboard' && toggleDropdown('date')}
                disabled={activeTab !== 'dashboard'}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                  theme === 'dark'
                    ? 'bg-slate-700/70 hover:bg-slate-600/70 text-white'
                    : 'bg-slate-200/70 hover:bg-slate-300/70 text-slate-800'
                } ${activeTab !== 'dashboard' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Calendar size={16} />
                <span>
                  {dateFilter === 'today'
                    ? 'Today'
                    : dateFilter === 'thisWeek'
                    ? 'This Week'
                    : dateFilter === 'thisMonth'
                    ? 'This Month'
                    : dateFilter === 'lastMonth'
                    ? 'Last Month'
                    : 'Filter'}
                </span>
                <ChevronDown size={16} />
              </button>
              {portalContainer &&
                isDropdownOpen.date &&
                activeTab === 'dashboard' &&
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
                      onClick={() => handleDateFilterChange('today')}
                      className={`w-full text-left px-4 py-2 rounded-t-lg text-sm ${
                        theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => handleDateFilterChange('thisWeek')}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      This Week
                    </button>
                    <button
                      onClick={() => handleDateFilterChange('thisMonth')}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      This Month
                    </button>
                    <button
                      onClick={() => handleDateFilterChange('lastMonth')}
                      className={`w-full text-left px-4 py-2 rounded-b-lg text-sm ${
                        theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                      }`}
                    >
                      Last Month
                    </button>
                  </div>,
                  portalContainer,
                )}
            </div>
            {/* Company Dropdown: Always active */}
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
            {/* OrgUnit Dropdown - Always visible but disabled if not on dashboard or if company not selected */}
            <div className="relative">
              <button
                ref={orgUnitButtonRef}
                onClick={() => activeTab === 'dashboard' && toggleDropdown('orgUnit')}
                disabled={
                  activeTab !== 'dashboard' || (userRole === 'SuperAdmin' && !selectedCompany)
                }
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                  userRole === 'SuperAdmin' && !selectedCompany
                    ? theme === 'dark'
                      ? 'bg-slate-700/40 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-200/40 text-slate-400 cursor-not-allowed'
                    : theme === 'dark'
                    ? 'bg-slate-700/70 hover:bg-slate-600/70 text-white'
                    : 'bg-slate-200/70 hover:bg-slate-300/70 text-slate-800'
                } ${activeTab !== 'dashboard' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Users size={16} />
                <span>{selectedOrgUnit ? selectedOrgUnit.name : 'All Organization Units'}</span>
                <ChevronDown size={16} />
              </button>
              {portalContainer &&
                isDropdownOpen.orgUnit &&
                activeTab === 'dashboard' &&
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
                          {orgUnit.name}{' '}
                          <span className="text-xs text-gray-500">({orgUnit.type})</span>
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
        {/* Dashboard Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          {activeTab === 'dashboard' && (
            <>
              {/* Analytics Cards */}
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
                        {overviewData
                          ? Number(overviewData.landfillDiversionPercentage).toFixed(2)
                          : '...'}
                        <span className="text-sm">%</span>
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
                    {overviewData?.landfillDiversionTrend != null ? (
                      overviewData.landfillDiversionTrend >= 0 ? (
                        <span className="text-emerald-500 flex items-center">
                          <ArrowUp size={14} className="mr-1" />{' '}
                          {overviewData.landfillDiversionTrend}%
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center">
                          <ArrowDown size={14} className="mr-1" />{' '}
                          {Math.abs(overviewData.landfillDiversionTrend)}%
                        </span>
                      )
                    ) : (
                      <span className="text-gray-500">--%</span>
                    )}
                    <span
                      className={`ml-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
                    >
                      {dateFilter === 'today'
                        ? 'compared to yesterday'
                        : dateFilter === 'thisWeek'
                        ? 'compared to last week'
                        : dateFilter === 'thisMonth'
                        ? 'compared to last month'
                        : dateFilter === 'lastMonth'
                        ? 'compared to this month'
                        : 'compared to previous period'}
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
                        <span className="text-sm ">kg</span>
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
                    {overviewData?.totalWasteTrend != null ? (
                      overviewData.totalWasteTrend >= 0 ? (
                        <span className="text-emerald-500 flex items-center">
                          <ArrowUp size={14} className="mr-1" /> {overviewData.totalWasteTrend}%
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center">
                          <ArrowDown size={14} className="mr-1" />{' '}
                          {Math.abs(overviewData.totalWasteTrend)}%
                        </span>
                      )
                    ) : (
                      <span className="text-gray-500">--%</span>
                    )}
                    <span
                      className={`ml-2 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}
                    >
                      {dateFilter === 'today'
                        ? 'compared to yesterday'
                        : dateFilter === 'thisWeek'
                        ? 'compared to last week'
                        : dateFilter === 'thisMonth'
                        ? 'compared to last month'
                        : dateFilter === 'lastMonth'
                        ? 'compared to this month'
                        : 'compared to previous period'}
                    </span>
                  </div>
                </div>
              </div>
              {/* Waste Trend Line Chart */}
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
                        {trendData &&
                          trendData.length > 0 &&
                          trendData.map((binData, idx) => (
                            <Line
                              key={idx}
                              type="monotone"
                              dataKey="weight"
                              data={binData.data}
                              name={binData.binName}
                              stroke={idx % 2 === 0 ? '#ef4444' : '#3b82f6'}
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
              {/* Activity Feed & Leaderboard */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Activity Feed */}
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
                          key={activity._id}
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
                {/* Leaderboard */}
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
                              key={item._id}
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
              </div>
            </>
          )}
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
                          key={item._id}
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
          {/* Offices Tab */}
          {activeTab === 'offices' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading.offices ? (
                <p>Loading offices...</p>
              ) : error.offices ? (
                <p className="text-red-500">{error.offices}</p>
              ) : officesData && officesData.length > 0 ? (
                officesData.map((office) => (
                  <div
                    key={office._id}
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
                        {office.officeName || office.name}
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
                        <span className="text-emerald-500 font-medium">
                          {office.diversion ? Number(office.diversion).toFixed(2) : '0.00'}%
                        </span>
                      </div>
                      <div
                        className={`h-2 w-full rounded-full overflow-hidden ${
                          theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
                        }`}
                      >
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                          style={{ width: office.diversion ? `${office.diversion}%` : '0%' }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm mb-2 text-slate-500">Bin Configuration</div>
                      <div className="flex flex-wrap gap-2">
                        {office.bins && office.bins.length > 0 ? (
                          office.bins.map((bin, idx) => (
                            <span
                              key={idx}
                              className={`text-xs px-2 py-1 rounded-full ${
                                bin.dustbinType === 'General Waste'
                                  ? theme === 'dark'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-red-100 text-red-600'
                                  : bin.dustbinType === 'Paper & Cardboard'
                                  ? theme === 'dark'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-blue-100 text-blue-600'
                                  : bin.dustbinType === 'Commingled'
                                  ? theme === 'dark'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-green-100 text-green-600'
                                  : bin.dustbinType === 'Organic'
                                  ? theme === 'dark'
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-amber-100 text-amber-600'
                                  : theme === 'dark'
                                  ? 'bg-purple-500/20 text-purple-400'
                                  : 'bg-purple-100 text-purple-600'
                              }`}
                            >
                              {bin.dustbinType}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-red-500">No bin data</span>
                        )}
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
