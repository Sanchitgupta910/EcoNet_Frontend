import React, { useState, useEffect, useReducer, useCallback } from "react";
import { useSelector } from "react-redux";
import DashboardHeader from "../components/layouts/DashboardHeader";
import NetNada_logo from "../assets/NetNada_logo.png";
import SideMenu from "../components/layouts/SideMenu";
import BinCards from "../components/ui/BinCards";
import DonutChart from "../components/ui/DonutChart";
import DualLineAreaChart from "../components/ui/AreaChart";
import axios from "axios";
import { useSocket } from "../lib/Socket";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/Select";

const initialState = {
  binData: [],
  isLoading: true,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_SUCCESS":
      return {
        ...state,
        binData: action.payload,
        isLoading: false,
        error: null,
      };
    case "FETCH_ERROR":
      return { ...state, isLoading: false, error: action.payload };
    case "UPDATE_BIN":
      return {
        ...state,
        binData: state.binData.map((bin) =>
          bin._id === action.payload._id ? { ...bin, ...action.payload } : bin
        ),
      };
    default:
      return state;
  }
}

export default function DashboardPage() {
  const user = useSelector((state) => state.user.user);
  const [selectedBranch, setSelectedBranch] = useState(
    user?.branchAddress?._id || ""
  );
  const [state, dispatch] = useReducer(reducer, initialState);
  const [commonFilter, setCommonFilter] = useState("today");
  const [donutData, setDonutData] = useState(null);
  const { on } = useSocket("http://localhost:3000");

  // Callback to update branch when DashboardHeader notifies a change
  const handleBranchChange = useCallback((branchId) => {
    setSelectedBranch(branchId);
  }, []);

  const fetchBinData = useCallback(async () => {
    if (user?.role === "Admin" && selectedBranch) {
      try {
        const response = await axios.get(
          `/api/v1/dustbin/aggregated?branchId=${selectedBranch}`,
          { withCredentials: true }
        );
        if (!response.data.data || response.data.data.length === 0) {
          dispatch({
            type: "FETCH_ERROR",
            payload: "No bin data available for selected branch.",
          });
        } else {
          const sortedData = [...response.data.data].sort((a, b) =>
            a.binName.localeCompare(b.binName)
          );
          dispatch({ type: "FETCH_SUCCESS", payload: sortedData });
        }
      } catch (error) {
        console.error("Error fetching bin data:", error);
        dispatch({ type: "FETCH_ERROR", payload: error.message });
      }
    }
  }, [selectedBranch, user]);

  const fetchDonutData = useCallback(async () => {
    if (user?.role === "Admin" && selectedBranch) {
      try {
        const response = await axios.get(
          `/api/v1/analytics/branchWasteBreakdown?branchId=${selectedBranch}&filter=${commonFilter}`,
          { withCredentials: true }
        );
        const rawData = response.data.data;
        if (!rawData || rawData.length === 0) {
          setDonutData(null);
        } else {
          const aggregated = {};
          rawData.forEach((item) => {
            aggregated[item.binType] =
              (aggregated[item.binType] || 0) + item.totalWaste;
          });
          const labels = Object.keys(aggregated);
          const weights = Object.values(aggregated);
          const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
          const transformedData = {
            labels,
            datasets: [
              {
                data: weights,
                backgroundColor: ["#ffca6c", "#7ba8d9", "#ff9f40", "#4bc0c0"],
                borderColor: ["#fff", "#fff", "#fff", "#fff"],
                borderWidth: 2,
                hoverOffset: 10,
              },
            ],
            totalWeight,
          };
          setDonutData(transformedData);
        }
      } catch (error) {
        console.error("Error fetching donut data:", error);
        setDonutData(null);
      }
    }
  }, [selectedBranch, commonFilter, user]);

  useEffect(() => {
    fetchBinData();
    fetchDonutData();
  }, [fetchBinData, fetchDonutData]);

  useEffect(() => {
    const handleBinWeightUpdated = (newBinData) => {
      const sortedData = [...newBinData].sort((a, b) =>
        a.binName.localeCompare(b.binName)
      );
      sortedData.forEach((updatedBin) => {
        dispatch({ type: "UPDATE_BIN", payload: updatedBin });
      });
    };
    on("binWeightUpdated", handleBinWeightUpdated);
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
    branches: defaultBranch
      ? [defaultBranch, ...remainingBranches]
      : allBranches,
    userEmail: user.email,
    otherEmails: user.otherEmails || [],
    isAdmin: user.role === "Admin",
  };
  const wasteBreakdownDesc =
    "A summary of waste distribution by category, based on final daily readings. Total waste is currently 3.2% higher compared to last month.";
  const landfillDiversionDesc =
    "Percentage of waste diverted from landfill (all waste excluding General Waste). Landfill diversion is 5.5% higher than last week.";
  const recyclingRateDesc =
    "Share of waste that is recycled (from Commingled and Paper & Cardboard bins). Recycling rate is 2.3% lower than last week.";

  return (
    <div className="flex h-screen bg-[#EDF2F9]">
      {user.role === "SuperAdmin" && <SideMenu />}
      <div className="flex-1 overflow-auto">
        <DashboardHeader {...companyData} onBranchChange={handleBranchChange} />
        <div className="p-6 space-y-6">
          {user.role !== "SuperAdmin" && (
            <>
              {state.error ? (
                <div className="text-red-500 text-center my-4">
                  {state.error}
                </div>
              ) : (
                <BinCards
                  binData={state.binData}
                  isLoading={state.isLoading}
                  error={state.error}
                />
              )}
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
                <div>
                  <DonutChart
                    title="Waste Breakdown"
                    description={wasteBreakdownDesc}
                    data={
                      donutData || {
                        labels: [],
                        datasets: [{ data: [] }],
                        totalWeight: 0,
                      }
                    }
                  />
                  {!donutData && (
                    <div className="text-center text-gray-600 mt-2">
                      No waste breakdown data available
                    </div>
                  )}
                </div>
                <DualLineAreaChart
                  title="Landfill Diversion Rate"
                  description={landfillDiversionDesc}
                  branchId={selectedBranch}
                  filter={commonFilter}
                  rateKey="diversionRate"
                  targetKey="targetDiversionRate"
                />
                <DualLineAreaChart
                  title="Recycling Rate"
                  description={recyclingRateDesc}
                  branchId={selectedBranch}
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
