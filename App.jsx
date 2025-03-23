// import React from 'react';
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import AppLoader from './src/lib/AppLoader';
// import ProtectedRoute from './src/lib/ProtectedRoute';
// import { ToastProvider } from './src/components/ui/ToastProvider';
// import ClientLayout from './src/components/layouts/ClientLayout'; // Ensure correct import

// import Login from './src/pages/Login';
// import Companies from './src/pages/Companies';
// import CompanyInfo from './src/pages/CompanyInfo';
// import UserLogs from './src/pages/UserLogs';
// import InviteUserPage from './src/pages/InviteUser';
// import PasswordResetRequestPage from './src/pages/PasswordResetRequestPage';
// import UserSetupPage from './src/pages/UserSetup';
// import PasswordResetPage from './src/pages/PasswordResetPage';

// // Dashboard pages
// import AdminDashboard from './src/pages/admin-dashboard.jsx';
// import EmployeeBinDisplayDashboard from './src/pages/employee-bin-display-dashboard.jsx';

// import './src/styles/globals.css';

// /**
//  * Higher-order component to restrict access to SuperAdmin only.
//  * Only users with role "SuperAdmin" can access the wrapped component.
//  */
// const SuperAdminOnly = ({ children }) => {
//   const storedUser = JSON.parse(sessionStorage.getItem('user'));
//   const userRole = storedUser?.role;
//   return userRole === 'SuperAdmin' ? children : <Navigate to="/dashboard" />;
// };

// /**
//  * Higher-order component to restrict access to admin-only routes.
//  * Only allowed roles (SuperAdmin, CountryAdmin, RegionalAdmin, CityAdmin) are permitted.
//  * EmployeeDashboardUser and BinDisplayUser are redirected.
//  */
// const AdminDashboardOnly = ({ children }) => {
//   const storedUser = JSON.parse(sessionStorage.getItem('user'));
//   const userRole = storedUser?.role;
//   const allowedRoles = ['SuperAdmin', 'CountryAdmin', 'RegionalAdmin', 'CityAdmin'];
//   return allowedRoles.includes(userRole) ? children : <Navigate to="/dashboard" />;
// };

// function App() {
//   const storedUser = JSON.parse(sessionStorage.getItem('user'));
//   const userRole = storedUser?.role;
//   const isEmployeeOrBinDisplay =
//     userRole === 'EmployeeDashboardUser' || userRole === 'BinDisplayUser';

//   const renderDashboard = () => {
//     if (isEmployeeOrBinDisplay) {
//       return <EmployeeBinDisplayDashboard />;
//     }
//     return <AdminDashboard />;
//   };

//   return (
//     <BrowserRouter>
//       <AppLoader>
//         <Routes>
//           {/* Public Routes (No Layout) */}
//           <Route path="/login" element={<Login />} />
//           <Route path="/user-setup" element={<UserSetupPage />} />
//           <Route path="/password-reset-request" element={<PasswordResetRequestPage />} />
//           <Route path="/password-reset" element={<PasswordResetPage />} />

//           {/* Protected Routes */}
//           <Route
//             path="/*"
//             element={
//               <ProtectedRoute>
//                 {isEmployeeOrBinDisplay ? (
//                   // For Employee/Bin Display users, render without ClientLayout (i.e. no header)
//                   <ToastProvider>
//                     <Routes>
//                       <Route path="/dashboard" element={renderDashboard()} />
//                     </Routes>
//                   </ToastProvider>
//                 ) : (
//                   // For Admin users, wrap protected pages with ClientLayout (includes header)
//                   <ClientLayout>
//                     <ToastProvider>
//                       <Routes>
//                         <Route path="/dashboard" element={renderDashboard()} />
//                         <Route
//                           path="/companies"
//                           element={
//                             <SuperAdminOnly>
//                               <Companies />
//                             </SuperAdminOnly>
//                           }
//                         />
//                         <Route
//                           path="/company/:id"
//                           element={
//                             <SuperAdminOnly>
//                               <CompanyInfo />
//                             </SuperAdminOnly>
//                           }
//                         />
//                         <Route
//                           path="/user-logs"
//                           element={
//                             <AdminDashboardOnly>
//                               <UserLogs />
//                             </AdminDashboardOnly>
//                           }
//                         />
//                         <Route path="/invite-user/:companyId" element={<InviteUserPage />} />
//                       </Routes>
//                     </ToastProvider>
//                   </ClientLayout>
//                 )}
//               </ProtectedRoute>
//             }
//           />
//         </Routes>
//       </AppLoader>
//     </BrowserRouter>
//   );
// }

