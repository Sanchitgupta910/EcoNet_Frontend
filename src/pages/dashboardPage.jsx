import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DashboardHeader from './dashboardHeader';
import NetNada_logo from '../assets/NetNada_logo.png';
import SideMenu from '../components/layouts/side-menu';
import BinCards from '../components/ui/bin-cards.jsx';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

/**
 * DashboardPage uses the current user data from Redux to build props for DashboardHeader.
 * It fetches aggregated bin data (binName, binCapacity, latestWeight) for the selected branch,
 * and for normal admins, it renders BinCards with that dynamic data.
 */
export default function DashboardPage() {
  // Get current user from Redux.
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  
  // State to hold aggregated bin data as an array.
  const [binData, setBinData] = useState([]);

  if (!user) {
    return <div>Loading dashboard...</div>;
  }

  // Determine the default branch (user's assigned branch).
  const defaultBranchId = user.branchAddress?._id?.toString();
  const allBranches = user.company?.branchAddresses || [];
  const defaultBranch = allBranches.find(
    (branch) => branch._id.toString() === defaultBranchId
  );
  const remainingBranches = allBranches.filter(
    (branch) => branch._id.toString() !== defaultBranchId
  );

  // Build the company data object for DashboardHeader.
  const companyData = {
    companyName: user.company?.CompanyName || "Default Company",
    companyLogo: user.company?.logo || NetNada_logo,
    branches: defaultBranch ? [defaultBranch, ...remainingBranches] : allBranches,
    userEmail: user.email,
    otherEmails: user.otherEmails || [],
    isAdmin: user.role === "Admin", // true for normal admin.
  };

  // Fetch aggregated bin data for the selected branch (only for normal admins).
  useEffect(() => {
    if (user.role === "Admin" && defaultBranchId) {
      axios
        .get(`/api/v1/dustbin/aggregated?branchId=${defaultBranchId}`, { withCredentials: true })
        .then((response) => {
          console.log("Aggregated bin data:", response.data.data);
          setBinData(response.data.data); // binData is now an array of objects.
        })
        .catch((error) => {
          console.error("Error fetching aggregated bin data:", error);
        });
    }
  }, [user.role, defaultBranchId]);

  return (
    <div className="flex h-screen">
      {/* Render SideMenu only for SuperAdmin */}
      {user.role === "SuperAdmin" && <SideMenu />}
      
      {/* Main Dashboard Area */}
      <div className="flex-1 overflow-auto">
        {/* Render header with company and branch info */}
        <DashboardHeader {...companyData} />
        <div className="p-4">
          {/* Render bin cards only for normal admins using the dynamic binData */}
          {user.role !== "SuperAdmin" && <BinCards binData={binData} />}
          {/* Other dashboard components, charts, etc. */}
        </div>
      </div>
    </div>
  );
}
