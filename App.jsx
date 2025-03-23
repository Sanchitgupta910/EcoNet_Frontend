import React from 'react';
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
 * Higher-order component to restrict access to SuperAdmin only.
 */
const SuperAdminOnly = ({ children }) => {
  const storedUser = JSON.parse(sessionStorage.getItem('user'));
  const userRole = storedUser?.role;
  return userRole === 'SuperAdmin' ? children : <Navigate to="/dashboard" />;
};

/**
 * Higher-order component to restrict access to admin-only routes.
 */
const AdminDashboardOnly = ({ children }) => {
  const storedUser = JSON.parse(sessionStorage.getItem('user'));
  const userRole = storedUser?.role;
  const allowedRoles = ['SuperAdmin', 'CountryAdmin', 'RegionalAdmin', 'CityAdmin'];
  return allowedRoles.includes(userRole) ? children : <Navigate to="/dashboard" />;
};

/**
 * RenderDashboard component that conditionally wraps the dashboard content.
 * - If the navigation state indicates "fromAdmin" or the user is an Employee/BinDisplay user,
 *   it renders EmployeeBinDisplayDashboard without the header.
 * - Otherwise, it wraps the AdminDashboard in ClientLayout to include the header.
 */
const RenderDashboard = () => {
  const location = useLocation();
  const storedUser = JSON.parse(sessionStorage.getItem('user'));
  const userRole = storedUser?.role;
  const fromAdminNav = location.state?.fromAdmin || false;
  const isEmployeeOrBinDisplay =
    userRole === 'EmployeeDashboardUser' || userRole === 'BinDisplayUser';

  console.log('Rendering dashboard with state:', { fromAdminNav, userRole });

  if (fromAdminNav || isEmployeeOrBinDisplay) {
    return <EmployeeBinDisplayDashboard />;
  } else {
    return (
      <ClientLayout>
        <AdminDashboard />
      </ClientLayout>
    );
  }
};

function App() {
  return (
    <BrowserRouter>
      <AppLoader>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/user-setup" element={<UserSetupPage />} />
          <Route path="/password-reset-request" element={<PasswordResetRequestPage />} />
          <Route path="/password-reset" element={<PasswordResetPage />} />

          {/* Protected Dashboard Route */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Routes>
                  <Route path="/dashboard" element={<RenderDashboard />} />
                </Routes>
              </ProtectedRoute>
            }
          />

          {/* Other protected admin routes wrapped with ClientLayout */}
          <Route
            path="/companies"
            element={
              <ProtectedRoute>
                <ClientLayout>
                  <ToastProvider>
                    <SuperAdminOnly>
                      <Companies />
                    </SuperAdminOnly>
                  </ToastProvider>
                </ClientLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/:id"
            element={
              <ProtectedRoute>
                <ClientLayout>
                  <ToastProvider>
                    <SuperAdminOnly>
                      <CompanyInfo />
                    </SuperAdminOnly>
                  </ToastProvider>
                </ClientLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-logs"
            element={
              <ProtectedRoute>
                <ClientLayout>
                  <ToastProvider>
                    <AdminDashboardOnly>
                      <UserLogs />
                    </AdminDashboardOnly>
                  </ToastProvider>
                </ClientLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/invite-user/:companyId"
            element={
              <ProtectedRoute>
                <ClientLayout>
                  <ToastProvider>
                    <InviteUserPage />
                  </ToastProvider>
                </ClientLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AppLoader>
    </BrowserRouter>
  );
}

export default App;
