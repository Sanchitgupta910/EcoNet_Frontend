import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// Import custom UI components
import SideMenu from '../components/layouts/side-menu';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Plus, Trash2, MoreVertical, ArrowLeft } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';

// Import form components for address, user, and dustbin operations
import { AddressForm } from '../components/ui/AddressForm';
import { UserForm } from '../components/ui/UserForm';
import { DustbinForm } from '../components/ui/DustbinForm';

export default function CompanyInfo() {
  // ---------------------- URL Parameters & Navigation ---------------------- //
  const { id } = useParams(); // Get the company ID from the URL
  const navigate = useNavigate(); // Navigation hook to programmatically change routes

  // ---------------------- State Variables ---------------------- //
  const [company, setCompany] = useState(null); // Company details fetched from the backend

  // Dialog visibility states
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDustbinDialogOpen, setIsDustbinDialogOpen] = useState(false);

  // Selected objects for update or deletion operations
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // List of dustbin types (for reference in the UI or forms)
  const dustbinTypes = ['Landfill', 'Recycling', 'Paper', 'Organic'];

  // ---------------------- Data Fetching Function ---------------------- //

  /**
   * Fetch company details from the backend using the company ID.
   * This function is defined using useCallback so it can be reused (e.g. after adding dustbins).
   */
  const fetchCompanyDetails = useCallback(async () => {
    try {
      const response = await axios.get(`/api/v1/company/${id}`);
      setCompany(response.data.data);
    } catch (error) {
      console.error('Error fetching company details:', error);
    }
  }, [id]);

  // Fetch company details when the component mounts or when the company ID changes
  useEffect(() => {
    fetchCompanyDetails();
  }, [fetchCompanyDetails]);

  // ---------------------- Helper: Branch Options ---------------------- //
  /**
   * Compute branch options for forms (used in UserForm and DustbinForm).
   * Returns an array of objects with branch id and name.
   */
  const branchOptions = useMemo(() => {
    return company?.branchAddresses?.map((branch) => ({
      id: branch._id,
      name: branch.branchName,
    })) || [];
  }, [company]);

  // ---------------------- Helper: Get User Branch Name ---------------------- //
  /**
   * Returns the branch name for a user.
   * If the user.branchAddress is an object with a branchName, that is used.
   * Otherwise, if it is an ID, the branchOptions list is searched for a matching branch.
   * @param {Object} user - The user object.
   * @returns {string} - The branch name or "N/A" if not found.
   */
  const getUserBranchName = (user) => {
    if (!user.branchAddress) return "N/A";
    // If branchAddress is an object with a branchName property, use it
    if (typeof user.branchAddress === 'object' && user.branchAddress.branchName) {
      return user.branchAddress.branchName;
    }
    // Otherwise, assume branchAddress is an ID and search in branchOptions
    const branch = branchOptions.find((branch) => branch.id === user.branchAddress);
    return branch ? branch.name : "N/A";
  };

  // ---------------------- Address Operations ---------------------- //

  /**
   * Add a new address or update an existing address.
   * If an address is selected (and has a branchName), update it; otherwise, add a new address.
   * @param {Object} addressData - The form data for the address.
   */
  const addOrUpdateAddress = async (addressData) => {
    try {
      if (selectedAddress && selectedAddress.branchName) {
        // Update existing address
        await axios.post('/api/v1/address/updateCompanyAddress', {
          branchName: selectedAddress.branchName,
          ...addressData,
          addressId: selectedAddress._id,
        });
        // Update the company state by mapping over the existing branch addresses
        setCompany((prev) => ({
          ...prev,
          branchAddresses: prev.branchAddresses.map((addr) =>
            addr.branchName === selectedAddress.branchName ? { ...addr, ...addressData } : addr
          ),
        }));
      } else {
        // Add a new address
        const response = await axios.post('/api/v1/address/addCompanyAddress', {
          ...addressData,
          associatedCompany: id,
        });
        setCompany((prev) => ({
          ...prev,
          branchAddresses: [...prev.branchAddresses, response.data.data],
        }));
      }
      // Clear the selected address after the operation
      setSelectedAddress(null);
    } catch (error) {
      console.error('Error saving address:', error);
    }
    // Close the address dialog regardless of outcome
    setIsAddressDialogOpen(false);
  };

  /**
   * Trigger adding a new address.
   * Clears any selected address and opens the address dialog.
   */
  const handleAddAddress = () => {
    setSelectedAddress(null);
    setIsAddressDialogOpen(true);
  };

  /**
   * Trigger updating an existing address.
   * Sets the selected address and opens the address dialog.
   * @param {Object} address - The address object to update.
   */
  const handleUpdateAddress = (address) => {
    setSelectedAddress(address);
    setIsAddressDialogOpen(true);
  };

  /**
   * Confirm deletion of the selected address.
   * Sends a request to delete the address, then updates the company state.
   */
  const confirmDeleteAddress = async () => {
    try {
      await axios.post(`/api/v1/address/deleteCompanyAddress`, { branchName: selectedAddress.branchName });
      setCompany((prev) => ({
        ...prev,
        branchAddresses: prev.branchAddresses.filter((a) => a.branchName !== selectedAddress.branchName),
      }));
      setSelectedAddress(null);
    } catch (error) {
      console.error('Error deleting address:', error);
    }
    setIsDeleteDialogOpen(false);
  };

  // ---------------------- User Operations ---------------------- //

  /**
   * Add a new user associated with the company.
   * Sends the new user data (including branch and company IDs) to the backend.
   * @param {Object} newUser - The new user data.
   */
  const addUser = async (newUser) => {
    try {
      const response = await axios.post('/api/v1/users/register', {
        ...newUser,
        branchAddress: newUser.branchAddress, // Pass branch ID or object depending on API response
        company: id, // Pass the company ID
      });
      setCompany((prev) => ({
        ...prev,
        users: [...prev.users, response.data.data],
      }));
    } catch (error) {
      console.error('Error adding user:', error);
      // Optionally handle validation errors here
    }
    setIsUserDialogOpen(false);
  };

  /**
   * Prepare deletion of a user.
   * Sets the selected user and opens the delete confirmation dialog.
   * @param {Object} user - The user to be deleted.
   */
  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Confirm deletion of the selected user.
   * Sends a request to delete the user, then updates the company state.
   */
  const confirmDeleteUser = async () => {
    try {
      await axios.post(`/api/v1/users/deleteuser`, { userId: selectedUser._id });
      setCompany((prev) => ({
        ...prev,
        users: prev.users.filter((u) => u._id !== selectedUser._id),
      }));
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
    setIsDeleteDialogOpen(false);
  };

  // ---------------------- Dustbin Operations ---------------------- //

  /**
   * Handle actions after a dustbin is added.
   * Closes the dustbin dialog and refreshes company details.
   */
  const handleDustbinAdded = () => {
    setIsDustbinDialogOpen(false);
    fetchCompanyDetails();
  };

  // ---------------------- Render Loading State ---------------------- //
  if (!company) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // ---------------------- Component Rendering ---------------------- //
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar navigation */}
      <SideMenu />

      <div className="flex-1 p-8 overflow-auto">
        {/* Back Button */}
        <Button onClick={() => navigate('/companies')} className="mb-6 bg-[#2c7be5] hover:bg-[#1a68d1] text-white">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Companies
        </Button>

        <div className="space-y-6">
          {/* Company Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">{company.CompanyName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Domain</Label>
                  <div className="mt-1">{company.domain}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Number of Employees</Label>
                  <div className="mt-1">{company.noofEmployees}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ---------------------- Addresses Section ---------------------- */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Addresses</h2>
              {/* Dialog to add or update an address */}
              <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={handleAddAddress}
                    variant="outline"
                    className="bg-[#2c7be5] hover:bg-[#1a68d1] text-white hover:text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Address
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{selectedAddress ? 'Update Address' : 'Add New Address'}</DialogTitle>
                    <DialogDescription>
                      {selectedAddress
                        ? 'Update the address details.'
                        : 'Enter the details for the new company address.'}
                    </DialogDescription>
                  </DialogHeader>
                  {/* AddressForm component handles the address input fields */}
                  <AddressForm onSubmit={addOrUpdateAddress} initialData={selectedAddress} companyId={id} />
                </DialogContent>
              </Dialog>
            </div>

            {/* Display message if no addresses exist */}
            {company.branchAddresses && company.branchAddresses.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 mb-4">No addresses added yet.</p>
              </div>
            ) : (
              // Table displaying list of addresses
              <div className="border rounded-lg">
                <Table>
                  <TableHeader className="bg-[#f8f8f8]">
                    <TableRow>
                      <TableHead>Branch Name</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Postal Code</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {company.branchAddresses
                      .filter((address) => !address.isdeleted)
                      .map((address) => (
                        <TableRow key={address._id}>
                          <TableCell className="font-medium">{address.branchName}</TableCell>
                          <TableCell>{address.address}</TableCell>
                          <TableCell>{address.city}</TableCell>
                          <TableCell>{address.state}</TableCell>
                          <TableCell>{address.postalCode}</TableCell>
                          <TableCell>{address.country}</TableCell>
                          <TableCell className="text-right">
                            {/* Dropdown menu for address actions (update or delete) */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleUpdateAddress(address)}>
                                  Update
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedAddress(address);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  className="text-red-600"
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

          {/* ---------------------- Users Section ---------------------- */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Associated Users</h2>
              <Button
                variant="outline"
                onClick={() => setIsUserDialogOpen(true)}
                className="bg-[#2c7be5] hover:bg-[#1a68d1] text-white hover:text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Add User
              </Button>
            </div>
            {company.users && company.users.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 mb-4">No users added yet.</p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader className="bg-[#f8f8f8] transition-colors">
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {company.users
                      .filter((user) => !user.isdeleted)
                      .map((user) => (
                        <TableRow key={user._id}>
                          <TableCell className="font-medium">{user.fullName}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          {/* Use helper function to display the correct branch name */}
                          <TableCell>{getUserBranchName(user)}</TableCell>
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

          {/* ---------------------- Dustbins Section ---------------------- */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Associated Bins</h2>
              <Button
                variant="outline"
                onClick={() => setIsDustbinDialogOpen(true)}
                className="bg-[#2c7be5] hover:bg-[#1a68d1] text-white hover:text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Add Bins
              </Button>
            </div>
            {company.branchAddresses && company.branchAddresses.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 mb-4">No branches or dustbins added yet.</p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader className="bg-[#f8f8f8] transition-colors">
                    <TableRow>
                      <TableHead>Branch Address</TableHead>
                      <TableHead>Bin Type</TableHead>
                      <TableHead>Capacity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {company.branchAddresses
                      .filter((branch) => !branch.isdeleted)
                      .map((branch) => (
                        <React.Fragment key={branch._id}>
                          {(branch.dustbins || []).length > 0 ? (
                            branch.dustbins.map((dustbin, index) => (
                              <TableRow key={`${branch._id}-${dustbin.dustbinType}`}>
                                {index === 0 && (
                                  <TableCell rowSpan={branch.dustbins.length} className="font-medium align-top">
                                    {branch.branchName}
                                    <br />
                                    {branch.address}, {branch.city}, {branch.state} {branch.postalCode}
                                  </TableCell>
                                )}
                                <TableCell>{dustbin.dustbinType}</TableCell>
                                <TableCell>{dustbin.binCapacity}L</TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell className="font-medium align-top">
                                {branch.branchName}
                                <br />
                                {branch.address}, {branch.city}, {branch.state} {branch.postalCode}
                              </TableCell>
                              <TableCell colSpan={2} className="text-center text-gray-500 italic">
                                No bins available for this branch
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

        {/* ---------------------- Dialogs Section ---------------------- */}

        {/* Add User Dialog */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Enter the details for the new user.</DialogDescription>
            </DialogHeader>
            <UserForm
              onSubmit={addUser}
              branches={branchOptions}
              companyId={id}
            />
          </DialogContent>
        </Dialog>

        {/* Add Dustbin Dialog */}
        <Dialog open={isDustbinDialogOpen} onOpenChange={setIsDustbinDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Bins</DialogTitle>
              <DialogDescription>
                <span className="text-red-600 text-xs font-semibold italic">
                  Note: Adding bins will automatically add 4 types of bins (Landfill, Recycling, Paper, Organic) to the branch.
                </span>
              </DialogDescription>
            </DialogHeader>
            <DustbinForm
              branches={branchOptions}
              onDustbinAdded={handleDustbinAdded}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog (used for both address and user deletion) */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{' '}
                <span className="text-red-600 text-md font-semibold">
                  {selectedAddress ? selectedAddress.branchName : selectedUser?.fullName}
                </span>{' '}
                {selectedAddress ? 'branch' : 'user'}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={selectedAddress ? confirmDeleteAddress : confirmDeleteUser}
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
