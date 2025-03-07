"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

// Custom UI components and icons
import SideMenu from "../components/layouts/SideMenu";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader,
} from "../components/ui/Table";
import {
  Building2,
  Globe,
  Users,
  UserCog,
  Trash2,
  Plus,
  MoreVertical,
  ArrowLeft,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/DropdownMenu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/Tooltip";

// Import form components for address, user, and dustbin operations
import { AddressForm } from "../components/ui/AddressForm";
import { UserForm } from "../components/ui/UserForm";
import { DustbinForm } from "../components/ui/DustbinForm";

export default function CompanyInfo() {
  // Retrieve company ID from URL parameters
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);

  // Dialog state variables
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDustbinDialogOpen, setIsDustbinDialogOpen] = useState(false);

  // Selected items for update or deletion
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // List of dustbin types (for forms if needed)
  const dustbinTypes = [
    "General Waste",
    "Commingled",
    "Organics",
    "Paper & Cardboard",
  ];

  /**
   * Fetch company details from the API.
   */
  const fetchCompanyDetails = useCallback(async () => {
    try {
      const response = await axios.get(`/api/v1/company/${id}`);
      setCompany(response.data.data);
    } catch (error) {
      console.error("Error fetching company details:", error);
    }
  }, [id]);

  useEffect(() => {
    fetchCompanyDetails();
  }, [fetchCompanyDetails]);

  /**
   * Compute branch options for form dropdowns.
   */
  const branchOptions = useMemo(() => {
    return (
      company?.branchAddresses?.map((branch) => ({
        id: branch._id,
        name: branch.officeName, // Using officeName for consistency
      })) || []
    );
  }, [company]);

  /**
   * Helper function to get the office name for a given user.
   * @param {Object} user - User object.
   * @returns {String} - Office name or "N/A".
   */
  const getUserOfficeName = (user) => {
    if (!user.branchAddress) return "N/A";
    if (
      typeof user.branchAddress === "object" &&
      user.branchAddress.officeName
    ) {
      return user.branchAddress.officeName;
    }
    const branch = branchOptions.find(
      (branch) => branch.id === user.branchAddress
    );
    return branch ? branch.name : "N/A";
  };

  // ---------------------- Count Functions ---------------------- //

  /**
   * Count the number of admin users.
   */
  const countAdminUsers = () => {
    const adminRoles = [
      "SuperAdmin",
      "RegionalAdmin",
      "CountryAdmin",
      "CityAdmin",
      "OfficeAdmin",
      "EmployeeDashboardUser",
      "BinDisplayUser",
    ];
    return (
      company?.users?.filter((u) => adminRoles.includes(u.role)).length || 0
    );
  };

  /**
   * Count the number of office locations.
   */
  const countOfficeLocations = () => {
    return company?.branchAddresses?.length || 0;
  };

  /**
   * Count the total number of waste bins by summing bins across branches.
   */
  const countWasteBins = () => {
    return (
      company?.branchAddresses?.reduce((acc, branch) => {
        return acc + (branch.dustbins ? branch.dustbins.length : 0);
      }, 0) || 0
    );
  };

  // ---------------------- Address Operations ---------------------- //

  /**
   * Add or update an office address.
   * @param {Object} addressData - Address details from the form.
   */
  const addOrUpdateAddress = async (addressData) => {
    try {
      if (selectedAddress && selectedAddress.officeName) {
        await axios.post("/api/v1/address/updateCompanyAddress", {
          officeName: selectedAddress.officeName,
          ...addressData,
          addressId: selectedAddress._id,
        });
        setCompany((prev) => ({
          ...prev,
          branchAddresses: prev.branchAddresses.map((addr) =>
            addr.officeName === selectedAddress.officeName
              ? { ...addr, ...addressData }
              : addr
          ),
        }));
      } else {
        const response = await axios.post("/api/v1/address/addCompanyAddress", {
          ...addressData,
          associatedCompany: id,
        });
        setCompany((prev) => ({
          ...prev,
          branchAddresses: [...prev.branchAddresses, response.data.data],
        }));
      }
      setSelectedAddress(null);
    } catch (error) {
      console.error("Error saving address:", error);
    }
    setIsAddressDialogOpen(false);
  };

  // ---------------------- User Operations ---------------------- //

  /**
   * Add a new user (admin) to the company.
   * @param {Object} newUser - New user details.
   */
  const addUser = async (newUser) => {
    try {
      const response = await axios.post("/api/v1/users/register", {
        ...newUser,
        branchAddress: newUser.branchAddress,
        company: id,
      });
      setCompany((prev) => ({
        ...prev,
        users: [...prev.users, response.data.data],
      }));
    } catch (error) {
      console.error("Error adding user:", error);
    }
    setIsUserDialogOpen(false);
  };

  /**
   * Delete a user after confirmation.
   */
  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    try {
      await axios.post(`/api/v1/users/deleteuser`, {
        userId: selectedUser._id,
      });
      setCompany((prev) => ({
        ...prev,
        users: prev.users.filter((u) => u._id !== selectedUser._id),
      }));
      setSelectedUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
    setIsDeleteDialogOpen(false);
  };

  // ---------------------- Dustbin Operations ---------------------- //

  const handleDustbinAdded = () => {
    setIsDustbinDialogOpen(false);
    fetchCompanyDetails();
  };

  /**
   * A reusable component to display statistics.
   */
  function StatItem({ icon, label, value }) {
    return (
      <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
        <div className="mb-2">{icon}</div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    );
  }

  // ---------------------- Render Loading State ---------------------- //

  if (!company) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // ---------------------- Component Rendering ---------------------- //
  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <SideMenu />

      <div className="flex-1 p-8 overflow-auto space-y-8">
        <Button
          onClick={() => navigate("/companies")}
          className="mb-6 bg-primary hover:bg-primary/90 text-white rounded-full px-4 shadow-sm transition-all"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Companies
        </Button>

        <div className="space-y-6">
          {/* Company Details Card */}
          <Card className="w-full my-6 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-8">
              <CardTitle className="text-3xl font-bold tracking-tight">
                {company.CompanyName}
              </CardTitle>
              <div className="flex items-center text-muted-foreground mt-2">
                <Globe className="h-4 w-4 mr-2" />
                <span>{company.domain}</span>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <StatItem
                  icon={<Users className="h-5 w-5 text-blue-500" />}
                  label="Employees"
                  value={company.noofEmployees}
                />
                <StatItem
                  icon={<UserCog className="h-5 w-5 text-indigo-500" />}
                  label="Admins"
                  value={countAdminUsers()}
                />
                <StatItem
                  icon={<Building2 className="h-5 w-5 text-emerald-500" />}
                  label="Office Locations"
                  value={countOfficeLocations()}
                />
                <StatItem
                  icon={<Trash2 className="h-5 w-5 text-amber-500" />}
                  label="Waste Bins"
                  value={countWasteBins()}
                />
              </div>
            </CardContent>
          </Card>

          {/* Office Locations Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                <Building2 className="mr-2 h-5 w-5 text-primary" /> Office
                Locations
              </h2>
              <Dialog
                open={isAddressDialogOpen}
                onOpenChange={setIsAddressDialogOpen}
              >
                <DialogTrigger>
                  <Button
                    onClick={() => {
                      setSelectedAddress(null);
                      setIsAddressDialogOpen(true);
                    }}
                    variant="outline"
                    className="bg-primary hover:bg-primary/90 text-white rounded-full px-4 shadow-sm transition-all"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Address
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white rounded-lg shadow-lg max-w-md mx-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedAddress ? "Update Address" : "Add New Address"}
                    </DialogTitle>
                    <DialogDescription>
                      {selectedAddress
                        ? "Update the address details."
                        : "Enter the details for the new office location."}
                    </DialogDescription>
                  </DialogHeader>
                  <AddressForm
                    onSubmit={addOrUpdateAddress}
                    initialData={selectedAddress}
                    companyId={id}
                  />
                </DialogContent>
              </Dialog>
            </div>

            {company.branchAddresses && company.branchAddresses.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-slate-100">
                <p className="text-slate-500 mb-4">
                  No office locations added yet.
                </p>
              </div>
            ) : (
              <div className="border bg-white rounded-lg shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-medium text-slate-700">
                        Office Name
                      </TableHead>
                      <TableHead className="font-medium text-slate-700">
                        Address
                      </TableHead>
                      <TableHead className="font-medium text-slate-700">
                        City
                      </TableHead>
                      <TableHead className="font-medium text-slate-700">
                        Subdivison
                      </TableHead>
                      <TableHead className="font-medium text-slate-700">
                        Postal Code
                      </TableHead>
                      <TableHead className="font-medium text-slate-700">
                        Country
                      </TableHead>
                      <TableHead className="text-right font-medium text-slate-700">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {company.branchAddresses
                      .filter((address) => !address.isdeleted)
                      .map((address) => (
                        <TableRow
                          key={address._id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <TableCell className="font-medium">
                            {address.officeName}
                          </TableCell>
                          <TableCell>{address.address}</TableCell>
                          <TableCell>{address.city}</TableCell>
                          <TableCell>
                            <span className="font-bold text-slate-500">
                              {address.subdivisionType}:
                            </span>{" "}
                            {address.subdivision}
                          </TableCell>
                          <TableCell>{address.postalCode}</TableCell>
                          <TableCell>{address.country}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="w-36 shadow-lg rounded-md border-slate-200"
                              >
                                <DropdownMenuItem
                                  onClick={() => setSelectedAddress(address)}
                                  className="cursor-pointer hover:bg-slate-50"
                                >
                                  <span className="text-slate-700">Update</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedAddress(address);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  className="text-red-600 cursor-pointer hover:bg-red-50"
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Admin Users Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                <UserCog className="mr-2 h-5 w-5 text-primary" /> Admin Users
              </h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="outline"
                      onClick={() => setIsUserDialogOpen(true)}
                      className="bg-primary hover:bg-primary/90 text-white rounded-full px-4 shadow-sm transition-all"
                      disabled={
                        !company.branchAddresses ||
                        company.branchAddresses.length === 0
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Admin User
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Please add office location first</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {company.users && company.users.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-slate-100">
                <p className="text-slate-500 mb-4">No users added yet.</p>
              </div>
            ) : (
              <div className="border bg-white rounded-lg shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-medium text-slate-700">
                        Full Name
                      </TableHead>
                      <TableHead className="font-medium text-slate-700">
                        Email
                      </TableHead>
                      <TableHead className="font-medium text-slate-700">
                        Office
                      </TableHead>
                      <TableHead className="font-medium text-slate-700">
                        Role
                      </TableHead>
                      <TableHead className="text-right font-medium text-slate-700">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {company.users
                      .filter((user) => !user.isdeleted)
                      .map((user) => (
                        <TableRow
                          key={user._id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <TableCell className="font-medium">
                            {user.fullName}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{getUserOfficeName(user)}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Waste Bins Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center">
                <Trash2 className="mr-2 h-5 w-5 text-primary" /> Waste Bins
              </h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="outline"
                      onClick={() => setIsDustbinDialogOpen(true)}
                      className="bg-primary hover:bg-primary/90 text-white rounded-full px-4 shadow-sm transition-all"
                      disabled={
                        !company.branchAddresses ||
                        company.branchAddresses.length === 0
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Bins
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Please add office location first</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {company.branchAddresses && company.branchAddresses.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-slate-100">
                <p className="text-gray-500 mb-4">
                  No office locations or waste bins added yet.
                </p>
              </div>
            ) : (
              <div className="border bg-white rounded-lg shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="font-medium text-slate-700">
                        Office Location
                      </TableHead>
                      <TableHead className="font-medium text-slate-700">
                        Bin Type
                      </TableHead>
                      <TableHead className="font-medium text-slate-700">
                        Capacity
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {company.branchAddresses
                      .filter((branch) => !branch.isdeleted)
                      .map((branch) => (
                        <React.Fragment key={branch._id}>
                          {(branch.dustbins || []).length > 0 ? (
                            branch.dustbins.map((dustbin, index) => (
                              <TableRow
                                key={`${branch._id}-${dustbin.dustbinType}`}
                                className="hover:bg-slate-50 transition-colors"
                              >
                                {index === 0 && (
                                  <TableCell
                                    rowSpan={branch.dustbins.length}
                                    className="font-medium align-top"
                                  >
                                    {branch.officeName}
                                    <br />
                                    {branch.address}, {branch.city},{" "}
                                    {branch.region} {branch.postalCode}
                                  </TableCell>
                                )}
                                <TableCell>{dustbin.dustbinType}</TableCell>
                                <TableCell>{dustbin.binCapacity}L</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow className="hover:bg-slate-50 transition-colors">
                              <TableCell className="font-medium align-top">
                                {branch.officeName}
                                <br />
                                {branch.address}, {branch.city}, {branch.region}{" "}
                                {branch.postalCode}
                              </TableCell>
                              <TableCell
                                colSpan={2}
                                className="text-center text-gray-500 italic"
                              >
                                No bins available for this office location
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        {/* Dialogs Section */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent className="bg-white rounded-lg shadow-lg max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>Add New Admin User</DialogTitle>
              <DialogDescription>
                Enter the details for the new user.
              </DialogDescription>
            </DialogHeader>
            <UserForm
              onSubmit={addUser}
              branches={branchOptions}
              companyId={id}
            />
          </DialogContent>
        </Dialog>

        <Dialog
          open={isDustbinDialogOpen}
          onOpenChange={setIsDustbinDialogOpen}
        >
          <DialogContent className="bg-white rounded-lg shadow-lg max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>Add Bins</DialogTitle>
              <DialogDescription>
                <span className="text-red-600 text-xs font-semibold italic">
                  Note: Adding bins will automatically add 4 types of bins
                  (Landfill, Recycling, Paper, Organic) to the office.
                </span>
              </DialogDescription>
            </DialogHeader>
            <DustbinForm
              branches={branchOptions}
              onDustbinAdded={handleDustbinAdded}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-white rounded-lg shadow-lg max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{" "}
                <span className="text-red-600 text-md font-semibold">
                  {selectedAddress
                    ? selectedAddress.officeName
                    : selectedUser?.fullName}
                </span>{" "}
                {selectedAddress ? "office location" : "user"}? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={
                  selectedAddress ? confirmDeleteAddress : confirmDeleteUser
                }
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
