import React, { useState, useEffect } from "react";
import { Button } from "../ui/Button.jsx";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/Avatar.jsx";
import { Tabs, TabsList, TabsTrigger } from "../ui/Tabs.jsx";
import { ChevronDown, LogOut, CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/Calendar.jsx";
import axios from "axios";
import { useDispatch } from "react-redux";
import { clearUser } from "../../app/userSlice.js";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  subYears,
} from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/Select.jsx";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover.jsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/DropdownMenu.jsx";

export default function DashboardHeader({
  companyName,
  companyLogo,
  branches,
  userEmail,
  otherEmails,
  isAdmin,
  onBranchChange,
}) {
  // Initialize the selected branch (if available)
  const [selectedBranch, setSelectedBranch] = useState(
    branches && branches.length > 0 ? branches[0]._id : ""
  );

  // State for date range filtering (for SuperAdmin or impersonation)
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date(),
  });
  const [dateFilter, setDateFilter] = useState("today");
  const [isHourlyData, setIsHourlyData] = useState(false);

  // Update date range automatically when the filter changes.
  useEffect(() => {
    updateDateRange(dateFilter);
  }, [dateFilter]);

  const updateDateRange = (filter) => {
    if (filter === "custom") return; // Allow manual selection for custom range
    const today = new Date();
    let from, to;
    switch (filter) {
      case "today":
        from = to = today;
        break;
      case "last-week":
        from = startOfWeek(today);
        to = endOfWeek(today);
        break;
      case "last-month": {
        const previousMonth = subMonths(today, 1);
        from = startOfMonth(previousMonth);
        to = endOfMonth(previousMonth);
        break;
      }
      case "last-6-months":
        from = subMonths(today, 6);
        to = today;
        break;
      case "last-year":
        from = subYears(today, 1);
        to = today;
        break;
      default:
        from = to = today;
    }
    setDateRange({ from, to });
  };

  // Format date range display
  const formatDateRange = (from, to) => {
    if (from.toDateString() === to.toDateString()) {
      return format(from, "dd MMM yy");
    }
    return `${format(from, "dd MMM yy")} - ${format(to, "dd MMM yy")}`;
  };

  // For SuperAdmin impersonation
  const [impersonatedData, setImpersonatedData] = useState(null);
  const [impersonableEmails, setImpersonableEmails] = useState(
    otherEmails || []
  );

  const dispatch = useDispatch();

  // Logout handler: calls API, clears Redux state, and redirects
  const handleLogout = async () => {
    try {
      await axios.post("/api/v1/users/logout", {}, { withCredentials: true });
      dispatch(clearUser());
      window.location.href = "/login";
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Handle impersonation: either fetch user data or exit impersonation mode
  const handleImpersonation = async (email) => {
    try {
      if (email === "exit_impersonation") {
        setImpersonatedData(null);
        return;
      }
      const response = await axios.get(`/api/v1/users/byEmail?email=${email}`, {
        withCredentials: true,
      });
      const impersonatedUser = response.data.data;
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

  // Compute header values based on role or active impersonation.
  const headerCompanyName = isAdmin
    ? companyName
    : impersonatedData
    ? impersonatedData.companyName
    : "";
  const headerBranches = isAdmin
    ? branches
    : impersonatedData
    ? impersonatedData.branches
    : [];

  // Effect to initialize or update the selected branch only if the current branch is not valid.
  useEffect(() => {
    if (headerBranches && headerBranches.length > 0) {
      // Check if the current selectedBranch is still in headerBranches.
      const branchExists = headerBranches.some(
        (branch) => branch._id === selectedBranch
      );
      if (!branchExists) {
        const initialBranch = headerBranches[0]._id;
        setSelectedBranch(initialBranch);
        onBranchChange && onBranchChange(initialBranch);
      }
    }
  }, [headerBranches, onBranchChange, selectedBranch]);

  // for superadmin, fetch impersonable emails if not provided.
  useEffect(() => {
    if (!isAdmin && impersonableEmails.length === 0) {
      axios
        .get("/api/v1/users/all-users", { withCredentials: true })
        .then((response) => {
          const emails = response.data.data.map((user) => user.email);
          const filteredEmails = emails.filter((email) => email !== userEmail);
          setImpersonableEmails(filteredEmails);
        })
        .catch((error) => {
          console.error("Failed to fetch impersonable users:", error);
        });
    }
  }, [isAdmin, impersonableEmails, userEmail]);

  return (
    <div className="w-full">
      {/* Top Header: Three sections (Left, Center, Right) */}
      <div className="flex justify-between items-center p-2 bg-white shadow-sm">
        {/* Left: Display company logo only for Admin */}
        <div className="w-1/3">
          {isAdmin && (
            <img
              src={companyLogo || "/placeholder.svg"}
              alt="Company Logo"
              className="h-8 w-auto"
            />
          )}
        </div>
        {/* Center: Company name and branch selector */}
        <div className="w-1/3 flex flex-col items-center">
          {(isAdmin || (!isAdmin && impersonatedData)) && (
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-md">
                {headerCompanyName} {headerCompanyName && " | Branch"}
              </span>
              <div className="flex items-center text-gray-600 transition-colors font-semibold text-lg">
                <Select
                  value={selectedBranch}
                  onValueChange={(value) => {
                    setSelectedBranch(value);
                    onBranchChange && onBranchChange(value);
                  }}
                >
                  <SelectTrigger className="border-none shadow-none bg-transparent p-0 font-semibold">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {headerBranches &&
                      headerBranches.map((branch) => (
                        <SelectItem key={branch._id} value={branch._id}>
                          {branch.officeName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        {/* Right: Display Avatar with dropdown for logout */}
        <div className="w-1/3 flex justify-end items-center">
          {isAdmin ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer w-8 h-8">
                  <AvatarImage
                    src="https://cdn.jsdelivr.net/gh/alohe/avatars/png/upstream_17.png"
                    alt="User Avatar"
                  />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem disabled className="text-gray-800">
                  {userEmail}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
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
                  onClick={() => handleImpersonation("exit_impersonation")}
                  className="text-blue-600"
                >
                  Exit Impersonation
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center space-x-2"
                  >
                    <span>
                      {impersonatedData
                        ? impersonatedData.userEmail
                        : "Impersonate User"}
                    </span>
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {impersonableEmails &&
                    impersonableEmails.map((email) => (
                      <DropdownMenuItem
                        key={email}
                        onClick={() => handleImpersonation(email)}
                      >
                        {email}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {/* Optional filter controls for date range and view type */}
      {(!isAdmin || impersonatedData) && (
        <div className="flex justify-center items-center py-4 space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[280px] justify-start text-left font-normal"
              >
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
              {dateFilter === "custom" && (
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

          <Tabs
            value={isHourlyData ? "hourly" : "daily"}
            onValueChange={(value) => setIsHourlyData(value === "hourly")}
          >
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
