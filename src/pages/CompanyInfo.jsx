// 'use client';

// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import axios from 'axios';

// // Custom UI components and icons
// import SideMenu from '../components/layouts/SideMenu';
// import { Button } from '../components/ui/Button';
// import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableRow,
//   TableHeader,
// } from '../components/ui/Table';
// import {
//   Building2,
//   Globe,
//   Users,
//   UserCog,
//   Trash2,
//   Plus,
//   Search,
//   Home,
//   UserPlus,
// } from 'lucide-react';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '../components/ui/Dialog';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/Tooltip';
// import { Input } from '../components/ui/Input';
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbSeparator,
// } from '../components/ui/Breadcrumb';

// // Import form components for address, user, and dustbin operations
// import { AddressForm } from '../components/ui/AddressForm';
// import { UserForm } from '../components/ui/UserForm';
// import { AddBinsForm } from '/src/components/ui/DustbinForm.jsx';

// export default function CompanyInfo() {
//   // Retrieve company ID from URL parameters
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [company, setCompany] = useState(null);
//   const [searchLocations, setSearchLocations] = useState('');
//   const [searchUsers, setSearchUsers] = useState('');

//   // Dialog state variables
//   const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
//   const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
//   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
//   const [isDustbinDialogOpen, setIsDustbinDialogOpen] = useState(false);

//   // Selected items for update or deletion
//   const [selectedAddress, setSelectedAddress] = useState(null);
//   const [selectedUser, setSelectedUser] = useState(null);

//   // List of dustbin types (for forms if needed)
//   const dustbinTypes = ['General Waste', 'Commingled', 'Organics', 'Paper & Cardboard'];

//   /**
//    * Fetch company details from the API.
//    */
//   const fetchCompanyDetails = useCallback(async () => {
//     try {
//       const response = await axios.get(`/api/v1/company/${id}`);
//       setCompany(response.data.data);
//     } catch (error) {
//       console.error('Error fetching company details:', error);
//     }
//   }, [id]);

//   useEffect(() => {
//     fetchCompanyDetails();
//   }, [fetchCompanyDetails]);

//   /**
//    * Compute branch options for form dropdowns.
//    */
//   const branchOptions = useMemo(() => {
//     return (
//       company?.branchAddresses?.map((branch) => ({
//         id: branch._id,
//         name: branch.officeName, // Using officeName for consistency
//         isdeleted: branch.isdeleted, // Include isdeleted
//       })) || []
//     );
//   }, [company]);

//   /**
//    * Helper function to get the office name for a given user.
//    * @param {Object} user - User object.
//    * @returns {String} - Office name or "N/A".
//    */
//   const getUserOfficeName = (user) => {
//     if (!user.branchAddress) return 'N/A';
//     if (typeof user.branchAddress === 'object' && user.branchAddress.officeName) {
//       return user.branchAddress.officeName;
//     }
//     const branch = branchOptions.find((branch) => branch.id === user.branchAddress);
//     return branch ? branch.name : 'N/A';
//   };

//   // ---------------------- Count Functions ---------------------- //

//   const countAdminUsers = () => {
//     const adminRoles = [
//       'SuperAdmin',
//       'RegionalAdmin',
//       'CountryAdmin',
//       'CityAdmin',
//       'OfficeAdmin',
//       'EmployeeDashboardUser',
//       'BinDisplayUser',
//     ];
//     return (
//       company?.users?.filter((u) => {
//         if (!adminRoles.includes(u.role) || u.isdeleted) return false;
//         // If the user's OrgUnit type is "Branch", use its branchAddress to validate
//         if (u.OrgUnit && u.OrgUnit.type === 'Branch') {
//           if (!u.OrgUnit.branchAddress) return false;
//           const branch = company.branchAddresses.find(
//             (b) => b._id.toString() === u.OrgUnit.branchAddress.toString(),
//           );
//           return branch && !branch.isdeleted;
//         }
//         // Otherwise, count the admin user.
//         return true;
//       }).length || 0
//     );
//   };

//   /**
//    * Count the number of office locations.
//    */
//   const countOfficeLocations = () => {
//     return company?.branchAddresses?.filter((addr) => addr.isdeleted === false).length || 0;
//   };

//   /**
//    * Count the total number of waste bins by summing bins across branches.
//    */
//   const countWasteBins = () => {
//     return (
//       company?.branchAddresses
//         ?.filter((branch) => branch.isdeleted === false)
//         ?.reduce((acc, branch) => acc + (branch.dustbins ? branch.dustbins.length : 0), 0) || 0
//     );
//   };

//   // ---------------------- Address Operations ---------------------- //

//   /**
//    * Add or update an office address.
//    * This function handles both creation and update of a branch address.
//    * For new addresses, it extracts the branchRecord from the response so that the branch table is updated correctly.
//    *
//    * @param {Object} addressData - Address details from the form.
//    */
//   const addOrUpdateAddress = async (addressData) => {
//     try {
//       if (selectedAddress && selectedAddress._id) {
//         // Update existing address
//         await axios.post('/api/v1/address/updateCompanyAddress', {
//           ...addressData,
//           addressId: selectedAddress._id,
//         });
//         // Update local state with the updated address
//         setCompany((prev) => ({
//           ...prev,
//           branchAddresses: prev.branchAddresses.map((addr) =>
//             addr._id === selectedAddress._id ? { ...addr, ...addressData } : addr,
//           ),
//         }));
//       } else {
//         // Add new address
//         const response = await axios.post('/api/v1/address/addCompanyAddress', {
//           ...addressData,
//           associatedCompany: id,
//         });
//         // Update local state with the new address using branchRecord from the response.
//         setCompany((prev) => ({
//           ...prev,
//           branchAddresses: [
//             ...prev.branchAddresses,
//             response.data.data.branchRecord, // Updated to extract branchRecord from the combined response.
//           ],
//         }));
//         // Optionally log the backend success message.
//         console.log(response.data.message || 'Branch and OrgUnits created successfully');
//       }
//       setSelectedAddress(null);
//     } catch (error) {
//       console.error('Error saving address:', error);
//     }
//     setIsAddressDialogOpen(false);
//   };

