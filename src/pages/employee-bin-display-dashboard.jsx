import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser, setUser as updateUser } from '../app/userSlice';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';

import Header from '../components/ui/binDashboardHeader';
import BinGrid from '../components/ui/BinGrid';
import WasteChartPanel from '../components/ui/WasteChartPanel';
import DiversionCard from '../components/ui/DiversionCard';
import BranchContributionCard from '../components/ui/BranchContributionCard';
import TipsCarousel from '../components/ui/TipsCarousel';

import { useBinStatus } from '../hooks/useBinStatus';
import { useAnalytics } from '../hooks/useAnalytics';
import { transformDataForChart, getColorForBin } from '../utils/chartTransforms';

export default function EmployeeBinDisplayDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fromAdmin = location.state?.fromAdmin || false;
  const officeFromAdmin = location.state?.office || null;
  const storedUser = useSelector((s) => s.user.user);

  const [user, setUser] = useState(storedUser);
  const [overrideDone, setOverrideDone] = useState(!fromAdmin);

  // 1️⃣ Apply OrgUnit override when coming from SuperAdmin
  useEffect(() => {
    if (fromAdmin && officeFromAdmin && !overrideDone) {
      const normalizedOffice = { ...officeFromAdmin, branchAddress: officeFromAdmin };
      const updated = { ...user, OrgUnit: normalizedOffice };
      dispatch(updateUser(updated));
      setUser(updated);
      setOverrideDone(true);
    }
  }, [fromAdmin, officeFromAdmin, overrideDone, dispatch, user]);

  // 2️⃣ Derive branchId once override is applied
  const branchId = useMemo(
    () => user?.OrgUnit?.branchAddress?._id || user?.OrgUnit?._id || null,
    [user],
  );

  // 3️⃣ Data & real‑time hooks (won’t fire until branchId exists)
  const { bins, isLoading: binsLoading } = useBinStatus(branchId);
  const {
    overview,
    diversion,
    chartBins,
    trendComp,
    isLoading: analyticsLoading,
  } = useAnalytics(branchId);

  // 4️⃣ Recreate original chartData & colorConfig
  const chartData = useMemo(() => transformDataForChart(chartBins || []), [chartBins]);
  const colorConfig = useMemo(() => {
    const cfg = {};
    (chartBins || []).forEach((bin) => {
      cfg[bin.binName] = { color: getColorForBin(bin.binName) };
    });
    return cfg;
  }, [chartBins]);

  // 5️⃣ Handlers
  const handleRefresh = () => window.location.reload();
  const handleLogout = async () => {
    try {
      const res = await axios.post('/api/v1/users/logout', {}, { withCredentials: true });
      if (res.data.success) {
        dispatch(clearUser());
        navigate('/login', { replace: true });
      }
    } catch {
      // silent
    }
  };

  const lastUpdate = format(new Date(), 'h:mm a');

  // 6️⃣ Show loader until overrideDone
  if (!overrideDone) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  // 7️⃣ Final render
  return (
    <>
      <Header
        companyLogo={user.company?.logo}
        companyName={user.company?.CompanyName}
        branchAddress={user?.OrgUnit?.branchAddress || user?.OrgUnit || {}}
        lastUpdate={lastUpdate}
        onRefresh={handleRefresh}
        onLogout={handleLogout}
        showBack={fromAdmin}
        onBack={() => navigate(-1)}
      />

      <main className="flex-1 container mx-auto p-4 flex flex-col space-y-6 justify-center">
        {/* Bin Status Cards */}
        <BinGrid bins={bins} loading={binsLoading} />

        {/* Dynamic-Height Chart */}
        <div className="h-[300px] md:h-[calc(38vh)]">
          <WasteChartPanel
            bins={chartBins}
            chartData={chartData}
            colorConfig={colorConfig}
            trendComparison={trendComp}
            isLoading={analyticsLoading}
          />
        </div>

        {/* Diversion, Contribution & Tips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DiversionCard data={diversion} loading={analyticsLoading} />
          <BranchContributionCard
            percentage={overview?.branchContribution}
            branchName={user?.OrgUnit?.branchAddress?.officeName || user?.OrgUnit?.officeName}
          />
          <TipsCarousel />
        </div>
      </main>
    </>
  );
}