// export default App;

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AppLoader from './src/lib/AppLoader';
import ProtectedRoute from './src/lib/ProtectedRoute';
import { ToastProvider } from './src/components/ui/ToastProvider';
import ClientLayout from './src/components/layouts/ClientLayout';

import Login from './src/pages/Login';
import Companies from './src/pages/Companies';
import CompanyInfo from './src/pages/CompanyInfo';
import UserLogs from './src/pages/UserLogs';
import InviteUserPage from './src/pages/InviteUser';
import PasswordResetRequestPage from './src/pages/PasswordResetRequestPage';
import UserSetupPage from './src/pages/UserSetup';
import PasswordResetPage from './src/pages/PasswordResetPage';

// Dashboard pages
import AdminDashboard from './src/pages/admin-dashboard.jsx';
import EmployeeBinDisplayDashboard from './src/pages/employee-bin-display-dashboard.jsx';

import './src/styles/globals.css';

/**
 * Custom hook to keep currentUser state in sync with sessionStorage.
 */
const useCurrentUser = () => {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('user'));
    } catch (error) {
      return null;
    }
  });

  useEffect(() => {
    // Whenever the route changes, re-read sessionStorage
    const storedUser = sessionStorage.getItem('user');
    setCurrentUser(storedUser ? JSON.parse(storedUser) : null);
  }, [location]);

  return currentUser;
};

/**
 * Higher-order component to restrict access to SuperAdmin only.
 * Receives the currentUser as a prop.
 */
const SuperAdminOnly = ({ children, currentUser }) => {
  return currentUser?.role === 'SuperAdmin' ? children : <Navigate to="/dashboard" />;
};

/**
 * Higher-order component to restrict access to admin-only routes.
 * Receives the currentUser as a prop.
 */
const AdminDashboardOnly = ({ children, currentUser }) => {
  const allowedRoles = ['SuperAdmin', 'CountryAdmin', 'RegionalAdmin', 'CityAdmin'];
  return allowedRoles.includes(currentUser?.role) ? children : <Navigate to="/dashboard" />;
};

const AppRoutes = () => {
  const currentUser = useCurrentUser();
  const isEmployeeOrBinDisplay =
    currentUser?.role === 'EmployeeDashboardUser' || currentUser?.role === 'BinDisplayUser';

  const renderDashboard = () => {
    if (isEmployeeOrBinDisplay) {
      return <EmployeeBinDisplayDashboard />;
    }
    return <AdminDashboard />;
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/user-setup" element={<UserSetupPage />} />
      <Route path="/password-reset-request" element={<PasswordResetRequestPage />} />
      <Route path="/password-reset" element={<PasswordResetPage />} />

      {/* Protected Routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            {isEmployeeOrBinDisplay ? (
              // Employee/Bin Display users get no header layout.
              <ToastProvider>
                <Routes>
                  <Route path="/dashboard" element={renderDashboard()} />
                </Routes>
              </ToastProvider>
            ) : (
              // Admin users get the header via ClientLayout.
              <ClientLayout>
                <ToastProvider>
                  <Routes>
                    <Route path="/dashboard" element={renderDashboard()} />
                    <Route
                      path="/companies"
                      element={
                        <SuperAdminOnly currentUser={currentUser}>
                          <Companies />
                        </SuperAdminOnly>
                      }
                    />
                    <Route
                      path="/company/:id"
                      element={
                        <SuperAdminOnly currentUser={currentUser}>
                          <CompanyInfo />
                        </SuperAdminOnly>
                      }
                    />
                    <Route
                      path="/user-logs"
                      element={
                        <AdminDashboardOnly currentUser={currentUser}>
                          <UserLogs />
                        </AdminDashboardOnly>
                      }
                    />
                    <Route path="/invite-user/:companyId" element={<InviteUserPage />} />
                  </Routes>
                </ToastProvider>
              </ClientLayout>
            )}
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppLoader>
        <AppRoutes />
      </AppLoader>
    </BrowserRouter>
  );
}

export default App;
