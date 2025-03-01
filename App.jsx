import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLoader from './src/pages/AppLoader'; // Loads essential data on app start
import ProtectedRoute from './src/lib/protectedRoute'; // Protects routes from unauthorized access

// Import your page components
import Login from './src/pages/login';
import Companies from './src/pages/companies';
import CompanyInfo from './src/pages/CompanyInfo';
import Dashboard from './src/pages/DashboardPage';

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

          {/* Protected route for Companies page */}
          <Route
            path="/companies"
            element={
              <ProtectedRoute>
                <Companies />
              </ProtectedRoute>
            }
          />

          {/* Protected route for Company Info page */}
          <Route
            path="/company/:id"
            element={
              <ProtectedRoute>
                <CompanyInfo />
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
