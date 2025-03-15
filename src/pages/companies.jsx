'use client';

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Custom UI components and icons
import SideMenu from '../components/layouts/SideMenu';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader } from '../components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/Table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/Dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/Tabs';
import AddCompanyForm from '../components/ui/CompanyForm';
import {
  Plus,
  Search,
  Download,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Globe,
  Briefcase,
} from 'lucide-react';

export default function Company() {
  // ---------------------- State Variables ---------------------- //

  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [userCurrentPage, setUserCurrentPage] = useState(1);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Items per page for companies and users
  const itemsPerPage = 10;
  const userItemsPerPage = 15;

  // React Router navigation hook
  const navigate = useNavigate();

  // ---------------------- Data Fetching ---------------------- //

  useEffect(() => {
    // Fetch companies from the API and handle unauthorized access by redirecting to login
    const fetchCompanies = async () => {
      try {
        const response = await axios.get('/api/v1/company/getCompany', {
          withCredentials: true,
        });
        setCompanies(response.data.data);
      } catch (error) {
        // Log error in development only; consider using a logging library in production
        console.error('Error fetching companies:', error);
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      }
    };

    // Fetch users from the API
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/api/v1/users/all-users');
        setUsers(response.data.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchCompanies();
    fetchUsers();
  }, [navigate]);

  // ---------------------- Data Filtering & Pagination ---------------------- //

  // Filter companies based on search term (case-insensitive)
  const filteredCompanies = useMemo(() => {
    return companies.filter(
      (company) =>
        company.CompanyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.domain.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [companies, searchTerm]);

  // Filter users based on search term (case-insensitive)
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (user.company?.CompanyName || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (user.branchAddress?.officeName || '').toLowerCase().includes(userSearchTerm.toLowerCase()),
    );
  }, [users, userSearchTerm]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const userTotalPages = Math.ceil(filteredUsers.length / userItemsPerPage);

  // Paginate companies list
  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCompanies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCompanies, currentPage]);

  // Paginate users list
  const paginatedUsers = useMemo(() => {
    const startIndex = (userCurrentPage - 1) * userItemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + userItemsPerPage);
  }, [filteredUsers, userCurrentPage]);

  // ---------------------- Event Handlers ---------------------- //

  // Handle company search input
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  // Handle user search input
  const handleUserSearch = (event) => {
    setUserSearchTerm(event.target.value);
    setUserCurrentPage(1);
  };

  // Toggle sort order based on column key
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    // Sort companies without directly mutating the state
    const sortedCompanies = [...companies].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setCompanies(sortedCompanies);
  };

  // Prepare deletion of a company and open the confirmation dialog
  const handleDelete = (company) => {
    setCompanyToDelete(company);
    setIsDeleteDialogOpen(true);
  };

  // Confirm deletion after API call
  const confirmDelete = async () => {
    try {
      await axios.post('/api/v1/company/deleteCompany', {
        domain: companyToDelete.domain,
      });
      setCompanies(companies.filter((c) => c.domain !== companyToDelete.domain));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting company:', error);
    }
  };

  /**
   * Handle adding a new company from the form.
   * @param {Object} companyData - New company details.
   */
  const handleAddCompany = async (companyData) => {
    if (companyData.CompanyName && companyData.domain) {
      try {
        const response = await axios.post('/api/v1/company/addCompany', {
          CompanyName: companyData.CompanyName,
          domain: companyData.domain,
          noofEmployees: companyData.noofEmployees,
          industry: companyData.industry,
        });
        setCompanies([...companies, response.data.data]);
        setIsAddDialogOpen(false);
      } catch (error) {
        if (error.response && error.response.status === 409) {
          alert('Company already exists!');
        } else {
          console.error('Error adding company:', error);
        }
      }
    } else {
      alert('Company name and domain are required!');
    }
  };

  // Utility function to export data to CSV format
  const exportToCSV = (data, filename) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const csvContent = [headers, ...data.map((item) => Object.values(item).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Navigate to detailed view for a selected company
  const handleViewDetails = (id) => {
    navigate(`/company/${id}`);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // ---------------------- Component Render ---------------------- //

  return (
    <div className="flex h-screen bg-[#F9FAFB]">
      {/* Side navigation */}
      <SideMenu />

      <div className="flex-1 p-6 overflow-auto space-y-6">
        {/* Page Title */}
        {/* <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-slate-800">Companies Management</h1>
        </div> */}

        {/* Tabs for switching between Companies and Users */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <Tabs defaultValue="companies" className="w-full">
              <TabsList className="mb-2 bg-slate-100">
                <TabsTrigger value="companies" className="flex-1 data-[state=active]:bg-white">
                  Companies
                </TabsTrigger>
                <TabsTrigger value="users" className="flex-1 data-[state=active]:bg-white">
                  Users
                </TabsTrigger>
              </TabsList>

              {/* Companies Tab */}
              <TabsContent value="companies">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-4">
                    {/* Company search input */}
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search companies..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="pl-8 h-9 w-64"
                      />
                    </div>
                    {/* CSV Export button */}
                    <Button
                      onClick={() => exportToCSV(companies, 'companies.csv')}
                      variant="outline"
                      size="sm"
                      className="h-9"
                    >
                      <Download className="mr-2 h-4 w-4" /> Export CSV
                    </Button>
                  </div>

                  {/* Dialog for adding a new company */}
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-primary hover:bg-primary/90 text-white h-9">
                        <Plus className="mr-2 h-4 w-4" /> Add Company
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-2xl p-0">
                      <AddCompanyForm onCompanyAdded={handleAddCompany} />
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Companies Table */}
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="w-[80px] font-medium text-slate-700">
                          Sl. No
                        </TableHead>
                        <TableHead className="font-medium text-slate-700">Company</TableHead>
                        <TableHead
                          className="cursor-pointer font-medium text-slate-700"
                          onClick={() => handleSort('domain')}
                        >
                          Domain{' '}
                          {sortConfig.key === 'domain'
                            ? sortConfig.direction === 'asc'
                              ? '▲'
                              : '▼'
                            : ''}
                        </TableHead>
                        <TableHead
                          className="cursor-pointer font-medium text-slate-700"
                          onClick={() => handleSort('noofEmployees')}
                        >
                          Employees{' '}
                          {sortConfig.key === 'noofEmployees'
                            ? sortConfig.direction === 'asc'
                              ? '▲'
                              : '▼'
                            : ''}
                        </TableHead>
                        <TableHead className="font-medium text-slate-700">Industry</TableHead>
                        <TableHead
                          className="cursor-pointer font-medium text-slate-700"
                          onClick={() => handleSort('createdAt')}
                        >
                          Created{' '}
                          {sortConfig.key === 'createdAt'
                            ? sortConfig.direction === 'asc'
                              ? '▲'
                              : '▼'
                            : ''}
                        </TableHead>
                        <TableHead className="text-right font-medium text-slate-700">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCompanies.map((company, index) => (
                        <TableRow key={company._id}>
                          <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 text-primary">
                                <Building2 className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="font-medium">{company.CompanyName}</div>
                                <div className="text-xs text-muted-foreground">{company._id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 text-muted-foreground mr-2" />
                              {company.domain}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 text-muted-foreground mr-2" />
                              {company.noofEmployees || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Briefcase className="h-4 w-4 text-muted-foreground mr-2" />
                              {company.industry || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                              {formatDate(company.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-1">
                              <Button
                                size="sm"
                                className="h-8 text-blue-600 bg-slate-50 hover:bg-slate-100"
                                onClick={() => handleViewDetails(company._id)}
                              >
                                View
                              </Button>
                              <Button
                                size="sm"
                                className="h-8 text-red-600 bg-slate-50 hover:bg-slate-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(company);
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls for Companies */}
                <div className="flex justify-between items-center mt-4 py-2">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredCompanies.length)} of{' '}
                    {filteredCompanies.length} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show pages around current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`h-8 w-8 p-0 ${
                            currentPage === pageNum ? 'bg-primary text-white' : ''
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users">
                <div className="flex justify-between items-center mb-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search users..."
                      value={userSearchTerm}
                      onChange={handleUserSearch}
                      className="pl-8 h-9 w-64"
                    />
                  </div>
                  <Button
                    onClick={() => exportToCSV(users, 'users.csv')}
                    variant="outline"
                    size="sm"
                    className="h-9"
                  >
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                  </Button>
                </div>

                {/* Users Table */}
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead className="w-[80px] font-medium text-slate-700">
                          Sl. No
                        </TableHead>
                        <TableHead className="font-medium text-slate-700">Full Name</TableHead>
                        <TableHead className="font-medium text-slate-700">Email</TableHead>
                        <TableHead className="font-medium text-slate-700">Role</TableHead>
                        <TableHead className="font-medium text-slate-700">Phone</TableHead>
                        <TableHead className="font-medium text-slate-700">Branch</TableHead>
                        <TableHead className="font-medium text-slate-700">Company</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedUsers.map((user, index) => (
                        <TableRow key={user._id}>
                          <TableCell>
                            {(userCurrentPage - 1) * userItemsPerPage + index + 1}
                          </TableCell>
                          <TableCell className="font-medium">{user.fullName}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {user.role}
                            </span>
                          </TableCell>
                          <TableCell>{user.phone || 'N/A'}</TableCell>
                          <TableCell>{user.branchAddress?.officeName || 'N/A'}</TableCell>
                          <TableCell>{user.company?.CompanyName || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls for Users */}
                <div className="flex justify-between items-center mt-4 py-2">
                  <div className="text-sm text-muted-foreground">
                    Showing {(userCurrentPage - 1) * userItemsPerPage + 1} to{' '}
                    {Math.min(userCurrentPage * userItemsPerPage, filteredUsers.length)} of{' '}
                    {filteredUsers.length} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUserCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={userCurrentPage === 1}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(5, userTotalPages) }, (_, i) => {
                      // Show pages around current page
                      let pageNum;
                      if (userTotalPages <= 5) {
                        pageNum = i + 1;
                      } else if (userCurrentPage <= 3) {
                        pageNum = i + 1;
                      } else if (userCurrentPage >= userTotalPages - 2) {
                        pageNum = userTotalPages - 4 + i;
                      } else {
                        pageNum = userCurrentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={userCurrentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setUserCurrentPage(pageNum)}
                          className={`h-8 w-8 p-0 ${
                            userCurrentPage === pageNum ? 'bg-primary text-white' : ''
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setUserCurrentPage((prev) => Math.min(prev + 1, userTotalPages))
                      }
                      disabled={userCurrentPage === userTotalPages}
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardHeader>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white rounded-lg shadow-lg max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-bold text-red-600">{companyToDelete?.CompanyName}</span>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
