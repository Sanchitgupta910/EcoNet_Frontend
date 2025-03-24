'use client';

import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider } from '@/components/ui/theme-provider';
import LoadingSpinner from '@/components/ui/Spinner';

export default function NoHeaderLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
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

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="econet-theme">
      <main className="min-h-screen">{children}</main>
    </ThemeProvider>
  );
}
