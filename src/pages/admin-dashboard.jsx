'use client';

import { useState, useMemo } from 'react';
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
import { useTheme } from '@/components/ui/theme-provider';

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

// Main Dashboard Component
export default function AdminDashboard() {
  // Use theme from ThemeProvider
  const { theme } = useTheme();

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
              <LayoutGrid />
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
      </div>
    </div>
  );
}