//   // ---------------------- User Operations ---------------------- //

//   /**
//    * Add a new user (admin) to the company.
//    * @param {Object} newUser - New user details.
//    */
//   const addUser = async (newUser) => {
//     try {
//       const response = await axios.post('/api/v1/users/register', {
//         ...newUser,
//         branchAddress: newUser.branchAddress,
//         company: id,
//       });
//       setCompany((prev) => ({
//         ...prev,
//         users: [...prev.users, response.data.data],
//       }));
//     } catch (error) {
//       console.error('Error adding user:', error);
//     }
//     setIsUserDialogOpen(false);
//   };

//   /**
//    * Edit a user after confirmation.
//    */
//   const editUser = async (userData) => {
//     try {
//       const response = await axios.post('/api/v1/users/updateuser', {
//         ...userData,
//         userId: selectedUser._id,
//       });

//       setCompany((prev) => ({
//         ...prev,
//         users: prev.users.map((u) => (u._id === selectedUser._id ? { ...u, ...userData } : u)),
//       }));

//       setSelectedUser(null);
//       setIsUserDialogOpen(false);
//     } catch (error) {
//       console.error('Error updating user:', error);
//     }
//   };

//   // ---------------------- Dustbin Operations ---------------------- //

//   const handleDustbinAdded = () => {
//     setIsDustbinDialogOpen(false);
//     fetchCompanyDetails();
//   };

//   /**
//    * A reusable component to display statistics.
//    */
//   function StatItem({ icon, label, value }) {
//     return (
//       <div className="flex items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
//         <div className="mr-3">{icon}</div>
//         <div className="flex flex-col">
//           <div className="text-2xl font-bold">{value}</div>
//           <div className="text-sm text-muted-foreground">{label}</div>
//         </div>
//       </div>
//     );
//   }

//   // ---------------------- Render Loading State ---------------------- //

//   if (!company) {
//     return <div className="flex items-center justify-center h-screen">Loading...</div>;
//   }

//   // ---------------------- Delete Operations ---------------------- //

//   const confirmDeleteAddress = async () => {
//     try {
//       await axios.post('/api/v1/address/deleteCompanyAddress', {
//         addressId: selectedAddress._id,
//       });
//       setCompany((prev) => ({
//         ...prev,
//         branchAddresses: prev.branchAddresses.filter((addr) => addr._id !== selectedAddress._id),
//       }));
//     } catch (error) {
//       console.error('Error deleting address:', error);
//     }
//     setIsDeleteDialogOpen(false);
//     setSelectedAddress(null);
//   };

//   // ---------------------- Component Rendering ---------------------- //
//   return (
//     <div className="flex h-screen bg-[#F9FAFB]">
//       <SideMenu />

//       <div className="flex-1 p-6 overflow-auto space-y-6">
//         {/* Breadcrumb Navigation */}
//         <div className="flex justify-between items-center">
//           <Breadcrumb>
//             <BreadcrumbList>
//               <BreadcrumbItem>
//                 <BreadcrumbLink onClick={() => navigate('/')}>
//                   <Home className="h-4 w-4" />
//                 </BreadcrumbLink>
//               </BreadcrumbItem>
//               <BreadcrumbSeparator />
//               <BreadcrumbItem>
//                 <BreadcrumbLink onClick={() => navigate('/companies')}>Companies</BreadcrumbLink>
//               </BreadcrumbItem>
//               <BreadcrumbSeparator />
//               <BreadcrumbItem>
//                 <BreadcrumbLink>{company.CompanyName}</BreadcrumbLink>
//               </BreadcrumbItem>
//             </BreadcrumbList>
//           </Breadcrumb>
//           <Button
//             className="bg-primary hover:bg-primary/90 text-white rounded-md"
//             onClick={() => navigate('/invite-admin')}
//           >
//             <UserPlus className="mr-2 h-4 w-4" /> Invite Admin
//           </Button>
//         </div>
//         <div className="space-y-6">
//           {/* Company Details Card */}
//           <Card className="w-full overflow-hidden shadow-sm">
//             <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-4">
//               <CardTitle className="text-2xl font-bold tracking-tight">
//                 {company.CompanyName}
//               </CardTitle>
//               <div className="flex items-center text-muted-foreground">
//                 <Globe className="h-4 w-4 mr-2" />
//                 <span>{company.domain}</span>
//               </div>
//             </CardHeader>
//             <CardContent className="p-4">
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                 <StatItem
//                   icon={<Users className="h-5 w-5 text-blue-500" />}
//                   label="Employees"
//                   value={company.noofEmployees}
//                 />
//                 <StatItem
//                   icon={<UserCog className="h-5 w-5 text-indigo-500" />}
//                   label="Admin(s)"
//                   value={countAdminUsers()}
//                 />
//                 <StatItem
//                   icon={<Building2 className="h-5 w-5 text-emerald-500" />}
//                   label="Office Location(s)"
//                   value={countOfficeLocations()}
//                 />
//                 <StatItem
//                   icon={<Trash2 className="h-5 w-5 text-amber-500" />}
//                   label="Waste Bins"
//                   value={countWasteBins()}
//                 />
//               </div>
//             </CardContent>
//           </Card>

