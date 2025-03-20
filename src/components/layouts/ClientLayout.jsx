// ClientLayout.jsx
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ui/theme-provider';
import Header from '@/components/layouts/Header.jsx';
import LoadingSpinner from '@/components/ui/Spinner';

export default function ClientLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/v1/users/me', {
          withCredentials: true,
        });
        console.log('Auth API Response:', response.data);
        if (response.data && response.data.data) {
          setUser(response.data.data);
        } else {
          console.warn('User data is missing in the API response');
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

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="econet-theme">
      <>
        <Header user={user} />
        <main className="min-h-[calc(100vh-64px)]">
          <Suspense
            fallback={
              <div className="flex h-[calc(100vh-64px)] w-full items-center justify-center">
                <LoadingSpinner size="lg" />
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
      </>
    </ThemeProvider>
  );
}
