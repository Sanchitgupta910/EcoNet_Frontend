// src/components/DashboardHeader.jsx

import React, { useState, useEffect } from 'react';
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
 * For normal Admin users:
 *   - I display the company logo on the left, the company name and branch selector in the center,
 *     and the logged-in user's email with a logout option on the right.
 *
 * For SuperAdmin users:
 *   - I hide the company logo (because it's shown in the SideMenu).
 *   - The center section is empty by default.
 *   - The right side displays an impersonation dropdown listing all impersonable emails
 *     (excluding my own). When I select an email, I fetch that user's details and update the center
 *     to display the impersonated company's name and branch selector.
 *   - An "Exit Impersonation" option resets impersonation without logging me out.
 *
 * Props:
 * - companyName: (Normal Admin) The company name.
 * - companyLogo: (Normal Admin) The company logo URL.
 * - branches: (Normal Admin) Array of branch objects (each with _id and branchName).
 * - userEmail: The logged-in user's email address.
 * - otherEmails: An optional array of emails; if provided, used for impersonation.
 * - isAdmin: Boolean; true if I'm a normal Admin, false if I'm a SuperAdmin.
 */
export default function DashboardHeader({
  companyName,
  companyLogo,
  branches,
  userEmail,
  otherEmails,
  isAdmin
}) {
  // I initialize the selected branch based on provided branches.
  const [selectedBranch, setSelectedBranch] = useState(
    branches && branches.length > 0 ? branches[0]._id : ''
  );
  const [dateFilter, setDateFilter] = useState('today');
  const [isHourlyData, setIsHourlyData] = useState(false);

  // I store impersonation data for SuperAdmin impersonation.
  const [impersonatedData, setImpersonatedData] = useState(null);

  // I maintain a state for impersonable emails.
  const [impersonableEmails, setImpersonableEmails] = useState(otherEmails || []);

  const dispatch = useDispatch();

  /**
   * handleLogout:
   * I send a logout request, clear user data from Redux, and redirect to /login.
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

  /**
   * handleImpersonation:
   * This function is called when I select an email from the impersonation dropdown.
   * If I choose "exit_impersonation", I reset impersonation.
   * Otherwise, I fetch the impersonated user's details using getUserByEmail and update my state.
   *
   * @param {string} email - The email of the user I want to impersonate.
   */
  const handleImpersonation = async (email) => {
    try {
      if (email === 'exit_impersonation') {
        console.log("Exiting impersonation.");
        setImpersonatedData(null);
        return;
      }
      console.log("Impersonating user with email:", email);
      // IMPORTANT: The endpoint returns the user object directly under data.data.
      const response = await axios.get(`/api/v1/users/byEmail?email=${email}`, { withCredentials: true });
      const impersonatedUser = response.data.data;
      console.log("Impersonated user data:", impersonatedUser);
      // I update my impersonation state with the fetched user's company details.
      setImpersonatedData({
        companyName: impersonatedUser.company?.CompanyName || "No Company",
        companyLogo: impersonatedUser.company?.logo || "/placeholder.svg",
        branches: impersonatedUser.company?.branchAddresses || [],
        userEmail: impersonatedUser.email,
      });
    } catch (error) {
      console.error("Error during impersonation:", error);
    }
  };

  // I compute the header values based on my role and impersonation state.
  const headerCompanyName = (!isAdmin && impersonatedData)
    ? impersonatedData.companyName
    : (isAdmin ? companyName : "");
  const headerBranches = (!isAdmin && impersonatedData)
    ? impersonatedData.branches
    : (isAdmin ? branches : []);

  // Whenever headerBranches change, I update the selectedBranch.
  useEffect(() => {
    if (headerBranches && headerBranches.length > 0) {
      setSelectedBranch(headerBranches[0]._id);
    }
  }, [headerBranches]);

  /**
   * For SuperAdmin impersonation:
   * If impersonableEmails is empty, I fetch the list of all users from /api/v1/users/all-users
   * and filter out my own email.
   */
  useEffect(() => {
    if (!isAdmin && impersonableEmails.length === 0) {
      axios.get('/api/v1/users/all-users', { withCredentials: true })
        .then(response => {
          const emails = response.data.data.map(user => user.email);
          const filteredEmails = emails.filter(email => email !== userEmail);
          console.log("Fetched impersonable emails:", filteredEmails);
          setImpersonableEmails(filteredEmails);
        })
        .catch(error => {
          console.error("Failed to fetch impersonable users:", error);
        });
    }
  }, [isAdmin, impersonableEmails, userEmail]);

  return (
    <div className="w-full">
      {/* Top Header Section: I use a flex container split into three equal parts for left, center, and right */}
      <div className="flex justify-between items-center p-2 bg-white shadow-sm">
        {/* Left Section (w-1/3): For normal Admin, display company logo; for SuperAdmin, leave empty */}
        <div className="w-1/3">
          {isAdmin && (
            <img
              src={companyLogo || "/placeholder.svg"}
              alt="Company Logo"
              className="h-8 w-auto"
            />
          )}
        </div>
        {/* Center Section (w-1/3, centered): 
            For normal Admin, display company name and branch selector.
            For SuperAdmin with impersonation active, display impersonated company info and branch selector.
            Otherwise, remain empty.
        */}
        <div className="w-1/3 flex flex-col items-center">
          {((isAdmin) || (!isAdmin && impersonatedData)) && (
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-md">
                {headerCompanyName} {headerCompanyName && " | Branch"}
              </span>
              <div className="flex items-center text-gray-600 hover:text-gray-900 transition-colors font-semibold text-lg">
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="border-none shadow-none bg-transparent p-0 font-semibold">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {headerBranches && headerBranches.map((branch) => (
                      <SelectItem key={branch._id} value={branch._id}>
                        {branch.branchName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ChevronDown size={16} className="ml-1" />
              </div>
            </div>
          )}
        </div>
        {/* Right Section (w-1/3, right aligned):
            For normal Admin, display the user's email with a logout option.
            For SuperAdmin, display an impersonation dropdown.
        */}
        <div className="w-1/3 flex justify-end">
          {isAdmin ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <span>{userEmail}</span>
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {otherEmails && otherEmails.map((email) => (
                  <DropdownMenuItem key={email}>{email}</DropdownMenuItem>
                ))}
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // For SuperAdmin, I show the impersonation dropdown.
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <span>
                    {impersonatedData ? impersonatedData.userEmail : "Impersonate User"}
                  </span>
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {impersonableEmails && impersonableEmails.map((email) => (
                  <DropdownMenuItem key={email} onClick={() => handleImpersonation(email)}>
                    {email}
                  </DropdownMenuItem>
                ))}
                {impersonatedData && (
                  <DropdownMenuItem
                    onClick={() => handleImpersonation('exit_impersonation')}
                    className="text-red-600"
                  >
                    <UserMinus className="mr-2 h-4 w-4" />
                    Exit Impersonation
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Filter Controls Section */}
      <div className="flex justify-center items-center py-4">
        <div className="flex items-center space-x-6 bg-gray-100 rounded-full px-8 py-0">
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