//           {/* Office Locations Section */}
//           <Card className="shadow-sm">
//             <CardHeader className="pb-0 flex flex-row items-center justify-between">
//               <div>
//                 <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
//                   <Building2 className="mr-2 h-5 w-5 text-primary" /> Office Locations
//                 </CardTitle>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <div className="relative">
//                   <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     type="search"
//                     placeholder="Search offices..."
//                     className="pl-8 h-9 w-64"
//                     value={searchLocations}
//                     onChange={(e) => setSearchLocations(e.target.value)}
//                   />
//                 </div>
//                 <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
//                   <DialogTrigger>
//                     <Button
//                       onClick={() => {
//                         setSelectedAddress(null);
//                         setIsAddressDialogOpen(true);
//                       }}
//                       size="sm"
//                       className="bg-primary hover:bg-primary/90 text-white hover:text-white rounded-[6px] h-9"
//                     >
//                       <Plus className="mr-1 h-3.5 w-3.5" /> Add Address
//                     </Button>
//                   </DialogTrigger>
//                   <DialogContent className="bg-white rounded-lg shadow-lg max-w-md mx-auto">
//                     <DialogHeader>
//                       <DialogTitle>
//                         {selectedAddress ? 'Update Address' : 'Add New Address'}
//                       </DialogTitle>
//                       <DialogDescription>
//                         {selectedAddress
//                           ? 'Update the address details.'
//                           : 'Enter the details for the new office location.'}
//                       </DialogDescription>
//                     </DialogHeader>
//                     <AddressForm
//                       onSubmit={addOrUpdateAddress}
//                       initialData={selectedAddress}
//                       companyId={id}
//                       companyName={company.CompanyName}
//                     />
//                   </DialogContent>
//                 </Dialog>
//               </div>
//             </CardHeader>
//             <CardContent className="p-4">
//               {company.branchAddresses &&
//               company.branchAddresses.filter((branch) => !branch.isdeleted).length === 0 ? (
//                 <div className="text-center py-8 bg-white rounded-lg border border-slate-100">
//                   <p className="text-slate-500 mb-4">No office locations found.</p>
//                   <Button
//                     onClick={() => {
//                       setSelectedAddress(null);
//                       setIsAddressDialogOpen(true);
//                     }}
//                     variant="outline"
//                     className="bg-primary hover:bg-primary/90 text-white hover:text-white"
//                   >
//                     <Plus className="mr-2 h-4 w-4" /> Add First Office
//                   </Button>
//                 </div>
//               ) : (
//                 <div className="overflow-hidden">
//                   <Table>
//                     <TableHeader className="bg-slate-50">
//                       <TableRow>
//                         <TableHead className="font-medium text-slate-700">Office Name</TableHead>
//                         <TableHead className="font-medium text-slate-700">Address</TableHead>
//                         <TableHead className="font-medium text-slate-700">City</TableHead>
//                         <TableHead className="font-medium text-slate-700">Subdivison</TableHead>
//                         <TableHead className="font-medium text-slate-700">Postal Code</TableHead>
//                         <TableHead className="font-medium text-slate-700">Country</TableHead>
//                         <TableHead className="text-right font-medium text-slate-700">
//                           Actions
//                         </TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {company.branchAddresses
//                         .filter((address) => !address.isdeleted)
//                         .filter(
//                           (address) =>
//                             address.officeName
//                               .toLowerCase()
//                               .includes(searchLocations.toLowerCase()) ||
//                             address.city.toLowerCase().includes(searchLocations.toLowerCase()) ||
//                             address.country.toLowerCase().includes(searchLocations.toLowerCase()),
//                         )
//                         .map((address) => (
//                           <TableRow key={address._id}>
//                             <TableCell className="font-medium">{address.officeName}</TableCell>
//                             <TableCell>{address.address}</TableCell>
//                             <TableCell>{address.city}</TableCell>
//                             <TableCell>
//                               <span className="font-bold text-slate-500">
//                                 {address.subdivisionType}:
//                               </span>{' '}
//                               {address.subdivision}
//                             </TableCell>
//                             <TableCell>{address.postalCode}</TableCell>
//                             <TableCell>{address.country}</TableCell>
//                             <TableCell className="text-right">
//                               <div className="flex justify-end space-x-1">
//                                 {/* Action button with soft rounded background matching table header */}
//                                 <Button
//                                   variant="ghost"
//                                   size="sm"
//                                   className="h-8 w-8 p-0 text-blue-600 bg-slate-50 hover:bg-slate-100 rounded-md"
//                                   onClick={() => {
//                                     setSelectedAddress(address);
//                                     setIsAddressDialogOpen(true);
//                                   }}
//                                 >
//                                   <svg
//                                     xmlns="http://www.w3.org/2000/svg"
//                                     width="16"
//                                     height="16"
//                                     viewBox="0 0 24 24"
//                                     fill="none"
//                                     stroke="currentColor"
//                                     strokeWidth="2"
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     className="h-4 w-4"
//                                   >
//                                     <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
//                                     <path d="m15 5 4 4"></path>
//                                   </svg>
//                                 </Button>
//                                 {/* Action button with soft rounded background matching table header */}
//                                 <Button
//                                   variant="ghost"
//                                   size="sm"
//                                   className="h-8 w-8 p-0 text-red-600 bg-slate-50 hover:bg-slate-100 rounded-md"
//                                   onClick={() => {
//                                     setSelectedAddress(address);
//                                     setIsDeleteDialogOpen(true);
//                                   }}
//                                 >
//                                   <Trash2 className="h-4 w-4" />
//                                 </Button>
//                               </div>
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                     </TableBody>
//                   </Table>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Admin Users Section */}
//           <Card className="shadow-sm">
//             <CardHeader className="pb-0 flex flex-row items-center justify-between">
//               <div>
//                 <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
//                   <UserCog className="mr-2 h-5 w-5 text-primary" /> Admin Users
//                 </CardTitle>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <div className="relative">
//                   <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//                   <Input
//                     type="search"
//                     placeholder="Search users..."
//                     className="pl-8 h-9 w-64"
//                     value={searchUsers}
//                     onChange={(e) => setSearchUsers(e.target.value)}
//                   />
//                 </div>
//                 <TooltipProvider>
//                   <Tooltip>
//                     <TooltipTrigger>
//                       <Button
//                         size="sm"
//                         onClick={() => {
//                           setSelectedUser(null);
//                           setIsUserDialogOpen(true);
//                         }}
//                         className="bg-primary hover:bg-primary/90 hover:text-white text-white rounded-[6px] h-9"
//                         disabled={!company.branchAddresses || company.branchAddresses.length === 0}
//                       >
//                         <Plus className="mr-1 h-3.5 w-3.5" /> Add Admin
//                       </Button>
//                     </TooltipTrigger>
//                     <TooltipContent>
//                       <p>Please add office location first</p>
//                     </TooltipContent>
//                   </Tooltip>
//                 </TooltipProvider>
//               </div>
//             </CardHeader>
//             <CardContent className="p-4">
//               {company.users && company.users.length === 0 ? (
//                 <div className="text-center py-8 bg-white rounded-lg border border-slate-100">
//                   <p className="text-slate-500 mb-4">No users added yet.</p>
//                   <Button
//                     onClick={() => {
//                       setSelectedUser(null);
//                       setIsUserDialogOpen(true);
//                     }}
//                     variant="outline"
//                     className="bg-primary hover:bg-primary/90 text-white hover:text-white"
//                     disabled={!company.branchAddresses || company.branchAddresses.length === 0}
//                   >
//                     <Plus className="mr-2 h-4 w-4" /> Add First Admin
//                   </Button>
//                 </div>
//               ) : (
//                 <div className="overflow-hidden">
//                   <Table>
//                     <TableHeader className="bg-slate-50">
//                       <TableRow>
//                         <TableHead className="font-medium text-slate-700">Full Name</TableHead>
//                         <TableHead className="font-medium text-slate-700">Email</TableHead>
//                         <TableHead className="font-medium text-slate-700">Admin Level</TableHead>
//                         <TableHead className="font-medium text-slate-700">Subdivision</TableHead>
//                         <TableHead className="text-right font-medium text-slate-700">
//                           Actions
//                         </TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {company.users
//                         .filter((user) => !user.isdeleted)
//                         .filter(
//                           (user) =>
//                             user.fullName.toLowerCase().includes(searchUsers.toLowerCase()) ||
//                             user.email.toLowerCase().includes(searchUsers.toLowerCase()) ||
//                             user.role.toLowerCase().includes(searchUsers.toLowerCase()),
//                         )
//                         .map((user) => (
//                           <TableRow key={user._id}>
//                             <TableCell className="font-medium">{user.fullName}</TableCell>
//                             <TableCell>{user.email}</TableCell>
//                             <TableCell>
//                               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                                 {user.role}
//                               </span>
//                             </TableCell>
//                             <TableCell>{user.OrgUnit.name}</TableCell>
//                             <TableCell className="text-right">
//                               <div className="flex justify-end space-x-1">
//                                 {/* Action button with soft rounded background matching table header */}
//                                 <Button
//                                   variant="ghost"
//                                   size="sm"
//                                   className="h-8 w-8 p-0 text-blue-600 bg-slate-50 hover:bg-slate-100 rounded-md"
//                                   onClick={() => {
//                                     setSelectedUser(user);
//                                     setIsUserDialogOpen(true);
//                                   }}
//                                 >
//                                   <svg
//                                     xmlns="http://www.w3.org/2000/svg"
//                                     width="16"
//                                     height="16"
//                                     viewBox="0 0 24 24"
//                                     fill="none"
//                                     stroke="currentColor"
//                                     strokeWidth="2"
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     className="h-4 w-4"
//                                   >
//                                     <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
//                                     <path d="m15 5 4 4"></path>
//                                   </svg>
//                                 </Button>
//                               </div>
//                             </TableCell>
//                           </TableRow>
//                         ))}
//                     </TableBody>
//                   </Table>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Waste Bins Section */}
//           <Card className="shadow-sm">
//             <CardHeader className="pb-0 flex flex-row items-center justify-between">
//               <div>
//                 <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
//                   <Trash2 className="mr-2 h-5 w-5 text-primary" /> Waste Bins
//                 </CardTitle>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <TooltipProvider>
//                   <Tooltip>
//                     <TooltipTrigger>
//                       <Button
//                         size="sm"
//                         onClick={() => setIsDustbinDialogOpen(true)}
//                         className="bg-primary hover:bg-primary/90 text-white hover:text-white rounded-[6px] h-9"
//                         disabled={!company.branchAddresses || company.branchAddresses.length === 0}
//                       >
//                         <Plus className="mr-1 h-3.5 w-3.5" /> Add Bins
//                       </Button>
//                     </TooltipTrigger>
//                     <TooltipContent>
//                       <p>Please add office location first</p>
//                     </TooltipContent>
//                   </Tooltip>
//                 </TooltipProvider>
//               </div>
//             </CardHeader>
//             <CardContent className="p-4">
//               {company.branchAddresses &&
//               company.branchAddresses.filter((branch) => branch.isdeleted === false).length ===
//                 0 ? (
//                 <div className="text-center py-8 bg-white rounded-lg border border-slate-100">
//                   <p className="text-gray-500 mb-4">No office locations or waste bins found.</p>
//                   <Button
//                     onClick={() => {
//                       setSelectedAddress(null);
//                       setIsAddressDialogOpen(true);
//                     }}
//                     variant="outline"
//                     className="bg-primary hover:bg-primary/90 text-white hover:text-white"
//                   >
//                     <Plus className="mr-2 h-4 w-4" /> Add Office First
//                   </Button>
//                 </div>
//               ) : (
//                 <div className="overflow-hidden">
//                   <Table>
//                     <TableHeader className="bg-slate-50">
//                       <TableRow>
//                         <TableHead className="font-medium text-slate-700">
//                           Office Location
//                         </TableHead>
//                         <TableHead className="font-medium text-slate-700">Bin Type</TableHead>
//                         <TableHead className="font-medium text-slate-700">Capacity</TableHead>
//                         <TableHead className="text-right font-medium text-slate-700">
//                           Actions
//                         </TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {company.branchAddresses
//                         .filter((branch) => !branch.isdeleted)
//                         .map((branch) => (
//                           <React.Fragment key={branch._id}>
//                             {(branch.dustbins || []).length > 0 ? (
//                               branch.dustbins.map((dustbin, index) => (
//                                 <TableRow key={`${branch._id}-${dustbin.dustbinType}`}>
//                                   {index === 0 && (
//                                     <TableCell
//                                       rowSpan={branch.dustbins.length}
//                                       className="font-medium align-top"
//                                     >
//                                       {branch.officeName}
//                                       <br />
//                                       {branch.address}, {branch.city}, {branch.region}{' '}
//                                       {branch.postalCode}
//                                     </TableCell>
//                                   )}
//                                   <TableCell>{dustbin.dustbinType}</TableCell>
//                                   <TableCell>{dustbin.binCapacity}L</TableCell>
//                                   <TableCell className="text-right">
//                                     {/* Action button with soft rounded background matching table header */}
//                                     <Button
//                                       variant="ghost"
//                                       size="sm"
//                                       className="h-8 w-8 p-0 text-blue-600 bg-slate-50 hover:bg-slate-100 rounded-md"
//                                     >
//                                       <svg
//                                         xmlns="http://www.w3.org/2000/svg"
//                                         width="16"
//                                         height="16"
//                                         viewBox="0 0 24 24"
//                                         fill="none"
//                                         stroke="currentColor"
//                                         strokeWidth="2"
//                                         strokeLinecap="round"
//                                         strokeLinejoin="round"
//                                         className="h-4 w-4"
//                                       >
//                                         <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
//                                         <path d="m15 5 4 4"></path>
//                                       </svg>
//                                     </Button>
//                                   </TableCell>
//                                 </TableRow>
//                               ))
//                             ) : (
//                               <TableRow>
//                                 <TableCell className="font-medium align-top">
//                                   {branch.officeName}
//                                   <br />
//                                   {branch.address}, {branch.city}, {branch.region}{' '}
//                                   {branch.postalCode}
//                                 </TableCell>
//                                 <TableCell colSpan={2} className="text-center text-gray-500 italic">
//                                   No bins available for this office location
//                                 </TableCell>
//                                 <TableCell className="text-right">
//                                   <Button
//                                     variant="outline"
//                                     size="sm"
//                                     className="h-8 text-primary border-primary/20"
//                                     onClick={() => setIsDustbinDialogOpen(true)}
//                                   >
//                                     <Plus className="h-3.5 w-3.5 mr-1" /> Add Bins
//                                   </Button>
//                                 </TableCell>
//                               </TableRow>
//                             )}
//                           </React.Fragment>
//                         ))}
//                     </TableBody>
//                   </Table>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Dialogs Section */}
//         <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
//           <DialogContent className="bg-white rounded-lg shadow-lg max-w-md mx-auto">
//             <DialogHeader>
//               <DialogTitle>{selectedUser ? 'Edit Admin User' : 'Add New Admin User'}</DialogTitle>
//               <DialogDescription>
//                 {selectedUser
//                   ? 'Update the details for this user.'
//                   : 'Enter the details for the new user.'}
//               </DialogDescription>
//             </DialogHeader>
//             <UserForm
//               onSubmit={selectedUser ? editUser : addUser}
//               branches={branchOptions}
//               companyId={id}
//               initialData={selectedUser}
//             />
//           </DialogContent>
//         </Dialog>

