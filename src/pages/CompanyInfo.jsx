'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Building2,
  Globe,
  Users,
  UserCog,
  Trash2,
  Plus,
  Search,
  Home,
  MapPin,
  ArrowLeft,
  X,
} from 'lucide-react';
import { useTheme } from '@/components/ui/theme-provider';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { Input } from '@/components/ui/Input';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import LoadingSpinner from '@/components/ui/Spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';

// Import form components for address, user, and dustbin operations
import { AddressForm } from '@/components/ui/AddressForm';
import { UserForm } from '@/components/ui/UserForm';
import { AddBinsForm } from '@/components/ui/DustbinForm';

// Add this constant at the top of the file, after the imports
const roleColorMap = {
  SuperAdmin: {
    light: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    dark: 'bg-indigo-900/20 text-indigo-300 border-indigo-800/30',
  },
  RegionalAdmin: {
    light: 'bg-violet-100 text-violet-700 border-violet-200',
    dark: 'bg-violet-900/20 text-violet-300 border-violet-800/30',
  },
  CountryAdmin: {
    light: 'bg-blue-100 text-blue-700 border-blue-200',
    dark: 'bg-blue-900/20 text-blue-300 border-blue-800/30',
  },
  CityAdmin: {
    light: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    dark: 'bg-cyan-900/20 text-cyan-300 border-cyan-800/30',
  },
  OfficeAdmin: {
    light: 'bg-teal-100 text-teal-700 border-teal-200',
    dark: 'bg-teal-900/20 text-teal-300 border-teal-800/30',
  },
  EmployeeDashboardUser: {
    light: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    dark: 'bg-emerald-900/20 text-emerald-300 border-emerald-800/30',
  },
  BinDisplayUser: {
    light: 'bg-amber-100 text-amber-700 border-amber-200',
    dark: 'bg-amber-900/20 text-amber-300 border-amber-800/30',
  },
};

// Add this helper function after the roleColorMap
const getRoleBadgeClass = (role, theme) => {
  return roleColorMap[role]
    ? roleColorMap[role][theme === 'dark' ? 'dark' : 'light']
    : theme === 'dark'
    ? 'bg-gray-900/20 text-gray-300 border-gray-800/30'
    : 'bg-gray-100 text-gray-700 border-gray-200';
};

// Toast types
const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

