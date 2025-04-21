import { useState, useEffect } from 'react';
import {
  getMinimalOverview,
  getDiversionRate,
  getWasteLast7Days,
  getWasteTrendComparison,
} from '../services/analyticsApi';

export function useAnalytics(branchId) {
  const [overview, setOverview] = useState(null);
  const [diversion, setDiversion] = useState(null);
  const [chartBins, setChartBins] = useState([]);
  const [trendComp, setTrendComp] = useState(null);
  const [isLoading, setLoading] = useState(true);

  const load = async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      const [{ data: o }, { data: d }, { data: last7 }, { data: trend }] = await Promise.all([
        getMinimalOverview(branchId),
        getDiversionRate(branchId),
        getWasteLast7Days(branchId),
        getWasteTrendComparison(branchId),
      ]);
      setOverview(o.data);
      setDiversion(d.data);
      setChartBins(last7.data);
      setTrendComp(trend.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [branchId]);

  return { overview, diversion, chartBins, trendComp, isLoading, reload: load };
}
