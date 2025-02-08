import React from 'react';
import { useSelector } from 'react-redux';
import DashboardHeader from './dashboardHeader';
import NetNada_logo from '../assets/NetNada_logo.png';
import SideMenu from '../components/layouts/side-menu';

/**
 * DashboardPage uses the current user data from Redux to build the props
 * for DashboardHeader. It assumes that the user object includes a populated
 * "company" field and that company.branchAddresses is an array containing
 * all branches for that company.
 */
export default function DashboardPage() {
  // Get the current user from Redux.
  const user = useSelector((state) => state.user.user);

  if (!user) {
    return <div>Loading dashboard...</div>;
  }

  // The default branch is the branch where the user is assigned.
  // (Assuming user.branchAddress is populated and has an _id field.)
  const defaultBranchId = user.branchAddress?._id?.toString();

  // Filter the company's branchAddresses: 
  // The default branch will be shown as selected,
  // and the remaining branches are the others.
  const allBranches = user.company?.branchAddresses || [];
  // Separate the default branch and the other branches.
  const defaultBranch = allBranches.find(
    (branch) => branch._id.toString() === defaultBranchId
  );
  const remainingBranches = allBranches.filter(
    (branch) => branch._id.toString() !== defaultBranchId
  );

  // Construct the data object to pass to DashboardHeader.
  const companyData = {
    companyName: user.company?.CompanyName || "Default Company",
    companyLogo: user.company?.logo || NetNada_logo,
    // In the DashboardHeader, you may choose to combine defaultBranch
    // and remainingBranches or pass them separately.
    branches: defaultBranch ? [defaultBranch, ...remainingBranches] : allBranches,
    userEmail: user.email,
    otherEmails: user.otherEmails || [],
    isAdmin: user.role === "Admin", // isAdmin is true if the user is a normal admin.
  };

  return (
    <div className="flex h-screen">
      {/* If the user is a SuperAdmin, render the side menu */}
      {user.role === "SuperAdmin" && <SideMenu />}
      
      {/* Main dashboard area */}
      <div className="flex-1">
        {/* Render the dashboard header with company and branch information */}
        <DashboardHeader {...companyData} />
        
        {/* Additional dashboard content can be added here */}
        <div className="p-4">
          {/* Dashboard content goes here */}
          {/* For example: charts, tables, etc. */}
        </div>
      </div>
    </div>
  );
}
