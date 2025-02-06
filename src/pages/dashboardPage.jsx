import React from 'react';
import { useSelector } from 'react-redux';
import DashboardHeader from './dashboardHeader';
import NetNada_logo from '../assets/NetNada_logo.png';

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
    isAdmin: user.role === "Admin", // or however you determine admin type
  };

  return (
    <div>
      <DashboardHeader {...companyData} />
      {/* Rest of your dashboard content */}
      <div>
        {/* <h1>Dashboard Content</h1> */}
      </div>
    </div>
  );
}
