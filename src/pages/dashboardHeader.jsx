import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button.jsx";
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs.jsx";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  subYears
} from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../components/ui/select.jsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../components/ui/dropdown-menu.jsx";
import { ChevronDown, LogOut, CalendarIcon } from 'lucide-react';
import { Calendar } from "../components/ui/calendar.jsx";
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { clearUser } from '../app/userSlice.js';

export default function DashboardHeader({
  companyName,
  companyLogo,
  branches,
  userEmail,
  otherEmails,
  isAdmin
}) {
  // initialize the selected branch using the first branch available (if any)
  const [selectedBranch, setSelectedBranch] = useState(
    branches && branches.length > 0 ? branches[0]._id : ''
  );

  // store the date range state for filtering, defaulting both from and to to today
  const [dateRange, setDateRange] = useState({ from: new Date(), to: new Date() });
  const [dateFilter, setDateFilter] = useState('today');
  const [isHourlyData, setIsHourlyData] = useState(false);

  // update the date range automatically based on the selected filter.
  // For a custom range, I let the user pick without overriding the current selection.
  useEffect(() => {
    updateDateRange(dateFilter);
  }, [dateFilter]);

  const updateDateRange = (filter) => {
    if (filter === 'custom') return; // I allow manual selection for custom range

    const today = new Date();
    let from, to;
    switch (filter) {
      case 'today':
        from = to = today;
        break;
      case 'last-week':
        from = startOfWeek(today);
        to = endOfWeek(today);
        break;
      case 'last-month': {
        const previousMonth = subMonths(today, 1);
        from = startOfMonth(previousMonth);
        to = endOfMonth(previousMonth);
        break;
      }
      case 'last-6-months':
        from = subMonths(today, 6);
        to = today;
        break;
      case 'last-year':
        from = subYears(today, 1);
        to = today;
        break;
      default:
        from = to = today;
    }
    setDateRange({ from, to });
  };

  // format the date range for display. If both dates are the same, I show one date.
  const formatDateRange = (from, to) => {
    if (from.toDateString() === to.toDateString()) {
      return format(from, 'dd MMM yy');
    }
    return `${format(from, 'dd MMM yy')} - ${format(to, 'dd MMM yy')}`;
  };

  // store impersonation data when a SuperAdmin chooses to impersonate a user.
  const [impersonatedData, setImpersonatedData] = useState(null);

  // maintain impersonable emails for SuperAdmin impersonation.
  const [impersonableEmails, setImpersonableEmails] = useState(otherEmails || []);

  const dispatch = useDispatch();

  // handle logout by sending a logout request, clearing Redux state, and redirecting to the login page.
  const handleLogout = async () => {
    try {
      await axios.post('/api/v1/users/logout', {}, { withCredentials: true });
      dispatch(clearUser());
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // manage impersonation actions. If the email equals "exit_impersonation",
  // reset impersonation; otherwise, I fetch and store the impersonated user's data.
  const handleImpersonation = async (email) => {
    try {
      if (email === 'exit_impersonation') {
        console.log("Exiting impersonation.");
        setImpersonatedData(null);
        return;
      }
      console.log("Impersonating user with email:", email);
      const response = await axios.get(`/api/v1/users/byEmail?email=${email}`, { withCredentials: true });
      const impersonatedUser = response.data.data;
      console.log("Impersonated user data:", impersonatedUser);
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

  // compute header values based on my role or any active impersonation
  const headerCompanyName = isAdmin ? companyName : (impersonatedData ? impersonatedData.companyName : "");
  const headerBranches = isAdmin ? branches : (impersonatedData ? impersonatedData.branches : []);

  // update the default selected branch when headerBranches changes.
  useEffect(() => {
    if (headerBranches && headerBranches.length > 0) {
      setSelectedBranch(headerBranches[0]._id);
    }
  }, [headerBranches]);

  // fetch impersonable emails for SuperAdmin if none are provided.
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
      {/* render the top header with three sections:
          - Left: Company logo (for Admin)
          - Center: Company name and branch selector (if applicable)
          - Right: User info (or impersonation options for SuperAdmin) */}
      <div className="flex justify-between items-center p-2 bg-white shadow-sm">
        {/* Left Section: I display the company logo for Admin users */}
        <div className="w-1/3">
          {isAdmin && (
            <img
              src={companyLogo || "/placeholder.svg"}
              alt="Company Logo"
              className="h-8 w-auto"
            />
          )}
        </div>
        {/* Center Section: show the company name and branch selector when available */}
        <div className="w-1/3 flex flex-col items-center">
          {(isAdmin || (!isAdmin && impersonatedData)) && (
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
              </div>
            </div>
          )}
        </div>
        {/* Right Section: Avatar dropdown with logout (Admin) or impersonation options (SuperAdmin) */}
        <div className="w-1/3 flex justify-end items-center space-x-2">
          {isAdmin ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {/* <Button variant="ghost" className="flex items-center space-x-2">
                  <span>{userEmail}</span>
                  <ChevronDown size={16} />
                </Button> */}
                <Avatar className="cursor-pointer w-8 h-8">
                  <AvatarImage
                    src="https://cdn.jsdelivr.net/gh/alohe/avatars/png/upstream_17.png"
                    alt="User Avatar"
                  />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {otherEmails && otherEmails.map((email) => (
                  <DropdownMenuItem key={email}>{email}</DropdownMenuItem>
                ))}
                <DropdownMenuItem disabled className="text-gray-800">
                  {userEmail}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              {impersonatedData && (
                <Button
                  variant="netnada_blue"
                  onClick={() => handleImpersonation('exit_impersonation')}
                  className="text-blue-600"
                >
                  Exit Impersonation
                </Button>
              )}
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
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* render filter controls for date range and view type (daily/hourly)
          when only SuperAdmin or impersonation is active */}


      {(!isAdmin || impersonatedData) && (
      
        <div className="flex justify-center items-center py-4 space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDateRange(dateRange.from, dateRange.to)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="last-week">Last Week</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                  <SelectItem value="last-year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              {dateFilter === 'custom' && (
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  className="rounded-md border"
                />
              )}
            </PopoverContent>
          </Popover>

          <Tabs value={isHourlyData ? "hourly" : "daily"} onValueChange={(value) => setIsHourlyData(value === "hourly")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="hourly">Hourly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}
    </div>
  );
}
