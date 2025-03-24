import React from 'react';
import { useLocation } from 'react-router-dom';
import AdminDashboard from '@/pages/admin-dashboard.jsx';
import EmployeeBinDisplayDashboard from '@/pages/employee-bin-display-dashboard.jsx';

/*
  DashboardContent:
  - This component is rendered for the "/dashboard" route.
  - It decides which dashboard to display based on:
    • The user role stored in sessionStorage.
    • A navigation flag (fromAdmin) provided in the location state.
  - If the user is an employee or the flag is set, it shows the employee dashboard.
  - Otherwise, it shows the admin dashboard.
*/
export default function DashboardContent() {
  const location = useLocation();
  const storedUser = JSON.parse(sessionStorage.getItem('user'));
  const userRole = storedUser?.role;
  const fromAdmin = location.state?.fromAdmin;

  if (userRole === 'EmployeeDashboardUser' || userRole === 'BinDisplayUser' || fromAdmin) {
    return <EmployeeBinDisplayDashboard />;
  }
  return <AdminDashboard />;
}
