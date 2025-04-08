'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import {
  LayoutGrid,
  ChevronDown,
  Calendar,
  TrendingUp,
  Trash2,
  Award,
  Recycle,
  Activity,
  Building,
  MapPin,
  Tv,
  ArrowUpRight,
  ArrowDownRight,
  GitBranchIcon,
  Info,
  Filter,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/components/ui/theme-provider';
import { createPortal } from 'react-dom';
import AdminWasteLineChart from '@/components/ui/WasteLineChartAdmin';
import WasteDispositionChart from '@/components/ui/WasteDispositionChart';

export default function AdminDashboard() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  // Get user role from session storage.
  const [userRole] = useState(sessionStorage.getItem('userRole') || 'SuperAdmin');
  // Tabs state.
  const [activeTab, setActiveTab] = useState('dashboard');
  // Filter sections state.
  const [isDropdownOpen, setIsDropdownOpen] = useState({
    date: false,
    company: false,
    orgUnit: false,
  });
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedOrgUnit, setSelectedOrgUnit] = useState(null);
  const [dateFilter, setDateFilter] = useState('today');

  // Data counts and overview.
  const [officesCount, setOfficesCount] = useState(0);
  const [overviewData, setOverviewData] = useState(null);

  const [activityFeed, setActivityFeed] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('');
  const [officesData, setOfficesData] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [orgUnits, setOrgUnits] = useState([]);

  // Trend data for the line chart.
  const [trendData, setTrendData] = useState([]);
  const [loadingTrend, setLoadingTrend] = useState(true);
  const [trendError, setTrendError] = useState('');

  // New state for waste disposition data.
  const [wasteDispositionData, setWasteDispositionData] = useState([]);
  const [loadingWasteDisposition, setLoadingWasteDisposition] = useState(true);
  const [wasteDispositionError, setWasteDispositionError] = useState('');

  // Loading and error states.
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

  // Dropdown references.
  const dateButtonRef = useRef(null);
  const companyButtonRef = useRef(null);
  const orgUnitButtonRef = useRef(null);
  const [portalContainer, setPortalContainer] = useState(null);

  // Sort offices by name (case-insensitive)
  const sortedOfficesData = useMemo(() => {
    return officesData.slice().sort((a, b) => {
      const nameA = (a.officeName || a.name || '').toLowerCase();
      const nameB = (b.officeName || b.name || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [officesData]);

  // Create a portal container for dropdowns.
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

  // ---------------------------
  // Helper Functions
  // ---------------------------
  const fetchOfficesCount = async () => {
    try {
      let url = '/api/v1/analytics/offices';
      const params = [];
      if (selectedOrgUnit) {
        const orgUnitId = selectedOrgUnit._id || selectedOrgUnit.id;
        if (orgUnitId) {
          params.push(`orgUnitId=${orgUnitId}`);
        }
      } else if (selectedCompany) {
        params.push(`companyId=${selectedCompany._id}`);
      }
      if (params.length) {
        url += '?' + params.join('&');
      }
      const response = await axios.get(url, { withCredentials: true });
      if (response.data.success && Array.isArray(response.data.data)) {
        setOfficesCount(response.data.data.length);
      } else {
        console.error('Error fetching offices count:', response.data.message);
      }
    } catch (err) {
      console.error('Fetch offices count error:', err);
    }
  };

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
  // API Request Functions
  // ---------------------------
  const fetchCompanies = async () => {
    try {
      setLoading((prev) => ({ ...prev, companies: true }));
      const response = await axios.get('/api/v1/company/getCompany', { withCredentials: true });
      if (response.data.success) {
        setCompanies(response.data.data);
      } else {
        setError((prev) => ({ ...prev, companies: response.data.message }));
      }
    } catch (err) {
      setError((prev) => ({ ...prev, companies: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, companies: false }));
    }
  };

  const fetchOrgUnits = async (companyId) => {
    try {
      setLoading((prev) => ({ ...prev, orgUnits: true }));
      const response = await axios.get(`/api/v1/orgUnits/grouped?companyId=${companyId}`, {
        withCredentials: true,
      });
      if (response.data.success) {
        const flatUnits = response.data.data.reduce((acc, group) => acc.concat(group.units), []);
        setOrgUnits(flatUnits);
      } else {
        setError((prev) => ({ ...prev, orgUnits: response.data.message }));
      }
    } catch (err) {
      setError((prev) => ({ ...prev, orgUnits: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, orgUnits: false }));
    }
  };

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
    return ids;
  };

  const fetchOverviewData = async () => {
    try {
      setLoading((prev) => ({ ...prev, overview: true }));
      let url = '/api/v1/analytics/adminOverview';
      const params = [];
      if (selectedCompany) params.push(`companyId=${selectedCompany._id}`);
      if (selectedOrgUnit) params.push(`orgUnitId=${selectedOrgUnit._id}`);
      params.push(`filter=${dateFilter}`);
      if (params.length) url += '?' + params.join('&');
      const response = await axios.get(url, { withCredentials: true });
      if (response.data.success) {
        setOverviewData(response.data.data);
      } else {
        setError((prev) => ({ ...prev, overview: response.data.message }));
      }
    } catch (err) {
      setError((prev) => ({ ...prev, overview: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, overview: false }));
    }
  };

  const fetchTrendData = async () => {
    try {
      setLoadingTrend(true);
      let url = '/api/v1/analytics/wasteTrendChart'; // New endpoint
      const params = { filter: dateFilter };
      if (selectedOrgUnit) params.orgUnitId = selectedOrgUnit._id;
      else if (selectedCompany) params.companyId = selectedCompany._id;
      const response = await axios.get(url, { params, withCredentials: true });
      if (response.data.success) {
        // Now expecting an array of { time, data: { <binType>: <weight>, ... } }
        setTrendData(response.data.data);
        setTrendError('');
      } else {
        setTrendError(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching trend data:', error);
      setTrendError('Error fetching trend data');
    } finally {
      setLoadingTrend(false);
    }
  };

  const fetchWasteDispositionData = async () => {
    try {
      setLoadingWasteDisposition(true);
      let url = '/api/v1/analytics/wasteDisposition';
      const params = { filter: dateFilter };
      if (selectedOrgUnit) {
        params.orgUnitId = selectedOrgUnit._id;
      } else if (selectedCompany) {
        params.companyId = selectedCompany._id;
      }
      const response = await axios.get(url, { params, withCredentials: true });
      if (response.data.success) {
        setWasteDispositionData(response.data.data);
        setWasteDispositionError('');
      } else {
        setWasteDispositionError(response.data.message);
      }
    } catch (error) {
      console.error('Error fetching waste disposition data:', error);
      setWasteDispositionError('Error fetching waste disposition data');
    } finally {
      setLoadingWasteDisposition(false);
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
      console.warn('No valid branchIds or companyId available for activity feed');
      return;
    }
    try {
      setLoading((prev) => ({ ...prev, activity: true }));
      const response = await axios.get(url, { withCredentials: true });
      if (response.data.success) {
        setActivityFeed(response.data.data);
      } else {
        setError((prev) => ({ ...prev, activity: response.data.message }));
      }
    } catch (err) {
      setError((prev) => ({ ...prev, activity: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, activity: false }));
    }
  };

  const fetchLeaderboardData = async () => {
    let url = '/api/v1/analytics/leaderboard';
    if (userRole === 'SuperAdmin' && selectedCompany) {
      url += `?companyId=${selectedCompany._id}`;
    }
    try {
      setLoading((prev) => ({ ...prev, leaderboard: true }));
      const response = await axios.get(url, { withCredentials: true });
      if (response.data.success) {
        setLeaderboardData(response.data.data.leaderboard);
        setLeaderboardPeriod(response.data.data.period);
      } else {
        setError((prev) => ({ ...prev, leaderboard: response.data.message }));
      }
    } catch (err) {
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
        }
      } else if (selectedCompany) {
        params.push(`companyId=${selectedCompany._id}`);
      }
      if (params.length) url += '?' + params.join('&');
      const response = await axios.get(url, { withCredentials: true });
      if (response.data.success) {
        setOfficesData(response.data.data);
      } else {
        setError((prev) => ({ ...prev, offices: response.data.message }));
      }
    } catch (err) {
      setError((prev) => ({ ...prev, offices: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, offices: false }));
    }
  };

  // ---------------------------
  // Combined useEffect for fetching data on filter changes
  // ---------------------------
  useEffect(() => {
    if (userRole === 'SuperAdmin') {
      fetchCompanies();
    }
  }, [userRole]);

  useEffect(() => {
    if (selectedCompany) {
      fetchOrgUnits(selectedCompany._id);
    }
  }, [selectedCompany]);

  useEffect(() => {
    fetchOfficesCount();
  }, [selectedCompany, selectedOrgUnit]);

  useEffect(() => {
    console.log('Dashboard filters changed:', { selectedCompany, selectedOrgUnit, dateFilter });
    fetchOverviewData();
    fetchTrendData();
    fetchActivityFeed();
    fetchLeaderboardData();
    fetchOfficesData();
    fetchWasteDispositionData();
  }, [selectedCompany, selectedOrgUnit, dateFilter]);

  // ---------------------------
  // Dropdown toggle and selection handlers
  // ---------------------------
  const toggleDropdown = (dropdown) => {
    if ((dropdown === 'date' || dropdown === 'orgUnit') && activeTab !== 'dashboard') return;
    setIsDropdownOpen((prev) => ({ ...prev, [dropdown]: !prev[dropdown] }));
  };

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
  const clearFilters = () => {
    setSelectedCompany(null);
    setSelectedOrgUnit(null);
    setDateFilter('today'); // Reset date filter to default value
  };

  // ---------------------------
  // Render UI
  // ---------------------------
  return (
    <div
      className={`${
        theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'
      } min-h-screen`}
    >
      <div className="container mx-auto px-4 py-6">
        {/* Tabs and Filters */}
        <div className="mb-4" style={{ position: 'relative', zIndex: 10 }}>
          {/* Tabs */}
          <div
            className={`flex items-center mb-3 ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            <div className="flex items-center border-b w-full pb-1 gap-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? theme === 'dark'
                      ? 'text-white'
                      : 'text-slate-900'
                    : theme === 'dark'
                    ? 'text-slate-400 hover:text-slate-300'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <LayoutGrid size={16} />
                  <span>Dashboard</span>
                </div>
                {activeTab === 'dashboard' && (
                  <div
                    className={`absolute bottom-0 left-0 w-full h-0.5 ${
                      theme === 'dark' ? 'bg-indigo-500' : 'bg-indigo-600'
                    } -mb-1.5 rounded-full`}
                  ></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'leaderboard'
                    ? theme === 'dark'
                      ? 'text-white'
                      : 'text-slate-900'
                    : theme === 'dark'
                    ? 'text-slate-400 hover:text-slate-300'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Award size={16} />
                  <span>Leaderboard</span>
                </div>
                {activeTab === 'leaderboard' && (
                  <div
                    className={`absolute bottom-0 left-0 w-full h-0.5 ${
                      theme === 'dark' ? 'bg-indigo-500' : 'bg-indigo-600'
                    } -mb-1.5 rounded-full`}
                  ></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab('offices')}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'offices'
                    ? theme === 'dark'
                      ? 'text-white'
                      : 'text-slate-900'
                    : theme === 'dark'
                    ? 'text-slate-400 hover:text-slate-300'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Building size={16} />
                  <span>Offices</span>
                </div>
                {activeTab === 'offices' && (
                  <div
                    className={`absolute bottom-0 left-0 w-full h-0.5 ${
                      theme === 'dark' ? 'bg-indigo-500' : 'bg-indigo-600'
                    } -mb-1.5 rounded-full`}
                  ></div>
                )}
              </button>
            </div>
          </div>

          {/* Filters */}

          <div
            className={`flex flex-wrap items-center justify-end gap-2 py-2 ${
              theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            <div className="flex items-center mr-auto">
              <span className="text-xs font-medium mr-2">
                {selectedCompany ? selectedCompany.CompanyName : 'All Organizations'}
                {selectedOrgUnit && ` › ${selectedOrgUnit.name}`}
              </span>
            </div>

            {/* Clear Filters button - only visible when filters are applied */}
            {(selectedCompany !== null || selectedOrgUnit !== null) && (
              <button
                onClick={clearFilters}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-red-400'
                    : 'bg-white hover:bg-slate-50 border border-slate-200 shadow-sm text-red-500'
                }`}
              >
                <Trash2 size={14} />
                <span>Clear Filters</span>
              </button>
            )}

            {/* Date Filter - only visible in dashboard tab */}
            {activeTab === 'dashboard' && (
              <div className="relative">
                <button
                  ref={dateButtonRef}
                  onClick={() => toggleDropdown('date')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                      : 'bg-white hover:bg-slate-50 border border-slate-200 shadow-sm'
                  }`}
                >
                  <Calendar size={14} />
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
                  <ChevronDown size={14} />
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
            )}

            {/* Company Dropdown */}
            {userRole === 'SuperAdmin' && (
              <div className="relative">
                <button
                  ref={companyButtonRef}
                  onClick={() => toggleDropdown('company')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                      : 'bg-white hover:bg-slate-50 border border-slate-200 shadow-sm'
                  }`}
                >
                  <Building size={14} />
                  <span className="max-w-[120px] truncate">
                    {selectedCompany ? selectedCompany.CompanyName : 'All Organizations'}
                  </span>
                  <ChevronDown size={14} />
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

            {/* OrgUnit Dropdown */}
            <div className="relative">
              <button
                ref={orgUnitButtonRef}
                onClick={() => toggleDropdown('orgUnit')}
                disabled={userRole === 'SuperAdmin' && !selectedCompany}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  userRole === 'SuperAdmin' && !selectedCompany
                    ? theme === 'dark'
                      ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-700/50'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50'
                    : theme === 'dark'
                    ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                    : 'bg-white hover:bg-slate-50 border border-slate-200 shadow-sm'
                }`}
              >
                <GitBranchIcon size={14} />
                <span className="max-w-[120px] truncate">
                  {selectedOrgUnit ? selectedOrgUnit.name : 'All Organization Units'}
                </span>
                <ChevronDown size={14} />
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Total Bins Card */}
                <div
                  className={`rounded-md border p-6 shadow-sm transition-all group ${
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
                        {overviewData && overviewData.totalBins !== undefined
                          ? overviewData.totalBins
                          : 'No data found'}
                      </h3>
                      <p
                        className={`text-sm text-gray-500 mt-5 ${
                          theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        Configured across
                        <span className="font-bold">
                          {overviewData && overviewData.totalBins !== undefined
                            ? ` ${officesCount}`
                            : ''}
                        </span>{' '}
                        offices
                      </p>
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
                  className={`rounded-md border p-6 shadow-sm transition-all group ${
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
                        Waste Diverted
                      </p>
                      <h3
                        className={`text-3xl font-bold ${
                          theme === 'dark' ? 'text-white' : 'text-slate-800'
                        }`}
                      >
                        {overviewData && overviewData.landfillDiversionPercentage !== undefined
                          ? Number(overviewData.landfillDiversionPercentage).toFixed(2)
                          : 'No data found'}
                        <span className="text-sm">%</span>
                      </h3>
                    </div>
                    <div
                      className={`p-3 rounded-lg transition-colors ${
                        theme === 'dark'
                          ? 'bg-lime-500/20 text-lime-400'
                          : 'bg-lime-100 text-lime-600'
                      }`}
                    >
                      <Recycle size={24} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    {overviewData && overviewData.landfillDiversionTrend != null ? (
                      overviewData.landfillDiversionTrend >= 0 ? (
                        <span className="text-emerald-500 flex items-center font-bold">
                          <ArrowUpRight strokeWidth={2.75} size={14} className="mr-1" />{' '}
                          {overviewData.landfillDiversionTrend}%
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center font-bold">
                          <ArrowDownRight strokeWidth={2.75} size={14} className="mr-1" />{' '}
                          {Math.abs(overviewData.landfillDiversionTrend)}%
                        </span>
                      )
                    ) : (
                      <span className="text-gray-500">No data found</span>
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
                  className={`rounded-md border p-6 shadow-sm transition-all group ${
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
                        {overviewData && overviewData.totalWaste !== undefined
                          ? Number(overviewData.totalWaste).toFixed(2)
                          : 'No data found'}
                        <span className="text-sm">kg</span>
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
                    {overviewData && overviewData.totalWasteTrend != null ? (
                      overviewData.totalWasteTrend >= 0 ? (
                        <span className="text-emerald-500 flex items-center font-bold">
                          <ArrowUpRight strokeWidth={2.75} size={14} className="mr-1" />{' '}
                          {overviewData.totalWasteTrend}%
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center font-bold">
                          <ArrowDownRight strokeWidth={2.75} size={14} className="mr-1" />{' '}
                          {Math.abs(overviewData.totalWasteTrend)}%
                        </span>
                      )
                    ) : (
                      <span className="text-gray-500">No data found</span>
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
                className={`rounded-md border p-6 shadow-sm mb-4 ${
                  theme === 'dark'
                    ? 'backdrop-blur-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50'
                    : 'backdrop-blur-md bg-white border-slate-200/70'
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3
                    className={`text-xl font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    Waste Collection Trends
                  </h3>
                </div>
                <AdminWasteLineChart
                  trendData={trendData}
                  loading={loading.trend}
                  error={trendError}
                  dateFilter={dateFilter}
                />
              </div>

              {/* Waste Disposition Chart */}
              <div
                className={`rounded-md border p-6 shadow-sm mb-4 ${
                  theme === 'dark'
                    ? 'backdrop-blur-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50'
                    : 'backdrop-blur-md bg-white border-slate-200/70'
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3
                    className={`text-xl font-semibold ${
                      theme === 'dark' ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    Waste Disposition
                  </h3>
                </div>
                <div className="h-80 w-full flex items-center justify-center">
                  <WasteDispositionChart
                    data={wasteDispositionData}
                    loading={loadingWasteDisposition}
                    error={wasteDispositionError}
                    dateFilter={dateFilter}
                  />
                </div>
              </div>

              {/* Combined Activity Feed & Top 3 Leaderboard */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                {/* Activity Feed Column */}
                <div
                  className={`rounded-md border p-6 shadow-sm ${
                    theme === 'dark'
                      ? 'backdrop-blur-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50'
                      : 'backdrop-blur-md bg-white border-slate-200/70'
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
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
                    {error.activity ? (
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
                              <ArrowUpRight size={16} />
                            ) : (
                              <ArrowDownRight size={16} />
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

                {/* Top 3 Leaderboard Column */}
                <div
                  className={`rounded-md border p-6 shadow-sm ${
                    theme === 'dark'
                      ? 'backdrop-blur-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50'
                      : 'backdrop-blur-md bg-white border-slate-200/70'
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3
                      className={`text-xl font-semibold ${
                        theme === 'dark' ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {userRole === 'SuperAdmin' ? 'Leaderboard' : 'Office Leaderboard'}
                    </h3>
                  </div>
                  <div
                    className={`p-2 rounded-lg mb-4 ${
                      theme === 'dark'
                        ? 'bg-slate-700/70 hover:bg-slate-600/70'
                        : 'bg-slate-200/70 hover:bg-slate-300/70'
                    }`}
                  >
                    <p
                      className={`text-xs text-gray-500 font-regular flex items-center ${
                        theme === 'dark' ? 'text-slate-200' : 'text-slate-600'
                      }`}
                    >
                      <Info className="mr-3" />
                      <i>
                        This leaderboard highlights the Top performing companies in waste diversion
                        for {leaderboardPeriod ? `${leaderboardPeriod}` : ''}, recognizing their
                        commitment to sustainable waste management.
                      </i>
                    </p>
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
                          leaderboardData.slice(0, 3).map((item, index) => (
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
                                {item.diversionPercentage
                                  ? Number(item.diversionPercentage).toFixed(2)
                                  : '0.00'}
                                %
                              </td>
                              <td
                                className={`py-3 px-4 ${
                                  theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                                }`}
                              >
                                {item.totalWaste ? (
                                  Number(item.totalWaste) > 1000 ? (
                                    <>
                                      <span className="text-sm font-bold">
                                        {(Number(item.totalWaste) / 1000).toFixed(2)}
                                      </span>
                                      <span className="text-slate-400 text-sm font-regular">
                                        {' '}
                                        tonnes
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <span className="text-sm font-bold">
                                        {Number(item.totalWaste).toFixed(1)}
                                      </span>
                                      <span className="text-slate-400 text-sm font-regular">
                                        {' '}
                                        kg
                                      </span>
                                    </>
                                  )
                                ) : (
                                  <>
                                    <span className="text-sm font-bold">0</span>
                                    <span className="text-slate-400 text-sm font-regular"> kg</span>
                                  </>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div
                                  className={`h-2 w-full max-w-[150px] rounded-full overflow-hidden ${
                                    theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
                                  }`}
                                >
                                  <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                                    style={{
                                      width: item.diversionPercentage
                                        ? `${item.diversionPercentage}%`
                                        : '0%',
                                    }}
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

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div
              className={`rounded-md border p-6 shadow-sm ${
                theme === 'dark'
                  ? 'backdrop-blur-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50'
                  : 'backdrop-blur-md bg-white border-slate-200/70'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h3
                  className={`text-xl font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}
                >
                  {userRole === 'SuperAdmin' ? 'Leaderboard' : 'Office Leaderboard'}
                </h3>
              </div>
              <div
                className={`p-2 rounded-lg mb-4 ${
                  theme === 'dark'
                    ? 'bg-slate-700/70 hover:bg-slate-600/70'
                    : 'bg-slate-200/70 hover:bg-slate-300/70'
                }`}
              >
                <p
                  className={`ml-4 text-xs text-gray-500 font-medium flex items-center ${
                    theme === 'dark' ? 'text-slate-200' : 'text-slate-600'
                  }`}
                >
                  <Info className="mr-3" />
                  <i>
                    This leaderboard highlights the Top performing companies in waste diversion for{' '}
                    {leaderboardPeriod ? `${leaderboardPeriod}` : ''}, recognizing their commitment
                    to sustainable waste management.
                  </i>
                </p>
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
                      leaderboardData.map((item, index) => (
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
                            {item.diversionPercentage
                              ? Number(item.diversionPercentage).toFixed(2)
                              : '0.00'}
                            %
                          </td>
                          <td
                            className={`py-3 px-4 ${
                              theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                            }`}
                          >
                            {item.totalWaste ? (
                              Number(item.totalWaste) > 1000 ? (
                                <>
                                  <span className="text-sm font-bold">
                                    {(Number(item.totalWaste) / 1000).toFixed(2)}
                                  </span>
                                  <span className="text-slate-400 text-sm font-regular">
                                    {' '}
                                    tonnes
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="text-sm font-bold">
                                    {Number(item.totalWaste).toFixed(1)}
                                  </span>
                                  <span className="text-slate-400 text-sm font-regular"> kg</span>
                                </>
                              )
                            ) : (
                              <>
                                <span className="text-sm font-bold">0</span>
                                <span className="text-slate-400 text-sm font-regular"> kg</span>
                              </>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div
                              className={`h-2 w-full max-w-[150px] rounded-full overflow-hidden ${
                                theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
                              }`}
                            >
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                                style={{
                                  width: item.diversionPercentage
                                    ? `${item.diversionPercentage}%`
                                    : '0%',
                                }}
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
              ) : sortedOfficesData && sortedOfficesData.length > 0 ? (
                sortedOfficesData.map((office) => {
                  const binOrder = [
                    'General Waste',
                    'Organic',
                    'Glass',
                    'Paper & Cardboard',
                    'Commingled',
                  ];
                  const sortedBins =
                    office.bins && office.bins.length > 0
                      ? office.bins.slice().sort((a, b) => {
                          const orderA = binOrder.indexOf(a.dustbinType);
                          const orderB = binOrder.indexOf(b.dustbinType);
                          return (orderA === -1 ? 999 : orderA) - (orderB === -1 ? 999 : orderB);
                        })
                      : [];
                  return (
                    <div
                      key={office._id}
                      className={`rounded-md border p-6 shadow-sm transition-all group ${
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
                          onClick={() => {
                            const companyToPass = selectedCompany
                              ? selectedCompany
                              : office.associatedCompany;

                            navigate('/dashboard', {
                              state: { fromAdmin: true, office, company: companyToPass },
                            });
                          }}
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
                            {office.diversion
                              ? Number(office.diversion).toFixed(2)
                              : 'No data found'}
                            %
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
                        <div className="flex flex-wrap gap-1">
                          {sortedBins.length > 0 ? (
                            sortedBins.map((bin, idx) => (
                              <span
                                key={idx}
                                className={`text-[11px] px-2 py-1 rounded-full ${
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
                                    : bin.dustbinType === 'Glass'
                                    ? theme === 'dark'
                                      ? 'bg-purple-500/20 text-purple-400'
                                      : 'bg-purple-100 text-purple-600'
                                    : ''
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
                  );
                })
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
