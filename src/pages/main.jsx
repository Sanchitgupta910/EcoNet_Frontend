import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../app/store'; // Your Redux store
import AppLoader from './AppLoader'; // Loads essential data on app start
import ProtectedRoute from '../lib/protectedRoute'; // Protects routes from unauthorized access

// Import your page components
import Login from './login';
import Companies from './companies';
import CompanyInfo from './CompanyInfo';

// Import global styles (if any)
import '../styles/globals.css';

/**
 * The main entry point for the application.
 * - The Redux Provider makes the store available to all components.
 * - BrowserRouter sets up the routing system.
 * - AppLoader fetches essential data (like the current user) on app load.
 * - ProtectedRoute ensures that certain routes (like /companies) are accessible
 *   only to authenticated users.
 */
createRoot(document.getElementById('root')).render(
  <Provider store={store}>
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
          
          {/* Route for Company Info page (can also be protected if needed) */}
          <Route path="/company/:id" element={<CompanyInfo />} />
        </Routes>
      </AppLoader>
    </BrowserRouter>
  </Provider>
);