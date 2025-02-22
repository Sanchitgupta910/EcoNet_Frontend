import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from './dashboardHeader';
import NetNada_logo from '../assets/NetNada_logo.png';
import SideMenu from '../components/layouts/side-menu';
import BinCards from '../components/ui/bin-cards';
import axios from 'axios';
// Use the custom socket hook to establish and manage the socket connection.
import { useSocket } from '../lib/socket';

/**
 * initialState defines the initial state for aggregated bin data.
 * - binData: an array to hold aggregated bin objects.
 * - isLoading: a flag indicating if the data is being fetched.
 * - error: holds any error message encountered during data fetching.
 */
const initialState = {
  binData: [],
  isLoading: true,
  error: null,
};

/**
 * reducer function to handle state transitions:
 * - FETCH_SUCCESS: Stores the fetched bin data and sets loading to false.
 * - FETCH_ERROR: Sets the error message and marks loading as false.
 * - UPDATE_BIN: Updates an individual bin's data when a socket event is received.
 */
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

/**
 * DashboardPage component:
 * - Retrieves current user data from Redux.
 * - Determines the default branch from the user's company data.
 * - Fetches aggregated bin data for that branch using an HTTP call.
 * - Listens for real-time updates via Socket.io and updates state accordingly.
 * - Renders the DashboardHeader and, for normal admins, the BinCards component.
 */
export default function DashboardPage() {
  // Retrieve the current user from the Redux store.
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  
  // Use a reducer to manage the aggregated bin data state.
  const [state, dispatch] = useReducer(reducer, initialState);

  // Establish a Socket.io connection using the custom hook.
  const { isConnected, on, emit } = useSocket("http://localhost:3000");

  /**
   * fetchBinData: A useCallback function that fetches aggregated bin data from the backend.
   * It calls the aggregation endpoint with the branchId and updates the state.
   */
  const fetchBinData = useCallback(async () => {
    if (user?.role === "Admin" && user?.branchAddress?._id) {
      try {
        const response = await axios.get(
          `/api/v1/dustbin/aggregated?branchId=${user.branchAddress._id}`,
          { withCredentials: true }
        );
        // Log fetched data (for debugging, can be removed later).
        console.log("Fetched bin data (HTTP):", response.data.data);
        // Sort the aggregated data alphabetically by binName.
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

  // Fetch bin data on component mount and whenever the user changes.
  useEffect(() => {
    fetchBinData();
  }, [fetchBinData]);

  /**
   * useEffect to listen for real-time updates via Socket.io.
   * When the "binWeightUpdated" event is received, we update the corresponding bin in state.
   */
  useEffect(() => {
    const handleBinWeightUpdated = (newBinData) => {
      console.log("Received binWeightUpdated event (socket):", newBinData);
      // Create a new array reference by cloning and sorting the incoming data.
      const sortedData = [...newBinData].sort((a, b) =>
        a.binName.localeCompare(b.binName)
      );
      // Update each bin record in the state.
      sortedData.forEach(updatedBin => {
        dispatch({ type: 'UPDATE_BIN', payload: updatedBin });
      });
    };

    on('binWeightUpdated', handleBinWeightUpdated);

    // Cleanup: Remove the socket listener on unmount.
    return () => {
      // Since our useSocket hook doesn't expose an 'off' method explicitly,
      // we assume it cleans up on unmount, or we could add that method to our hook.
    };
  }, [on]);

  // If user data is not yet loaded, display a loading message.
  if (!user) {
    return <div>Loading dashboard...</div>;
  }

  // Determine branch details from the user's company data.
  const allBranches = user.company?.branchAddresses || [];
  const defaultBranchIdStr = user.branchAddress?._id?.toString();
  const defaultBranch = allBranches.find(
    (branch) => branch._id.toString() === defaultBranchIdStr
  );
  const remainingBranches = allBranches.filter(
    (branch) => branch._id.toString() !== defaultBranchIdStr
  );

  // Construct the company data object to be passed to DashboardHeader.
  const companyData = {
    companyName: user.company?.CompanyName || "Default Company",
    companyLogo: user.company?.logo || NetNada_logo,
    branches: defaultBranch ? [defaultBranch, ...remainingBranches] : allBranches,
    userEmail: user.email,
    otherEmails: user.otherEmails || [],
    isAdmin: user.role === "Admin",
  };

  return (
    <div className="flex h-screen">
      {/* Render SideMenu only if the user is a SuperAdmin */}
      {user.role === "SuperAdmin" && <SideMenu />}
      
      {/* Main Dashboard Area */}
      <div className="flex-1 overflow-auto">
        {/* Render header with company and branch information */}
        <DashboardHeader {...companyData} />
        <div className="p-4">
          {/* Render bin cards only for normal admins */}
          {user.role !== "SuperAdmin" && (
            <BinCards
              binData={state.binData}
              isLoading={state.isLoading}
              error={state.error}
            />
          )}
          {/* Additional dashboard components (charts, tables, etc.) can be added here */}
        </div>
      </div>
    </div>
  );
}
