import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLoader from './src/lib/AppLoader'; // Loads essential data on app start
import ProtectedRoute from './src/lib/ProtectedRoute'; // Protects routes from unauthorized access
import { ToastProvider } from './src/components/ui/ToastProvider'; // Provides toast notifications

// Import your page components
import Login from './src/pages/Login';
import Companies from './src/pages/Companies';
import CompanyInfo from './src/pages/CompanyInfo';
import Dashboard from './src/pages/DashboardPage';
import InviteUserPage from './src/pages/InviteUser';
import PasswordResetRequestPage from './src/pages/PasswordResetRequestPage';
import UserSetupPage from './src/pages/UserSetup';
import PasswordResetPage from './src/pages/PasswordResetPage';

// Import global styles (if any)
import './src/styles/globals.css';

/**
 * App component defines the routing for the entire application.
 * It wraps the routes with AppLoader, which loads the current user data,
 * and uses ProtectedRoute to restrict access to authenticated users.
 */
function App() {
  return (
    <BrowserRouter>
      <AppLoader>
        <Routes>
          {/* Public route for login */}
          <Route path="/login" element={<Login />} />
          {/* Public route for User Setup page */}
          <Route path="/user-setup" element={<UserSetupPage />} />

          {/* Public route for Password Reset Request page */}
          <Route path="/password-reset-request" element={<PasswordResetRequestPage />} />

          {/* Public route for Password Reset page */}
          <Route path="/password-reset" element={<PasswordResetPage />} />

          {/* Protected route for Companies page */}
          <Route
            path="/companies"
            element={
              <ProtectedRoute>
                <ToastProvider>
                  <Companies />
                </ToastProvider>
              </ProtectedRoute>
            }
          />

          {/* Protected route for Company Info page */}
          <Route
            path="/company/:id"
            element={
              <ProtectedRoute>
                <ToastProvider>
                  <CompanyInfo />
                </ToastProvider>
              </ProtectedRoute>
            }
          />

          {/* Protected route for  Invite User page */}
          <Route
            path="/invite-user/:companyId"
            element={
              <ProtectedRoute>
                <ToastProvider>
                  <InviteUserPage />
                </ToastProvider>
              </ProtectedRoute>
            }
          />

          {/* Protected route for Dashboard page */}
          <Route
            path="/DashboardPage"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AppLoader>
    </BrowserRouter>
  );
}

export default App;
