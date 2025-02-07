// src/components/DashboardHeader.jsx

import React, { useState } from 'react';
import { Button } from "../components/ui/button.jsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../components/ui/select.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../components/ui/dropdown-menu.jsx";
import { Switch } from "../components/ui/switch.jsx";
import { ChevronDown, LogOut, UserMinus, Calendar, Clock } from 'lucide-react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { clearUser } from '../app/userSlice.js';

/**
 * DashboardHeader displays the top header of the dashboard.
 *
 * Props:
 * - companyName: Name of the company.
 * - companyLogo: URL of the company logo.
 * - branches: Array of branch objects (each with at least _id and branchName).
 * - userEmail: The logged-in user's email address.
 * - otherEmails: An array of other associated emails.
 * - isAdmin: Boolean indicating if the user is a normal Admin (true) or a SuperAdmin (false).
 *
 * The component renders:
 * - The company logo and name.
 * - A branch selector (populated with the provided branches).
 *   The default selected branch is set to the first branch in the array.
 * - A dropdown menu that shows the user's email and allows for logout or exit impersonation.
 * - Additional filter controls (date range and a switch between Daily/Hourly views).
 */
export default function DashboardHeader({
  companyName,
  companyLogo,
  branches,
  userEmail,
  otherEmails,
  isAdmin
}) {
  // Initialize state for the selected branch.
  // We assume that the first branch in the list is the one the user is assigned to.
  const [selectedBranch, setSelectedBranch] = useState(
    branches && branches.length > 0 ? branches[0]._id : ''
  );
  // State for date filter (default: "last-week")
  const [dateFilter, setDateFilter] = useState('today');
  // State to determine whether to show hourly data (false means "Daily" is active)
  const [isHourlyData, setIsHourlyData] = useState(false);

  // Get Redux dispatch function for logout action.
  const dispatch = useDispatch();

  /**
   * handleLogout:
   * - Sends a POST request to the backend to log out the user.
   * - Dispatches the clearUser action to clear the user data from Redux.
   * - Redirects the user to the /login page.
   */
  const handleLogout = async () => {
    try {
      await axios.post('/api/v1/users/logout', {}, { withCredentials: true });
      dispatch(clearUser());
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="w-full">
      {/* Top Header: Company Info and User Dropdown */}
      <div className="flex justify-between items-center p-2 bg-white shadow-sm">
        {/* Company Logo */}
        <img
          src={companyLogo || "/placeholder.svg"}
          alt="Company Logo"
          className="h-8 w-auto"
        />
        
        {/* Company Name and Branch Selector */}
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-md">{companyName} | Branch </span>
          <div className="flex items-center text-gray-600 hover:text-gray-900 transition-colors font-semibold text-lg">
            {/* Branch Selector */}
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="border-none shadow-none bg-transparent p-0 font-semibold">
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                {branches && branches.map((branch) => (
                  <SelectItem key={branch._id} value={branch._id}>
                    {branch.branchName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* <ChevronDown size={16} className="ml-1" /> */}
          </div>
        </div>
        
        {/* User Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-2">
              <span>{userEmail}</span>
              <ChevronDown size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* List any other emails if available */}
            {otherEmails && otherEmails.map((email) => (
              <DropdownMenuItem key={email}>{email}</DropdownMenuItem>
            ))}
            {/* Logout or Exit Impersonation Option */}
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              {isAdmin ? (
                <>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </>
              ) : (
                <>
                  <UserMinus className="mr-2 h-4 w-4" />
                  Exit Impersonation
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filter Controls Section */}
      <div className="flex justify-center items-center py-4">
        <div className="flex items-center space-x-6 bg-gray-100 rounded-full px-8 py-0">
          {/* Date Range Selector */}
          <div className="flex items-center space-x-2">
            <Calendar size={18} className="text-gray-500" />
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="border-none shadow-none bg-transparent p-0">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="last-week">Last Week</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Daily/Hourly Data Toggle */}
          <div className="flex items-center space-x-2">
            <Clock size={18} className="text-gray-500" />
            <span className={`text-sm ${isHourlyData ? 'text-gray-400' : 'text-gray-900'}`}>Daily</span>
            <Switch
              checked={isHourlyData}
              onCheckedChange={setIsHourlyData}
              className="data-[state=checked]:bg-blue-600"
            />
            <span className={`text-sm ${isHourlyData ? 'text-gray-900' : 'text-gray-400'}`}>Hourly</span>
          </div>
        </div>
      </div>
    </div>
  );
}