export default function CompanyInfo() {
  const { theme } = useTheme();
  // Retrieve company ID from URL parameters
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchLocations, setSearchLocations] = useState('');
  const [searchUsers, setSearchUsers] = useState('');
  const [searchBins, setSearchBins] = useState('');

  // Dialog state variables
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDustbinDialogOpen, setIsDustbinDialogOpen] = useState(false);

  // Selected items for update or deletion
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // Toast state
  const [toasts, setToasts] = useState([]);

  // List of dustbin types (for forms if needed)
  const dustbinTypes = ['General Waste', 'Commingled', 'Organics', 'Paper & Cardboard'];

  // Toast functionality integrated directly into the component
  const addToast = (title, message, type = TOAST_TYPES.INFO, duration = 7000) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, title, message, type }]);

    // Auto remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  };

  const removeToast = (id) => {
    // Find the toast element and add the removing class for animation
    const toastElement = document.getElementById(`toast-${id}`);
    if (toastElement) {
      toastElement.classList.add('removing');

      // Wait for animation to complete before removing from state
      setTimeout(() => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
      }, 400); // Match this with the animation duration
    } else {
      // Fallback if element not found
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }
  };

  /**
   * Fetch company details from the API.
   */
  const fetchCompanyDetails = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/v1/company/${id}`);
      setCompany(response.data.data);
    } catch (error) {
      console.error('Error fetching company details:', error);
      setError('Failed to load company details. Please try again.');
      addToast(
        'Error Loading Data',
        'Failed to load company details. Please try again.',
        TOAST_TYPES.ERROR,
      );

      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

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

        addToast(
          'Address Updated',
          `${addressData.officeName} has been successfully updated.`,
          TOAST_TYPES.SUCCESS,
        );
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

        addToast(
          'Address Added',
          `${addressData.officeName} has been successfully added.`,
          TOAST_TYPES.SUCCESS,
        );

        // Optionally log the backend success message.
        console.log(response.data.message || 'Branch and OrgUnits created successfully');
      }
      setSelectedAddress(null);
    } catch (error) {
      console.error('Error saving address:', error);
      addToast(
        'Error Saving Address',
        error.response?.data?.message || 'Failed to save address. Please try again.',
        TOAST_TYPES.ERROR,
      );
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

      addToast(
        'Admin Added',
        `${newUser.fullName} has been successfully added as ${newUser.role}.`,
        TOAST_TYPES.SUCCESS,
      );
    } catch (error) {
      console.error('Error adding user:', error);
      addToast(
        'Error Adding Admin',
        error.response?.data?.message || 'Failed to add admin. Please try again.',
        TOAST_TYPES.ERROR,
      );
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

      addToast(
        'Admin Updated',
        `${userData.fullName}'s information has been successfully updated.`,
        TOAST_TYPES.SUCCESS,
      );

      setSelectedUser(null);
      setIsUserDialogOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      addToast(
        'Error Updating Admin',
        error.response?.data?.message || 'Failed to update admin. Please try again.',
        TOAST_TYPES.ERROR,
      );
    }
  };

  // ---------------------- Dustbin Operations ---------------------- //

  const handleDustbinAdded = (binData) => {
    setIsDustbinDialogOpen(false);
    fetchCompanyDetails();

    // Show success toast with bin information
    const binCount = binData?.bins?.length || 'Multiple';
    const locationName =
      selectedAddress?.officeName || binData?.location?.name || 'selected location';

    addToast(
      'Bins Added Successfully',
      `${binCount} bins have been added to ${locationName}.`,
      TOAST_TYPES.SUCCESS,
    );

    // Reset selected address
    setSelectedAddress(null);
  };

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

      addToast(
        'Address Deleted',
        `${selectedAddress.officeName} has been successfully deleted.`,
        TOAST_TYPES.SUCCESS,
      );
    } catch (error) {
      console.error('Error deleting address:', error);
      addToast(
        'Error Deleting Address',
        error.response?.data?.message || 'Failed to delete address. Please try again.',
        TOAST_TYPES.ERROR,
      );
    }
    setIsDeleteDialogOpen(false);
    setSelectedAddress(null);
  };

  // Function to get bin type badge styling
  const getBinTypeBadgeStyle = (binType) => {
    const nameLower = binType.toLowerCase();

    if (nameLower.includes('general') || nameLower.includes('waste')) {
      return theme === 'dark'
        ? 'bg-rose-900/20 text-rose-300 border-rose-800/30'
        : 'bg-rose-50 text-rose-700 border-rose-200';
    } else if (nameLower.includes('commingled') || nameLower.includes('mixed')) {
      return theme === 'dark'
        ? 'bg-amber-900/20 text-amber-300 border-amber-800/30'
        : 'bg-amber-50 text-amber-700 border-amber-200';
    } else if (nameLower.includes('organic')) {
      return theme === 'dark'
        ? 'bg-emerald-900/20 text-emerald-300 border-emerald-800/30'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200';
    } else if (nameLower.includes('paper') || nameLower.includes('cardboard')) {
      return theme === 'dark'
        ? 'bg-blue-900/20 text-blue-300 border-blue-800/30'
        : 'bg-blue-50 text-blue-700 border-blue-200';
    } else if (nameLower.includes('glass')) {
      return theme === 'dark'
        ? 'bg-purple-900/20 text-purple-300 border-purple-800/30'
        : 'bg-purple-50 text-purple-700 border-purple-200';
    } else {
      return theme === 'dark'
        ? 'bg-sky-900/20 text-sky-300 border-sky-800/30'
        : 'bg-sky-50 text-sky-700 border-sky-200';
    }
  };

  // Function to get bin type icon color
  const getBinTypeIconColor = (binType) => {
    const nameLower = binType.toLowerCase();

    if (nameLower.includes('general') || nameLower.includes('waste')) {
      return theme === 'dark' ? 'text-rose-400' : 'text-rose-600';
    } else if (nameLower.includes('commingled') || nameLower.includes('mixed')) {
      return theme === 'dark' ? 'text-amber-400' : 'text-amber-600';
    } else if (nameLower.includes('organic')) {
      return theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600';
    } else if (nameLower.includes('paper') || nameLower.includes('cardboard')) {
      return theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
    } else if (nameLower.includes('glass')) {
      return theme === 'dark' ? 'text-purple-400' : 'text-purple-600';
    } else {
      return theme === 'dark' ? 'text-sky-400' : 'text-sky-600';
    }
  };

  // ---------------------- Loading & Error States ---------------------- //
  if (loading) {
    return (
      <div
        className={`flex h-[calc(100vh-64px)] w-full items-center justify-center ${
          theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'
        }`}
      >
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`container mx-auto px-4 py-8 ${
          theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50'
        }`}
      >
        <Card
          className={`border-destructive ${theme === 'dark' ? 'bg-slate-800 text-slate-100' : ''}`}
        >
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription className={theme === 'dark' ? 'text-slate-300' : ''}>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => fetchCompanyDetails()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------------------- Component Rendering ---------------------- //
  return (
    <div
      className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50'}`}
    >
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex justify-between items-center">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-0 ${
                      theme === 'dark'
                        ? 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                        : ''
                    }`}
                    onClick={() => navigate('/')}
                  >
                    <Home className="h-4 w-4" />
                  </Button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-0 ${
                      theme === 'dark'
                        ? 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                        : ''
                    }`}
                    onClick={() => navigate('/companies')}
                  >
                    Companies
                  </Button>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  className={`font-medium ${theme === 'dark' ? 'text-indigo-400' : 'text-primary'}`}
                >
                  {company.CompanyName}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Back button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/companies')}
            className={
              theme === 'dark'
                ? 'bg-slate-700/70 hover:bg-slate-600/70 text-white border-slate-600'
                : ''
            }
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Companies
          </Button>
        </div>

        {/* Company Details Card */}
        <Card
          className={`overflow-hidden ${
            theme === 'dark'
              ? 'backdrop-blur-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50'
              : ''
          }`}
        >
          <CardHeader
            className={`${theme === 'dark' ? 'bg-slate-800/50 pb-4' : 'bg-muted/50 pb-4'}`}
          >
            <CardTitle
              className={`text-2xl font-bold tracking-tight ${
                theme === 'dark' ? 'text-white' : ''
              }`}
            >
              {company.CompanyName}
            </CardTitle>
            <div
              className={`flex items-center ${
                theme === 'dark' ? 'text-slate-400' : 'text-muted-foreground'
              }`}
            >
              <Globe className="h-4 w-4 mr-2" />
              <span>{company.domain}</span>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Update the stat cards to match the dashboard's modern style */}
            {/* Replace the existing card grid in the CardContent section with this: */}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div
                className={`rounded-md border p-6 shadow-sm hover:shadow-indigo-500/10 transition-all group ${
                  theme === 'dark'
                    ? 'backdrop-blur-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50'
                    : 'backdrop-blur-md bg-white border-slate-200/70'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Employees
                    </p>
                    <h3
                      className={`text-3xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {company.noofEmployees || '0'}
                    </h3>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/30'
                        : 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-200'
                    } transition-colors`}
                  >
                    <Users className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div
                className={`rounded-md border p-6 shadow-sm hover:shadow-emerald-500/10 transition-all group ${
                  theme === 'dark'
                    ? 'backdrop-blur-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50'
                    : 'backdrop-blur-md bg-white border-slate-200/70'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Admin(s)
                    </p>
                    <h3
                      className={`text-3xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {countAdminUsers()}
                    </h3>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30'
                        : 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200'
                    } transition-colors`}
                  >
                    <UserCog className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div
                className={`rounded-md border p-6 shadow-sm hover:shadow-blue-500/10 transition-all group ${
                  theme === 'dark'
                    ? 'backdrop-blur-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50'
                    : 'backdrop-blur-md bg-white border-slate-200/70'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Office Location(s)
                    </p>
                    <h3
                      className={`text-3xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {countOfficeLocations()}
                    </h3>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-blue-500/20 text-blue-400 group-hover:bg-blue-500/30'
                        : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
                    } transition-colors`}
                  >
                    <Building2 className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div
                className={`rounded-md border p-6 shadow-sm hover:shadow-amber-500/10 transition-all group ${
                  theme === 'dark'
                    ? 'backdrop-blur-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50'
                    : 'backdrop-blur-md bg-white border-slate-200/70'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium mb-1 ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Waste Bins
                    </p>
                    <h3
                      className={`text-3xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-slate-800'
                      }`}
                    >
                      {countWasteBins()}
                    </h3>
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-amber-500/20 text-amber-400 group-hover:bg-amber-500/30'
                        : 'bg-amber-100 text-amber-600 group-hover:bg-amber-200'
                    } transition-colors`}
                  >
                    <Trash2 className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Company Data */}
        <Card
          className={
            theme === 'dark'
              ? 'backdrop-blur-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50'
              : ''
          }
        >
          <CardHeader className="pb-8">
            <Tabs defaultValue="locations" className="w-full">
              <TabsList className={`mb-4 ${theme === 'dark' ? 'bg-slate-800/70' : ''}`}>
                <TabsTrigger
                  value="locations"
                  className={`flex-1 ${
                    theme === 'dark'
                      ? 'data-[state=active]:bg-indigo-600 data-[state=active]:text-white'
                      : ''
                  }`}
                >
                  Office Locations
                </TabsTrigger>
                <TabsTrigger
                  value="users"
                  className={`flex-1 ${
                    theme === 'dark'
                      ? 'data-[state=active]:bg-indigo-600 data-[state=active]:text-white'
                      : ''
                  }`}
                >
                  Admin Users
                </TabsTrigger>
                <TabsTrigger
                  value="bins"
                  className={`flex-1 ${
                    theme === 'dark'
                      ? 'data-[state=active]:bg-indigo-600 data-[state=active]:text-white'
                      : ''
                  }`}
                >
                  Waste Bins
                </TabsTrigger>
              </TabsList>

              {/* Office Locations Tab */}
              <TabsContent value="locations">
                <div className="flex justify-between items-center mb-4">
                  <div className="relative">
                    <Search
                      className={`absolute left-2.5 top-2.5 h-4 w-4 ${
                        theme === 'dark' ? 'text-slate-400' : 'text-muted-foreground'
                      }`}
                    />
                    <Input
                      type="search"
                      placeholder="Search offices..."
                      className={`pl-8 h-9 w-64 ${
                        theme === 'dark'
                          ? 'bg-slate-800/70 border-slate-700 text-white placeholder:text-slate-400'
                          : ''
                      }`}
                      value={searchLocations}
                      onChange={(e) => setSearchLocations(e.target.value)}
                    />
                  </div>
                  <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setSelectedAddress(null);
                          setIsAddressDialogOpen(true);
                        }}
                        size="sm"
                        className={`h-9 ${
                          theme === 'dark'
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Office
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className={
                        theme === 'dark'
                          ? 'backdrop-blur-md bg-slate-800 border-slate-700/50 text-white'
                          : ''
                      }
                    >
                      <DialogHeader>
                        <DialogTitle className={theme === 'dark' ? 'text-white' : ''}>
                          {selectedAddress ? 'Update Office' : 'Add New Office'}
                        </DialogTitle>
                        <DialogDescription className={theme === 'dark' ? 'text-slate-300' : ''}>
                          {selectedAddress
                            ? 'Update the office details.'
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

                {company.branchAddresses &&
                company.branchAddresses.filter((branch) => !branch.isdeleted).length === 0 ? (
                  <div
                    className={`text-center py-12 border rounded-lg ${
                      theme === 'dark' ? 'border-slate-700' : ''
                    }`}
                  >
                    <Building2
                      className={`mx-auto h-12 w-12 ${
                        theme === 'dark' ? 'text-slate-600' : 'text-muted-foreground/50'
                      }`}
                    />
                    <h3
                      className={`mt-4 text-lg font-medium ${theme === 'dark' ? 'text-white' : ''}`}
                    >
                      No office locations found
                    </h3>
                    <p
                      className={`mt-2 text-sm ${
                        theme === 'dark' ? 'text-slate-400' : 'text-muted-foreground'
                      }`}
                    >
                      Add your first office location to get started.
                    </p>
                    <Button
                      onClick={() => {
                        setSelectedAddress(null);
                        setIsAddressDialogOpen(true);
                      }}
                      variant="outline"
                      className={`mt-4 ${
                        theme === 'dark'
                          ? 'bg-slate-700/70 hover:bg-slate-600/70 text-white border-slate-600'
                          : ''
                      }`}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add First Office
                    </Button>
                  </div>
                ) : (
                  <div
                    className={`rounded-md border ${theme === 'dark' ? 'border-slate-700/50' : ''}`}
                  >
                    <Table>
                      <TableHeader
                        className={theme === 'dark' ? 'bg-slate-800/50 text-slate-300' : ''}
                      >
                        <TableRow className={theme === 'dark' ? 'border-slate-700/50' : ''}>
                          <TableHead className="font-medium">Office Name</TableHead>
                          <TableHead className="font-medium">Address</TableHead>
                          <TableHead className="font-medium">City</TableHead>
                          <TableHead className="font-medium">Subdivision</TableHead>
                          <TableHead className="font-medium">Postal Code</TableHead>
                          <TableHead className="font-medium">Country</TableHead>
                          <TableHead className="text-right font-medium">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className={theme === 'dark' ? 'bg-slate-900' : ''}>
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
                            <TableRow
                              key={address._id}
                              className={
                                theme === 'dark'
                                  ? 'border-slate-700/50 hover:bg-slate-800/50'
                                  : 'hover:bg-slate-100/70'
                              }
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <div
                                    className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${
                                      theme === 'dark'
                                        ? 'bg-blue-500/20 text-blue-400'
                                        : 'bg-blue-100 text-blue-600'
                                    }`}
                                  >
                                    <Building2 className="h-4 w-4" />
                                  </div>
                                  {address.officeName}
                                </div>
                              </TableCell>
                              <TableCell>{address.address}</TableCell>
                              <TableCell>{address.city}</TableCell>
                              <TableCell>
                                <span
                                  className={`font-medium ${
                                    theme === 'dark' ? 'text-slate-400' : 'text-muted-foreground'
                                  }`}
                                >
                                  {address.subdivisionType}:
                                </span>{' '}
                                {address.subdivision}
                              </TableCell>
                              <TableCell>{address.postalCode}</TableCell>
                              <TableCell>{address.country}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedAddress(address);
                                      setIsAddressDialogOpen(true);
                                    }}
                                    className={
                                      theme === 'dark' ? 'hover:bg-slate-700/70 text-slate-300' : ''
                                    }
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
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={`text-destructive ${
                                      theme === 'dark' ? 'hover:bg-slate-700/70' : ''
                                    }`}
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
              </TabsContent>

              {/* Admin Users Tab */}
              <TabsContent value="users">
                <div className="flex justify-between items-center mb-4">
                  <div className="relative">
                    <Search
                      className={`absolute left-2.5 top-2.5 h-4 w-4 ${
                        theme === 'dark' ? 'text-slate-400' : 'text-muted-foreground'
                      }`}
                    />
                    <Input
                      type="search"
                      placeholder="Search users..."
                      className={`pl-8 h-9 w-64 ${
                        theme === 'dark'
                          ? 'bg-slate-800/70 border-slate-700 text-white placeholder:text-slate-400'
                          : ''
                      }`}
                      value={searchUsers}
                      onChange={(e) => setSearchUsers(e.target.value)}
                    />
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedUser(null);
                              setIsUserDialogOpen(true);
                            }}
                            className={`h-9 ${
                              theme === 'dark'
                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                            disabled={
                              !company.branchAddresses || company.branchAddresses.length === 0
                            }
                          >
                            <Plus className="mr-2 h-4 w-4" /> Add Admin
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent
                        className={
                          theme === 'dark' ? 'bg-slate-800 text-slate-100 border-slate-700' : ''
                        }
                      >
                        <p>Please add office location first</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Now update the Admin Users table to match the leaderboard style */}
                {/* Replace the existing table in the Admin Users TabsContent with this: */}

                {company.users && company.users.filter((user) => !user.isdeleted).length === 0 ? (
                  <div
                    className={`text-center py-12 border rounded-lg ${
                      theme === 'dark' ? 'border-slate-700' : ''
                    }`}
                  >
                    <UserCog
                      className={`mx-auto h-12 w-12 ${
                        theme === 'dark' ? 'text-slate-600' : 'text-muted-foreground/50'
                      }`}
                    />
                    <h3
                      className={`mt-4 text-lg font-medium ${theme === 'dark' ? 'text-white' : ''}`}
                    >
                      No admin users found
                    </h3>
                    <p
                      className={`mt-2 text-sm ${
                        theme === 'dark' ? 'text-slate-400' : 'text-muted-foreground'
                      }`}
                    >
                      Add your first admin user to manage this company.
                    </p>
                    <Button
                      onClick={() => {
                        setSelectedUser(null);
                        setIsUserDialogOpen(true);
                      }}
                      variant="outline"
                      className={`mt-4 ${
                        theme === 'dark'
                          ? 'bg-slate-700/70 hover:bg-slate-600/70 text-white border-slate-600'
                          : ''
                      }`}
                      disabled={!company.branchAddresses || company.branchAddresses.length === 0}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add First Admin
                    </Button>
                  </div>
                ) : (
                  <div
                    className={`rounded-md border ${theme === 'dark' ? 'border-slate-700/50' : ''}`}
                  >
                    <Table>
                      <TableHeader
                        className={theme === 'dark' ? 'bg-slate-800/50 text-slate-300' : ''}
                      >
                        <TableRow className={theme === 'dark' ? 'border-slate-700/50' : ''}>
                          <TableHead className="font-medium">Full Name</TableHead>
                          <TableHead className="font-medium">Email</TableHead>
                          <TableHead className="font-medium">Admin Level</TableHead>
                          <TableHead className="font-medium">Subdivision</TableHead>
                          <TableHead className="text-right font-medium">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className={theme === 'dark' ? 'bg-slate-900' : ''}>
                        {company.users
                          .filter((user) => !user.isdeleted)
                          .filter(
                            (user) =>
                              user.fullName.toLowerCase().includes(searchUsers.toLowerCase()) ||
                              user.email.toLowerCase().includes(searchUsers.toLowerCase()) ||
                              user.role.toLowerCase().includes(searchUsers.toLowerCase()),
                          )
                          .map((user) => (
                            <TableRow
                              key={user._id}
                              className={
                                theme === 'dark'
                                  ? 'border-slate-700/50 hover:bg-slate-800/50'
                                  : 'hover:bg-slate-100/70'
                              }
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  <div
                                    className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 ${
                                      theme === 'dark'
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-emerald-100 text-emerald-600'
                                    }`}
                                  >
                                    <UserCog className="h-4 w-4" />
                                  </div>
                                  {user.fullName}
                                </div>
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              {/* Update the Badge in the Admin Users table */}
                              {/* Find the line with the Badge component in the Admin Users table and replace it with: */}
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={getRoleBadgeClass(user.role, theme)}
                                >
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell>{ user.OrgUnit?.name || 'N/A'}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsUserDialogOpen(true);
                                  }}
                                  className={
                                    theme === 'dark' ? 'hover:bg-slate-700/70 text-slate-300' : ''
                                  }
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
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Waste Bins Tab */}
              </TabsContent>

              {/* Waste Bins Tab */}
              <TabsContent value="bins">
                <div className="mb-4">
                  <div className="relative">
                    <Search
                      className={`absolute left-2.5 top-2.5 h-4 w-4 ${
                        theme === 'dark' ? 'text-slate-400' : 'text-muted-foreground'
                      }`}
                    />
                    <Input
                      type="search"
                      placeholder="Search bins..."
                      className={`pl-8 h-9 w-64 ${
                        theme === 'dark'
                          ? 'bg-slate-800/70 border-slate-700 text-white placeholder:text-slate-400'
                          : ''
                      }`}
                      value={searchBins}
                      onChange={(e) => setSearchBins(e.target.value)}
                    />
                  </div>
                </div>

                {company.branchAddresses &&
                company.branchAddresses.filter((branch) => branch.isdeleted === false).length ===
                  0 ? (
                  <div
                    className={`text-center py-12 border rounded-lg ${
                      theme === 'dark' ? 'border-slate-700' : ''
                    }`}
                  >
                    <Trash2
                      className={`mx-auto h-12 w-12 ${
                        theme === 'dark' ? 'text-slate-600' : 'text-muted-foreground/50'
                      }`}
                    />
                    <h3
                      className={`mt-4 text-lg font-medium ${theme === 'dark' ? 'text-white' : ''}`}
                    >
                      No waste bins found
                    </h3>
                    <p
                      className={`mt-2 text-sm ${
                        theme === 'dark' ? 'text-slate-400' : 'text-muted-foreground'
                      }`}
                    >
                      Add an office location first, then you can add waste bins.
                    </p>
                    <Button
                      onClick={() => {
                        setSelectedAddress(null);
                        setIsAddressDialogOpen(true);
                      }}
                      variant="outline"
                      className={`mt-4 ${
                        theme === 'dark'
                          ? 'bg-slate-700/70 hover:bg-slate-600/70 text-white border-slate-600'
                          : ''
                      }`}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Office First
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {company.branchAddresses
                      .filter((branch) => !branch.isdeleted)
                      .filter(
                        (branch) =>
                          branch.officeName.toLowerCase().includes(searchBins.toLowerCase()) ||
                          (branch.address &&
                            branch.address.toLowerCase().includes(searchBins.toLowerCase())) ||
                          (branch.dustbins &&
                            branch.dustbins.some((bin) =>
                              bin.dustbinType.toLowerCase().includes(searchBins.toLowerCase()),
                            )),
                      )
                      .map((branch) => (
                        <div
                          key={branch._id}
                          className={`rounded-md border p-6 shadow-sm hover:shadow-indigo-500/10 transition-all ${
                            theme === 'dark'
                              ? 'backdrop-blur-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50'
                              : 'backdrop-blur-md bg-white border-slate-200/70'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3
                                className={`text-lg font-semibold ${
                                  theme === 'dark' ? 'text-white' : 'text-slate-800'
                                }`}
                              >
                                {branch.officeName}
                              </h3>

                              <div
                                className={`flex items-center mb-2 mt-2 ${
                                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                                }`}
                              >
                                <MapPin size={16} className="mr-2 flex-shrink-0" />
                                <span className="text-sm">
                                  {branch.address}, {branch.city}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {(!branch.dustbins || branch.dustbins.length === 0) && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => {
                                          // Store the selected branch for the dialog
                                          setSelectedAddress(branch);
                                          setIsDustbinDialogOpen(true);
                                        }}
                                        className={`h-9 w-9 ${
                                          theme === 'dark'
                                            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 hover:text-emerald-300'
                                            : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                                        } transition-colors`}
                                      >
                                        <Plus className="h-5 w-5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent
                                      className={
                                        theme === 'dark'
                                          ? 'bg-slate-800 text-slate-100 border-slate-700'
                                          : ''
                                      }
                                    >
                                      <p>Add bins to this location</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              <div
                                className={`p-3 rounded-lg ${
                                  theme === 'dark'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-blue-100 text-blue-600'
                                } transition-colors`}
                              >
                                <Building2 className="h-5 w-5" />
                              </div>
                            </div>
                          </div>

                          {branch.dustbins && branch.dustbins.length > 0 ? (
                            <div className="mt-4">
                              <p
                                className={`text-sm font-medium mb-2 ${
                                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                                }`}
                              >
                                Bin Configuration
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {branch.dustbins.map((bin, index) => {
                                  const badgeStyle = getBinTypeBadgeStyle(bin.dustbinType);
                                  return (
                                    <Badge key={index} variant="outline" className={badgeStyle}>
                                      {bin.dustbinType} ({bin.binCapacity}L)
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div
                              className={`mt-4 text-sm ${
                                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                              }`}
                            >
                              No bins configured for this location
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>

        {/* Dialogs Section */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent
            className={`sm:max-w-md ${
              theme === 'dark' ? 'backdrop-blur-md bg-slate-800 border-slate-700/50 text-white' : ''
            }`}
          >
            <UserForm
              onSubmit={selectedUser ? editUser : addUser}
              branches={branchOptions}
              companyId={id}
              initialData={selectedUser}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isDustbinDialogOpen} onOpenChange={setIsDustbinDialogOpen}>
          <DialogContent
            className={
              theme === 'dark' ? 'backdrop-blur-md bg-slate-800 border-slate-700/50 text-white' : ''
            }
          >
            <AddBinsForm branches={branchOptions} onDustbinAdded={handleDustbinAdded} />
          </DialogContent>
        </Dialog>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent
            className={`sm:max-w-md ${
              theme === 'dark' ? 'backdrop-blur-md bg-slate-800 border-slate-700/50 text-white' : ''
            }`}
          >
            <DialogHeader>
              <DialogTitle className={theme === 'dark' ? 'text-white' : ''}>
                Confirm Deletion
              </DialogTitle>
              <DialogDescription className={theme === 'dark' ? 'text-slate-300' : ''}>
                Are you sure you want to delete{' '}
                <span className="font-semibold text-destructive">
                  {selectedAddress?.officeName}
                </span>{' '}
                office location? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                className={
                  theme === 'dark'
                    ? 'bg-slate-700/70 hover:bg-slate-600/70 text-white border-slate-600'
                    : ''
                }
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDeleteAddress}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`p-4 rounded-lg shadow-sm max-w-xs toast-item pointer-events-auto ${
              toast.type === TOAST_TYPES.SUCCESS
                ? 'bg-green-100 border-l-4 border-green-500'
                : toast.type === TOAST_TYPES.ERROR
                ? 'bg-red-100 border-l-4 border-red-500'
                : toast.type === TOAST_TYPES.WARNING
                ? 'bg-amber-100 border-l-4 border-amber-500'
                : 'bg-indigo-100 border-l-4 border-indigo-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4
                  className={`font-medium text-sm ${
                    toast.type === TOAST_TYPES.SUCCESS
                      ? 'text-green-800'
                      : toast.type === TOAST_TYPES.ERROR
                      ? 'text-red-800'
                      : toast.type === TOAST_TYPES.WARNING
                      ? 'text-amber-800'
                      : 'text-indigo-800'
                  }`}
                >
                  {toast.title}
                </h4>
                <p
                  className={`text-xs mt-1 ${
                    toast.type === TOAST_TYPES.SUCCESS
                      ? 'text-green-600'
                      : toast.type === TOAST_TYPES.ERROR
                      ? 'text-red-600'
                      : toast.type === TOAST_TYPES.WARNING
                      ? 'text-amber-600'
                      : 'text-indigo-600'
                  }`}
                >
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Inline CSS for animations */}
      <style jsx>{`
        @keyframes toast-enter {
          from {
            transform: translateX(100%) translateY(10%);
            opacity: 0;
          }
          to {
            transform: translateX(0) translateY(0);
            opacity: 1;
          }
        }

        @keyframes toast-exit {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        .toast-item {
          animation: toast-enter 0.35s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
          transform-origin: top right;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .toast-item.removing {
          animation: toast-exit 0.4s cubic-bezier(0.06, 0.71, 0.55, 1) forwards;
        }
      `}</style>
    </div>
  );
}