//         <Dialog open={isDustbinDialogOpen} onOpenChange={setIsDustbinDialogOpen}>
//           <DialogContent className="bg-white">
//             <AddBinsForm branches={branchOptions} onDustbinAdded={handleDustbinAdded} />
//           </DialogContent>
//         </Dialog>

//         <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
//           <DialogContent className="bg-white rounded-lg shadow-lg max-w-md mx-auto">
//             <DialogHeader>
//               <DialogTitle>Confirm Deletion</DialogTitle>
//               <DialogDescription>
//                 Are you sure you want to delete{' '}
//                 <span className="text-red-600 text-md font-semibold">
//                   {selectedAddress?.officeName}
//                 </span>{' '}
//                 office location? This action cannot be undone.
//               </DialogDescription>
//             </DialogHeader>
//             <DialogFooter>
//               <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
//                 Cancel
//               </Button>
//               <Button variant="destructive" onClick={confirmDeleteAddress}>
//                 Delete
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </div>
//     </div>
//   );
// }
'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// Custom UI components and icons
import SideMenu from '../components/layouts/SideMenu';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableHeader,
} from '../components/ui/Table';
import {
  Building2,
  Globe,
  Users,
  UserCog,
  Trash2,
  Plus,
  Search,
  Home,
  UserPlus,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/Dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/Tooltip';
import { Input } from '../components/ui/Input';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '../components/ui/Breadcrumb';

// Import form components for address, user, and dustbin operations
import { AddressForm } from '../components/ui/AddressForm';
import { UserForm } from '../components/ui/UserForm';
import { AddBinsForm } from '/src/components/ui/DustbinForm.jsx';

export default function CompanyInfo() {
  // Retrieve company ID from URL parameters
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [searchLocations, setSearchLocations] = useState('');
  const [searchUsers, setSearchUsers] = useState('');

  // Dialog state variables
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDustbinDialogOpen, setIsDustbinDialogOpen] = useState(false);

  // Selected items for update or deletion
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // List of dustbin types (for forms if needed)
  const dustbinTypes = ['General Waste', 'Commingled', 'Organics', 'Paper & Cardboard'];

  /**
   * Fetch company details from the API.
   */
  const fetchCompanyDetails = useCallback(async () => {
    try {
      const response = await axios.get(`/api/v1/company/${id}`);
      setCompany(response.data.data);
    } catch (error) {
      console.error('Error fetching company details:', error);
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
        isdeleted: branch.isdeleted, // Include isdeleted
      })) || []
    );
  }, [company]);

  /**
   * Helper function to get the office name for a given user.
   * @param {Object} user - User object.
   * @returns {String} - Office name or "N/A".
   */
  const getUserOfficeName = (user) => {
    if (!user.branchAddress) return 'N/A';
    if (typeof user.branchAddress === 'object' && user.branchAddress.officeName) {
      return user.branchAddress.officeName;
    }
    const branch = branchOptions.find((branch) => branch.id === user.branchAddress);
    return branch ? branch.name : 'N/A';
  };

  // ---------------------- Count Functions ---------------------- //

  const countAdminUsers = () => {
    const adminRoles = [
      'SuperAdmin',
      'RegionalAdmin',
      'CountryAdmin',
      'CityAdmin',
      'OfficeAdmin',
      'EmployeeDashboardUser',
      'BinDisplayUser',
    ];
    return (
      company?.users?.filter((u) => {
        if (!adminRoles.includes(u.role) || u.isdeleted) return false;
        // If the user's OrgUnit type is "Branch", use its branchAddress to validate
        if (u.OrgUnit && u.OrgUnit.type === 'Branch') {
          if (!u.OrgUnit.branchAddress) return false;
          const branch = company.branchAddresses.find(
            (b) => b._id.toString() === u.OrgUnit.branchAddress.toString(),
          );
          return branch && !branch.isdeleted;
        }
        // Otherwise, count the admin user.
        return true;
      }).length || 0
    );
  };

  /**
   * Count the number of office locations.
   */
  const countOfficeLocations = () => {
    return company?.branchAddresses?.filter((addr) => addr.isdeleted === false).length || 0;
  };

  /**
   * Count the total number of waste bins by summing bins across branches.
   */
  const countWasteBins = () => {
    return (
      company?.branchAddresses
        ?.filter((branch) => branch.isdeleted === false)
        ?.reduce((acc, branch) => acc + (branch.dustbins ? branch.dustbins.length : 0), 0) || 0
    );
  };

  // ---------------------- Address Operations ---------------------- //

  /**
   * Add or update an office address.
   * This function handles both creation and update of a branch address.
   * For new addresses, it extracts the branchRecord from the response so that the branch table is updated correctly.
   *
   * @param {Object} addressData - Address details from the form.
   */
  const addOrUpdateAddress = async (addressData) => {
    try {
      if (selectedAddress && selectedAddress._id) {
        // Update existing address
        await axios.post('/api/v1/address/updateCompanyAddress', {
          ...addressData,
          addressId: selectedAddress._id,
        });
        // Update local state with the updated address
        setCompany((prev) => ({
          ...prev,
          branchAddresses: prev.branchAddresses.map((addr) =>
            addr._id === selectedAddress._id ? { ...addr, ...addressData } : addr,
          ),
        }));
      } else {
        // Add new address
        const response = await axios.post('/api/v1/address/addCompanyAddress', {
          ...addressData,
          associatedCompany: id,
        });
        // Update local state with the new address using branchRecord from the response.
        setCompany((prev) => ({
          ...prev,
          branchAddresses: [
            ...prev.branchAddresses,
            response.data.data.branchRecord, // Updated to extract branchRecord from the combined response.
          ],
        }));
        // Optionally log the backend success message.
        console.log(response.data.message || 'Branch and OrgUnits created successfully');
      }
      setSelectedAddress(null);
    } catch (error) {
      console.error('Error saving address:', error);
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
      const response = await axios.post('/api/v1/users/register', {
        ...newUser,
        branchAddress: newUser.branchAddress,
        company: id,
      });
      setCompany((prev) => ({
        ...prev,
        users: [...prev.users, response.data.data],
      }));
    } catch (error) {
      console.error('Error adding user:', error);
    }
    setIsUserDialogOpen(false);
  };

  /**
   * Edit a user after confirmation.
   */
  const editUser = async (userData) => {
    try {
      const response = await axios.post('/api/v1/users/updateuser', {
        ...userData,
        userId: selectedUser._id,
      });

      setCompany((prev) => ({
        ...prev,
        users: prev.users.map((u) => (u._id === selectedUser._id ? { ...u, ...userData } : u)),
      }));

      setSelectedUser(null);
      setIsUserDialogOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
    }
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
      <div className="flex items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
        <div className="mr-3">{icon}</div>
        <div className="flex flex-col">
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm text-muted-foreground">{label}</div>
        </div>
      </div>
    );
  }

  // ---------------------- Render Loading State ---------------------- //

  if (!company) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // ---------------------- Delete Operations ---------------------- //

  const confirmDeleteAddress = async () => {
    try {
      await axios.post('/api/v1/address/deleteCompanyAddress', {
        addressId: selectedAddress._id,
      });
      setCompany((prev) => ({
        ...prev,
        branchAddresses: prev.branchAddresses.filter((addr) => addr._id !== selectedAddress._id),
      }));
    } catch (error) {
      console.error('Error deleting address:', error);
    }
    setIsDeleteDialogOpen(false);
    setSelectedAddress(null);
  };

  // ---------------------- Component Rendering ---------------------- //
  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      <SideMenu />

      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex justify-between items-center">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate('/')}>
                  <Home className="h-4 w-4" />
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink onClick={() => navigate('/companies')}>Companies</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>{company.CompanyName}</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          {/* Updated Invite button to navigate to InviteUser.jsx page */}
          <Button
            className="bg-primary hover:bg-primary/90 text-white rounded-md h-9 w-[150px]"
            onClick={() => navigate(`/invite-user/${id}`)}
          >
            <UserPlus className="mr-2 h-4 w-4" /> Invite User
          </Button>
        </div>
        <div className="space-y-6">
          {/* Company Details Card */}
          <Card className="w-full overflow-hidden shadow-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-4">
              <CardTitle className="text-2xl font-bold tracking-tight">
                {company.CompanyName}
              </CardTitle>
              <div className="flex items-center text-muted-foreground">
                <Globe className="h-4 w-4 mr-2" />
                <span>{company.domain}</span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatItem
                  icon={<Users className="h-5 w-5 text-blue-500" />}
                  label="Employees"
                  value={company.noofEmployees}
                />
                <StatItem
                  icon={<UserCog className="h-5 w-5 text-indigo-500" />}
                  label="Admin(s)"
                  value={countAdminUsers()}
                />
                <StatItem
                  icon={<Building2 className="h-5 w-5 text-emerald-500" />}
                  label="Office Location(s)"
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
          <Card className="shadow-sm">
            <CardHeader className="pb-0 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                  <Building2 className="mr-2 h-5 w-5 text-primary" /> Office Locations
                </CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search offices..."
                    className="pl-8 h-9 w-64"
                    value={searchLocations}
                    onChange={(e) => setSearchLocations(e.target.value)}
                  />
                </div>
                <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                  <DialogTrigger>
                    <Button
                      onClick={() => {
                        setSelectedAddress(null);
                        setIsAddressDialogOpen(true);
                      }}
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-white hover:text-white rounded-[6px] h-9 w-[150px]"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" /> Add Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white rounded-lg shadow-lg max-w-md mx-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {selectedAddress ? 'Update Address' : 'Add New Address'}
                      </DialogTitle>
                      <DialogDescription>
                        {selectedAddress
                          ? 'Update the address details.'
                          : 'Enter the details for the new office location.'}
                      </DialogDescription>
                    </DialogHeader>
                    <AddressForm
                      onSubmit={addOrUpdateAddress}
                      initialData={selectedAddress}
                      companyId={id}
                      companyName={company.CompanyName}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {company.branchAddresses &&
              company.branchAddresses.filter((branch) => !branch.isdeleted).length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg border border-slate-100">
                  <p className="text-slate-500 mb-4">No office locations found.</p>
                  <Button
                    onClick={() => {
                      setSelectedAddress(null);
                      setIsAddressDialogOpen(true);
                    }}
                    variant="outline"
                    className="bg-primary hover:bg-primary/90 text-white hover:text-white h-9 w-[150px]"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add First Office
                  </Button>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-medium text-slate-700">Office Name</TableHead>
                        <TableHead className="font-medium text-slate-700">Address</TableHead>
                        <TableHead className="font-medium text-slate-700">City</TableHead>
                        <TableHead className="font-medium text-slate-700">Subdivison</TableHead>
                        <TableHead className="font-medium text-slate-700">Postal Code</TableHead>
                        <TableHead className="font-medium text-slate-700">Country</TableHead>
                        <TableHead className="text-right font-medium text-slate-700">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {company.branchAddresses
                        .filter((address) => !address.isdeleted)
                        .filter(
                          (address) =>
                            address.officeName
                              .toLowerCase()
                              .includes(searchLocations.toLowerCase()) ||
                            address.city.toLowerCase().includes(searchLocations.toLowerCase()) ||
                            address.country.toLowerCase().includes(searchLocations.toLowerCase()),
                        )
                        .map((address) => (
                          <TableRow key={address._id}>
                            <TableCell className="font-medium">{address.officeName}</TableCell>
                            <TableCell>{address.address}</TableCell>
                            <TableCell>{address.city}</TableCell>
                            <TableCell>
                              <span className="font-bold text-slate-500">
                                {address.subdivisionType}:
                              </span>{' '}
                              {address.subdivision}
                            </TableCell>
                            <TableCell>{address.postalCode}</TableCell>
                            <TableCell>{address.country}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                {/* Action button with soft rounded background matching table header */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-blue-600 bg-slate-50 hover:bg-slate-100 rounded-md"
                                  onClick={() => {
                                    setSelectedAddress(address);
                                    setIsAddressDialogOpen(true);
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                  >
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                                    <path d="m15 5 4 4"></path>
                                  </svg>
                                </Button>
                                {/* Action button with soft rounded background matching table header */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 bg-slate-50 hover:bg-slate-100 rounded-md"
                                  onClick={() => {
                                    setSelectedAddress(address);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Users Section */}
          <Card className="shadow-sm">
            <CardHeader className="pb-0 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                  <UserCog className="mr-2 h-5 w-5 text-primary" /> Admin Users
                </CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search users..."
                    className="pl-8 h-9 w-64"
                    value={searchUsers}
                    onChange={(e) => setSearchUsers(e.target.value)}
                  />
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedUser(null);
                          setIsUserDialogOpen(true);
                        }}
                        className="bg-primary hover:bg-primary/90 hover:text-white text-white rounded-[6px] h-9 w-[150px]"
                        disabled={!company.branchAddresses || company.branchAddresses.length === 0}
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" /> Add Admin
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Please add office location first</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {company.users && company.users.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-lg border border-slate-100">
                  <p className="text-slate-500 mb-4">No users added yet.</p>
                  <Button
                    onClick={() => {
                      setSelectedUser(null);
                      setIsUserDialogOpen(true);
                    }}
                    variant="outline"
                    className="bg-primary hover:bg-primary/90 text-white hover:text-white h-9 w-[150px]"
                    disabled={!company.branchAddresses || company.branchAddresses.length === 0}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add First Admin
                  </Button>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-medium text-slate-700">Full Name</TableHead>
                        <TableHead className="font-medium text-slate-700">Email</TableHead>
                        <TableHead className="font-medium text-slate-700">Admin Level</TableHead>
                        <TableHead className="font-medium text-slate-700">Subdivision</TableHead>
                        <TableHead className="text-right font-medium text-slate-700">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {company.users
                        .filter((user) => !user.isdeleted)
                        .filter(
                          (user) =>
                            user.fullName.toLowerCase().includes(searchUsers.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchUsers.toLowerCase()) ||
                            user.role.toLowerCase().includes(searchUsers.toLowerCase()),
                        )
                        .map((user) => (
                          <TableRow key={user._id}>
                            <TableCell className="font-medium">{user.fullName}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {user.role}
                              </span>
                            </TableCell>
                            <TableCell>{user.OrgUnit.name}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                {/* Action button with soft rounded background matching table header */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-blue-600 bg-slate-50 hover:bg-slate-100 rounded-md"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsUserDialogOpen(true);
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                  >
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                                    <path d="m15 5 4 4"></path>
                                  </svg>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Waste Bins Section */}
          <Card className="shadow-sm">
            <CardHeader className="pb-0 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-slate-800 flex items-center">
                  <Trash2 className="mr-2 h-5 w-5 text-primary" /> Waste Bins
                </CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        size="sm"
                        onClick={() => setIsDustbinDialogOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-white hover:text-white rounded-[6px] h-9 w-[150px]"
                        disabled={!company.branchAddresses || company.branchAddresses.length === 0}
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" /> Add Bins
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Please add office location first</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {company.branchAddresses &&
              company.branchAddresses.filter((branch) => branch.isdeleted === false).length ===
                0 ? (
                <div className="text-center py-8 bg-white rounded-lg border border-slate-100">
                  <p className="text-gray-500 mb-4">No office locations or waste bins found.</p>
                  <Button
                    onClick={() => {
                      setSelectedAddress(null);
                      setIsAddressDialogOpen(true);
                    }}
                    variant="outline"
                    className="bg-primary hover:bg-primary/90 text-white hover:text-white"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Office First
                  </Button>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="font-medium text-slate-700">
                          Office Location
                        </TableHead>
                        <TableHead className="font-medium text-slate-700">Bin Type</TableHead>
                        <TableHead className="font-medium text-slate-700">Capacity</TableHead>
                        <TableHead className="text-right font-medium text-slate-700">
                          Actions
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
                                <TableRow key={`${branch._id}-${dustbin.dustbinType}`}>
                                  {index === 0 && (
                                    <TableCell
                                      rowSpan={branch.dustbins.length}
                                      className="font-medium align-top"
                                    >
                                      {branch.officeName}
                                      <br />
                                      {branch.address}, {branch.city}, {branch.region}{' '}
                                      {branch.postalCode}
                                    </TableCell>
                                  )}
                                  <TableCell>{dustbin.dustbinType}</TableCell>
                                  <TableCell>{dustbin.binCapacity}L</TableCell>
                                  <TableCell className="text-right">
                                    {/* Action button with soft rounded background matching table header */}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-blue-600 bg-slate-50 hover:bg-slate-100 rounded-md"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="h-4 w-4"
                                      >
                                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                                        <path d="m15 5 4 4"></path>
                                      </svg>
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell className="font-medium align-top">
                                  {branch.officeName}
                                  <br />
                                  {branch.address}, {branch.city}, {branch.region}{' '}
                                  {branch.postalCode}
                                </TableCell>
                                <TableCell colSpan={2} className="text-center text-gray-500 italic">
                                  No bins available for this office location
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-primary border-primary/20"
                                    onClick={() => setIsDustbinDialogOpen(true)}
                                  >
                                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Bins
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialogs Section */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent className="bg-white rounded-lg shadow-lg max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>{selectedUser ? 'Edit Admin User' : 'Add New Admin User'}</DialogTitle>
              <DialogDescription>
                {selectedUser
                  ? 'Update the details for this user.'
                  : 'Enter the details for the new user.'}
              </DialogDescription>
            </DialogHeader>
            <UserForm
              onSubmit={selectedUser ? editUser : addUser}
              branches={branchOptions}
              companyId={id}
              initialData={selectedUser}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isDustbinDialogOpen} onOpenChange={setIsDustbinDialogOpen}>
          <DialogContent className="bg-white">
            <AddBinsForm branches={branchOptions} onDustbinAdded={handleDustbinAdded} />
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="bg-white rounded-lg shadow-lg max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{' '}
                <span className="text-red-600 text-md font-semibold">
                  {selectedAddress?.officeName}
                </span>{' '}
                office location? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteAddress}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
