import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
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
import { AddressForm } from '../components/ui/AddressForm';
import { UserForm } from '../components/ui/UserForm';
import { DustbinForm } from '../components/ui/DustbinForm';

export default function CompanyInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDustbinDialogOpen, setIsDustbinDialogOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const dustbinTypes = ['Landfill','Recycling','Paper','Organic'];
  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await axios.get(`/api/v1/company/${id}`);
        setCompany(response.data.data);
      } catch (error) {
        console.error('Error fetching company details:', error);
      }
    };
    fetchCompanyDetails();
  }, [id]);

  const addOrUpdateAddress = async (addressData) => {
    try {
      if (selectedAddress && selectedAddress.branchName) {
        // Update existing address
        await axios.post('/api/v1/address/updateCompanyAddress', {
          branchName: selectedAddress.branchName,
          ...addressData,
          addressId: selectedAddress._id,
        });
        setCompany((prev) => ({
          ...prev,
          branchAddresses: prev.branchAddresses.map((addr) =>
            addr.branchName === selectedAddress.branchName ? { ...addr, ...addressData } : addr
          ),
        }));
      } else {
        // Add new address
        const response = await axios.post('/api/v1/address/addCompanyAddress', {
          ...addressData,
          associatedCompany: id,
        });
        setCompany((prev) => ({
          ...prev,
          branchAddresses: [...prev.branchAddresses, response.data.data],
        }));
      }
      setSelectedAddress(null); // Clear selected address after operation
    } catch (error) {
      console.error('Error saving address:', error);
    }
    setIsAddressDialogOpen(false);
  };
  const addUser = async (newUser) => {
    try {
      const response = await axios.post('/api/v1/users/register', {
        ...newUser,
        branchAddress: newUser.branchAddress, // Pass branch ID
        company: id, // Pass the company ID
      });
      setCompany((prev) => ({
        ...prev,
        users: [...prev.users, response.data.data],
      }));
    } catch (error) {
      console.error('Error adding user:', error);
      // Handle any validation error response here if needed
    }
    setIsUserDialogOpen(false);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    try {
      // Send the user ID of the selected user to the backend
      await axios.post(`/api/v1/users/deleteuser`, { userId: selectedUser._id });
  
      // Update the company state to filter out the deleted user
      setCompany((prev) => ({
        ...prev,
        users: prev.users.filter((u) => u._id !== selectedUser._id), // Remove user from display
      }));
  
      setSelectedUser(null); // Clear selected user after deletion
    } catch (error) {
      console.error('Error deleting user:', error);
    }
    setIsDeleteDialogOpen(false); // Close the delete confirmation dialog
  };
  

  const handleAddAddress = () => {
    setSelectedAddress(null);
    setIsAddressDialogOpen(true);
  };

  const handleUpdateAddress = (address) => {
    setSelectedAddress(address);
    setIsAddressDialogOpen(true);
  };

  const handleDustbinAdded = () => {
    setIsDustbinDialogOpen(false);
    fetchCompanyDetails();
    
  }

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

  if (!company) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-white">
      <SideMenu />
      <div className="flex-1 p-8 overflow-auto">
        <Button onClick={() => navigate('/companies')} className="mb-6 bg-[#2c7be5] hover:bg-[#1a68d1] text-white">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Companies
        </Button>

        <div className="space-y-6">
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

          {/* Addresses Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Addresses</h2>
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
                  <AddressForm onSubmit={addOrUpdateAddress} initialData={selectedAddress} companyId={id} />
                </DialogContent>
              </Dialog>
            </div>
            {company.branchAddresses && company.branchAddresses.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 mb-4">No addresses added yet.</p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader className="bg-[#f8f8f8] transition-colors">
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

          {/* ******************************************Users Section************************** */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Associated users</h2>
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
                      .filter((user) => !user.isdeleted) // Filter out deleted users
                      .map((user) => (
                        <TableRow key={user._id}>
                          <TableCell className="font-medium">{user.fullName}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.branchAddress?.branchName || "N/A"}</TableCell>
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


            {/* ************************Dustbin section starts********************************************* */}
            
            {/* Dustbins Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Associated bins</h2>
              <Button
                variant="outline"
                onClick={() => setIsDustbinDialogOpen(true)}
                className="bg-[#2c7be5] hover:bg-[#1a68d1] text-white hover:text-white"
              >
                <Plus className="mr-2 h-4 w-4" /> Add bins
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
                    .filter(branch => !branch.isdeleted)
                    .map((branch) => (
                      <React.Fragment key={branch._id}>
                        {(branch.dustbins || []).length > 0 ? (
                          branch.dustbins.map((dustbin, index) => (
                            <TableRow key={`${branch._id}-${dustbin.dustbinType}`}>
                              {index === 0 && (
                                <TableCell rowSpan={(branch.dustbins || []).length} className="font-medium align-top">
                                  {branch.branchName}<br />
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
                              {branch.branchName}<br />
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
          {/* **********************************dustbin section ends here************************ */}

        </div>

            {/* ***********************************add user form************** */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Enter the details for the new user.
              </DialogDescription>
            </DialogHeader>
            <UserForm
              onSubmit={addUser}
              branches={company.branchAddresses.map((a) => ({ id: a._id, name: a.branchName }))}
              companyId={id}
            />
          </DialogContent>
        </Dialog>
        {/* ***********************************add user form ends here************** */}

        {/* ***********************************add dustbin form************** */}

        <Dialog open={isDustbinDialogOpen} onOpenChange={setIsDustbinDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add bins</DialogTitle>
                <DialogDescription>
                  <span className="text-red-600 text-xs font-semibold italic">Note: Adding dustbin will automatically add 4 types of dustbins (Landfill, Recycling, Paper, Organic) for each branch.</span>
                </DialogDescription>
              </DialogHeader>
              <DustbinForm
                branches={company.branchAddresses.map((a) => ({ id: a._id, name: a.branchName }))}
                onDustbinAdded={handleDustbinAdded}
              />
            </DialogContent>
          </Dialog>




        {/* ***********************************add dustbin form ends here************** */}
        

        {/* ***********************************delete dialog************** */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{' '}
                <span className="text-red-600 text-md font-semibold">
                  {selectedAddress ? selectedAddress.branchName : selectedUser?.fullName}
                </span>{' '}
                {selectedAddress ? 'branch' : 'as a user'}? This action cannot be undone.
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
