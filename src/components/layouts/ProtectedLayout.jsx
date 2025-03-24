'use client';

import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider } from '@/components/ui/theme-provider';
import Header from '@/components/layouts/Header.jsx';
import LoadingSpinner from '@/components/ui/Spinner';

/*
  ProtectedLayout:
  - This persistent layout is used for all protected routes.
  - It checks user authentication via an API call.
  - While loading, it shows a spinner.
  - If authentication fails, it redirects to the login page.
  - It conditionally renders the Header: if the user is an employee (or a navigation flag is set), it hides the header.
  - The <Outlet /> renders the nested route content.
*/
export default function ProtectedLayout() {
  const [user, setUser] = useState(null); // Holds authenticated user data.
  const [loading, setLoading] = useState(true); // Authentication loading flag.
  const location = useLocation(); // To check route state for flags.

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Call to check authentication.
        const response = await axios.get('/api/v1/users/me', {
          withCredentials: true,
        });
        if (response.data && response.data.data) {
          setUser(response.data.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Determine if the header should be hidden:
  // Hide header if the user is an employee or if a navigation flag (fromAdmin) exists.
  const hideHeader =
    user.role === 'EmployeeDashboardUser' ||
    user.role === 'BinDisplayUser' ||
    location.state?.fromAdmin;

  return (
    <ThemeProvider defaultTheme="light" storageKey="econet-theme">
      {/* Conditionally render Header */}
      {!hideHeader && <Header user={user} />}
      {/* Render nested route content via Outlet */}
      <main className={!hideHeader ? 'min-h-[calc(100vh-64px)]' : 'min-h-screen'}>
        <Outlet />
      </main>
    </ThemeProvider>
  );
}
