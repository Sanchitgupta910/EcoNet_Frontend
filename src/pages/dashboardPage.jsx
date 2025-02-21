// import React, { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import DashboardHeader from './dashboardHeader';
// import NetNada_logo from '../assets/NetNada_logo.png';
// import SideMenu from '../components/layouts/side-menu';
// import BinCards from '../components/ui/bin-cards.jsx';
// import axios from 'axios';
// import socket from '../lib/socket';

// export default function DashboardPage() {
//   // Retrieve current user from Redux store.
//   const user = useSelector((state) => state.user.user);
//   const navigate = useNavigate();

//   // Local state to store aggregated bin data.
//   const [binData, setBinData] = useState([]);

//   // Show a loading message if user data has not loaded.
//   if (!user) {
//     return <div>Loading dashboard...</div>;
//   }

//   // Determine the user's default branch and sort branches accordingly.
//   const defaultBranchId = user.branchAddress?._id?.toString();
//   const allBranches = user.company?.branchAddresses || [];
//   const defaultBranch = allBranches.find(
//     (branch) => branch._id.toString() === defaultBranchId
//   );
//   const remainingBranches = allBranches.filter(
//     (branch) => branch._id.toString() !== defaultBranchId
//   );

//   // Prepare company-related data for the DashboardHeader component.
//   const companyData = {
//     companyName: user.company?.CompanyName || "Default Company",
//     companyLogo: user.company?.logo || NetNada_logo,
//     branches: defaultBranch ? [defaultBranch, ...remainingBranches] : allBranches,
//     userEmail: user.email,
//     otherEmails: user.otherEmails || [],
//     isAdmin: user.role === "Admin", // Normal admin check.
//   };

//   // Fetch aggregated bin data for normal admins when the component mounts or branch changes.
//   useEffect(() => {
//     if (user.role === "Admin" && defaultBranchId) {
//       axios
//         .get(`/api/v1/dustbin/aggregated?branchId=${defaultBranchId}`, { withCredentials: true })
//         .then((response) => {
//           console.log("Aggregated bin data (HTTP):", response.data.data);
//           // Sort data alphabetically by binName.
//           const sortedData = response.data.data.sort((a, b) =>
//             a.binName.localeCompare(b.binName)
//           );
//           setBinData(sortedData);
//         })
//         .catch((error) => {
//           console.error("Error fetching aggregated bin data:", error);
//           // Optionally: navigate to an error page or show a notification.
//         });
//     }
//   }, [user.role, defaultBranchId]);

//   // Listen for real-time updates via Socket.io.
//   useEffect(() => {
//     // Event handler for socket event.
//     const handleBinWeightUpdated = (newBinData) => {
//       console.log("Aggregated bin data (socket):", newBinData);
//       const sortedData = [...newBinData].sort((a, b) => 
//         a.binName.localeCompare(b.binName)
//       );
//       setBinData(sortedData);
//     };

//     // Register the event listener.
//     socket.on('binWeightUpdated', handleBinWeightUpdated);
    
//     // Cleanup listener on component unmount.
//     return () => {
//       socket.off('binWeightUpdated', handleBinWeightUpdated);
//     };
//   }, []); // Empty dependency array ensures this runs only once.

//   return (
//     <div className="flex h-screen">
//       {/* Show side menu only for SuperAdmin users */}
//       {user.role === "SuperAdmin" && <SideMenu />}
      
//       {/* Main Dashboard Content */}
//       <div className="flex-1 overflow-auto">
//         <DashboardHeader {...companyData} />
//         <div className="p-4">
//           {/* Render bin cards for normal admin users */}
//           {user.role !== "SuperAdmin" && <BinCards binData={binData} />}
//           {/* Other dashboard components or charts can be added here */}
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from './dashboardHeader';
import NetNada_logo from '../assets/NetNada_logo.png';
import SideMenu from '../components/layouts/side-menu';
import BinCards from '../components/ui/bin-cards';
import axios from 'axios';
import socket from '../lib/socket';

export default function DashboardPage() {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const [binData, setBinData] = useState([]);
  const [defaultBranchId, setDefaultBranchId] = useState(null);

  useEffect(() => {
    if (user) {
      setDefaultBranchId(user.branchAddress?._id?.toString());
    }
  }, [user]);

  if (!user) {
    return <div>Loading dashboard...</div>;
  }

  const allBranches = user.company?.branchAddresses || [];
  const defaultBranch = allBranches.find(
    (branch) => branch._id.toString() === defaultBranchId
  );
  const remainingBranches = allBranches.filter(
    (branch) => branch._id.toString() !== defaultBranchId
  );

  const companyData = {
    companyName: user.company?.CompanyName || "Default Company",
    companyLogo: user.company?.logo || NetNada_logo,
    branches: defaultBranch ? [defaultBranch, ...remainingBranches] : allBranches,
    userEmail: user.email,
    otherEmails: user.otherEmails || [],
    isAdmin: user.role === "Admin",
  };

  useEffect(() => {
    let isMounted = true;

    const fetchBinData = async () => {
      if (user.role === "Admin" && defaultBranchId) {
        try {
          const response = await axios.get(`/api/v1/dustbin/aggregated?branchId=${defaultBranchId}`, { withCredentials: true });
          console.log("Aggregated bin data (HTTP):", response.data.data);
          const sortedData = response.data.data.sort((a, b) =>
            a.binName.localeCompare(b.binName)
          );
          if (isMounted) {
            setBinData(sortedData);
          }
        } catch (error) {
          console.error("Error fetching aggregated bin data:", error);
        }
      }
    };

    fetchBinData();

    // Set up socket listener
    const handleBinWeightUpdated = (newBinData) => {
      console.log("Aggregated bin data (socket):", newBinData);
      const sortedData = [...newBinData].sort((a, b) => 
        a.binName.localeCompare(b.binName)
      );
      if (isMounted) {
        setBinData(sortedData);
      }
    };

    socket.on('binWeightUpdated', handleBinWeightUpdated);
    
    return () => {
      isMounted = false;
      socket.off('binWeightUpdated', handleBinWeightUpdated);
    };
  }, [user.role, defaultBranchId]);

  return (
    <div className="flex h-screen">
      {user.role === "SuperAdmin" && <SideMenu />}
      <div className="flex-1 overflow-auto">
        <DashboardHeader {...companyData} />
        <div className="p-4">
          {user.role !== "SuperAdmin" && <BinCards binData={binData} />}
        </div>
      </div>
    </div>
  );
}