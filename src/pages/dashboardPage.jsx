import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { useSelector } from 'react-redux';
import DashboardHeader from '../components/layouts/dashboardHeader';
import NetNada_logo from '../assets/NetNada_logo.png';
import SideMenu from '../components/layouts/side-menu';
import BinCards from '../components/ui/bin-cards';
import DonutChart from '../components/ui/donutChart';
import DualLineAreaChart from '../components/ui/areaChart';
import axios from 'axios';
import { useSocket } from '../lib/socket';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

const initialState = {
  binData: [],
  isLoading: true,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_SUCCESS':
      return { ...state, binData: action.payload, isLoading: false, error: null };
    case 'FETCH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'UPDATE_BIN':
      return {
        ...state,
        binData: state.binData.map(bin =>
          bin._id === action.payload._id ? { ...bin, ...action.payload } : bin
        ),
      };
    default:
      return state;
  }
}

export default function DashboardPage() {
  const user = useSelector((state) => state.user.user);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [commonFilter, setCommonFilter] = useState("today");
  const [donutData, setDonutData] = useState(null);
  const { on } = useSocket("http://localhost:3000");

  const fetchBinData = useCallback(async () => {
    if (user?.role === "Admin" && user?.branchAddress?._id) {
      try {
        const response = await axios.get(
          `/api/v1/dustbin/aggregated?branchId=${user.branchAddress._id}`,
          { withCredentials: true }
        );
        const sortedData = [...response.data.data].sort((a, b) =>
          a.binName.localeCompare(b.binName)
        );
        dispatch({ type: 'FETCH_SUCCESS', payload: sortedData });
      } catch (error) {
        console.error("Error fetching bin data:", error);
        dispatch({ type: 'FETCH_ERROR', payload: error.message });
      }
    }
  }, [user]);

  const fetchDonutData = useCallback(async () => {
    if (user?.role === "Admin" && user?.branchAddress?._id) {
      try {
        const response = await axios.get(
          `/api/v1/analytics/branchWasteBreakdown?branchId=${user.branchAddress._id}&filter=${commonFilter}`,
          { withCredentials: true }
        );
        const rawData = response.data.data;
        const aggregated = {};
        rawData.forEach(item => {
          aggregated[item.binType] = (aggregated[item.binType] || 0) + item.totalWaste;
        });
        const labels = Object.keys(aggregated);
        const weights = Object.values(aggregated);
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        const transformedData = {
          labels,
          datasets: [
            {
              data: weights,
              backgroundColor: ['#ffca6c', '#7ba8d9', '#ff9f40', '#4bc0c0'],
              borderColor: ['#fff', '#fff', '#fff', '#fff'],
              borderWidth: 2,
              hoverOffset: 10,
            }
          ],
          totalWeight,
        };
        setDonutData(transformedData);
      } catch (error) {
        console.error("Error fetching donut data:", error);
      }
    }
  }, [user, commonFilter]);

  useEffect(() => {
    fetchBinData();
    fetchDonutData();
  }, [fetchBinData, fetchDonutData]);

  useEffect(() => {
    const handleBinWeightUpdated = (newBinData) => {
      const sortedData = [...newBinData].sort((a, b) =>
        a.binName.localeCompare(b.binName)
      );
      sortedData.forEach(updatedBin => {
        dispatch({ type: 'UPDATE_BIN', payload: updatedBin });
      });
    };
    on('binWeightUpdated', handleBinWeightUpdated);
  }, [on]);

  if (!user) {
    return <div>Loading dashboard...</div>;
  }

  const allBranches = user.company?.branchAddresses || [];
  const defaultBranchIdStr = user.branchAddress?._id?.toString();
  const defaultBranch = allBranches.find(
    (branch) => branch._id.toString() === defaultBranchIdStr
  );
  const remainingBranches = allBranches.filter(
    (branch) => branch._id.toString() !== defaultBranchIdStr
  );

  const companyData = {
    companyName: user.company?.CompanyName || "Default Company",
    companyLogo: user.company?.logo || NetNada_logo,
    branches: defaultBranch ? [defaultBranch, ...remainingBranches] : allBranches,
    userEmail: user.email,
    otherEmails: user.otherEmails || [],
    isAdmin: user.role === "Admin",
  };

  return (
    <div className="flex h-screen bg-[#EDF2F9]">
      {user.role === "SuperAdmin" && <SideMenu />}
      <div className="flex-1 overflow-auto">
        <DashboardHeader {...companyData} />
        <div className="p-6 space-y-6">
          {user.role !== "SuperAdmin" && (
            <>
              <BinCards
                binData={state.binData}
                isLoading={state.isLoading}
                error={state.error}
              />
              <div className="flex justify-end mb-4">
                <Select value={commonFilter} onValueChange={setCommonFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="thisWeek">This Week</SelectItem>
                    <SelectItem value="lastWeek">Last Week</SelectItem>
                    <SelectItem value="lastMonth">Last Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {donutData && (
                  <DonutChart
                    title="Waste Breakdown"
                    data={donutData}
                  />
                )}
                <DualLineAreaChart
                  title="Landfill Diversion Rate"
                  branchId={user.branchAddress._id}
                  filter={commonFilter}
                  rateKey="diversionRate"
                  targetKey="targetDiversionRate"
                />
                <DualLineAreaChart
                  title="Recycling Rate"
                  branchId={user.branchAddress._id}
                  filter={commonFilter}
                  rateKey="recyclingRate"
                  targetKey="targetRecyclingRate"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}