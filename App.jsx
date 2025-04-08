import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLoader from './src/lib/AppLoader'; // Provides global loaders or initialization.
import ProtectedLayout from './src/components/layouts/ProtectedLayout'; // Persistent layout that checks authentication.

import './src/styles/globals.css';

import Login from './src/pages/Login';
import UserSetupPage from './src/pages/UserSetup';
import PasswordResetRequestPage from './src/pages/PasswordResetRequestPage';
import PasswordResetPage from './src/pages/PasswordResetPage';

import Companies from './src/pages/Companies';
import CompanyInfo from './src/pages/CompanyInfo';
import UserLogs from './src/pages/UserLogs';
import InviteUserPage from './src/pages/InviteUser';
import CleanerScreen from './src/pages/CleanerScreen';
import WasteLoggingScreen from './src/pages/WasteLoggingScreen';

// Dashboard pages:
import DashboardContent from './src/components/layouts/DashboardContent'; // Decides between admin & employee dashboards.

// Higher‑order component to restrict access to SuperAdmin-only routes.
const SuperAdminOnly = ({ children }) => {
  const storedUser = JSON.parse(sessionStorage.getItem('user'));
  const userRole = storedUser?.role;
  return userRole === 'SuperAdmin' ? children : <Navigate to="/dashboard" />;
};

// Higher‑order component to restrict access to certain admin routes.
const AdminDashboardOnly = ({ children }) => {
  const storedUser = JSON.parse(sessionStorage.getItem('user'));
  const userRole = storedUser?.role;
  const allowedRoles = ['SuperAdmin', 'CountryAdmin', 'RegionalAdmin', 'CityAdmin'];
  return allowedRoles.includes(userRole) ? children : <Navigate to="/dashboard" />;
};

/*
  App.jsx:
  - Sets up public and protected routes.
  - Public routes (login, user setup, etc.) are defined separately.
  - All protected routes are nested under a single ProtectedLayout (with ToastProvider wrapping them).
  - The ProtectedLayout component always renders the header (or conditionally hides it) and an Outlet where nested routes will render.
  - The "/dashboard" route renders DashboardContent, which conditionally shows the AdminDashboard or EmployeeBinDisplayDashboard.
*/
function App() {
  return (
    <BrowserRouter>
      <AppLoader>
        {/* Wrap protected routes in ToastProvider and ProtectedLayout so they remain persistent */}

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/user-setup" element={<UserSetupPage />} />
          <Route path="/password-reset-request" element={<PasswordResetRequestPage />} />
          <Route path="/password-reset" element={<PasswordResetPage />} />
          <Route path="/cleaner-screen" element={<CleanerScreen />} />
          <Route path="/waste-logging-screen" element={<WasteLoggingScreen />} />

          {/* Protected Routes: All children render within ProtectedLayout */}
          <Route element={<ProtectedLayout />}>
            {/* Dashboard route */}
            <Route path="/dashboard" element={<DashboardContent />} />
            {/* Companies route accessible to SuperAdmin only */}
            <Route
              path="/companies"
              element={
                <SuperAdminOnly>
                  <Companies />
                </SuperAdminOnly>
              }
            />
            {/* Company info route accessible to SuperAdmin only */}
            <Route
              path="/company/:id"
              element={
                <SuperAdminOnly>
                  <CompanyInfo />
                </SuperAdminOnly>
              }
            />
            {/* User logs route accessible to allowed admin roles */}
            <Route
              path="/user-logs"
              element={
                <AdminDashboardOnly>
                  <UserLogs />
                </AdminDashboardOnly>
              }
            />
            {/* Invite user route */}
            <Route path="/invite-user/:companyId" element={<InviteUserPage />} />
            {/* Fallback: Redirect any unmatched route to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
        </Routes>
      </AppLoader>
    </BrowserRouter>
  );
}

export default App;
