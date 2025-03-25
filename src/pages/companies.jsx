'use client';

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '@/components/ui/theme-provider';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Download,
  Globe,
  Plus,
  Search,
  Users,
  Briefcase,
  Calendar,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Badge } from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/Spinner';
import AddCompanyForm from '@/components/ui/CompanyForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';

export default function Companies() {
  const { theme } = useTheme();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const itemsPerPage = 10;
  const navigate = useNavigate();

  // Fetch companies from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const companiesResponse = await axios.get('/api/v1/company/getCompany', {
          withCredentials: true,
        });
        setCompanies(companiesResponse.data.data);
      } catch (error) {
        console.error('Error fetching companies:', error);
        setError('Failed to load data. Please try again.');
        if (error.response && error.response.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  // Filter companies based on search term
  const filteredCompanies = useMemo(() => {
    return companies.filter(
      (company) =>
        company.CompanyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }, [companies, searchTerm]);

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCompanies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCompanies, currentPage]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    const sortedCompanies = [...companies].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setCompanies(sortedCompanies);
  };

  const handleDelete = (company) => {
    setCompanyToDelete(company);
    setIsDeleteDialogOpen(true);
  };

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

  const handleViewDetails = (id) => {
    navigate(`/company/${id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

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
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50'}`}
    >
      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card
          className={`rounded-md ${
            theme === 'dark'
              ? 'backdrop-blur-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50'
              : 'backdrop-blur-md bg-white border-slate-200/70'
          }`}
        >
          <CardHeader>
            <CardTitle></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search
                    className={`absolute left-2.5 top-2.5 h-4 w-4 ${
                      theme === 'dark' ? 'text-slate-400' : 'text-muted-foreground'
                    }`}
                  />
                  <Input
                    type="text"
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className={`pl-8 h-9 w-64 ${
                      theme === 'dark'
                        ? 'bg-slate-800/70 border-slate-700 text-white placeholder:text-slate-400'
                        : ''
                    }`}
                  />
                </div>
                <Button
                  onClick={() => exportToCSV(companies, 'companies.csv')}
                  variant="outline"
                  size="sm"
                  className={`h-9 ${
                    theme === 'dark'
                      ? 'bg-slate-700/70 hover:bg-slate-600/70 text-white border-slate-600'
                      : ''
                  }`}
                >
                  <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className={`h-9 ${
                      theme === 'dark'
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Company
                  </Button>
                </DialogTrigger>
                <DialogContent
                  className={`${theme === 'dark' ? 'bg-slate-800 border-slate-700/50' : ''} p-0`}
                >
                  <div className="sr-only">
                    <DialogTitle>Add Company</DialogTitle>
                    <DialogDescription>Some desc</DialogDescription>
                  </div>
                  <div style={{ overflow: 'visible' }}>
                    <AddCompanyForm onCompanyAdded={handleAddCompany} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div
              className={`rounded-md overflow-hidden ${
                theme === 'dark' ? 'border border-slate-700/50' : 'border-slate-200'
              }`}
            >
              <Table>
                <TableHeader
                  className={
                    theme === 'dark'
                      ? 'bg-slate-800/50 text-slate-300'
                      : 'bg-slate-50 text-slate-800'
                  }
                >
                  <TableRow className={theme === 'dark' ? 'border-slate-700/50' : ''}>
                    <TableHead className="w-[80px] font-medium">Sl. No</TableHead>
                    <TableHead className="font-medium">Company</TableHead>
                    <TableHead
                      className="cursor-pointer font-medium"
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
                      className="cursor-pointer font-medium"
                      onClick={() => handleSort('noofEmployees')}
                    >
                      Employees{' '}
                      {sortConfig.key === 'noofEmployees'
                        ? sortConfig.direction === 'asc'
                          ? '▲'
                          : '▼'
                        : ''}
                    </TableHead>
                    <TableHead className="font-medium">Industry</TableHead>
                    <TableHead
                      className="cursor-pointer font-medium"
                      onClick={() => handleSort('createdAt')}
                    >
                      Created{' '}
                      {sortConfig.key === 'createdAt'
                        ? sortConfig.direction === 'asc'
                          ? '▲'
                          : '▼'
                        : ''}
                    </TableHead>
                    <TableHead className="text-right font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className={theme === 'dark' ? 'bg-slate-900' : 'bg-white'}>
                  {paginatedCompanies.length === 0 ? (
                    <TableRow className={theme === 'dark' ? 'border-slate-700/50' : ''}>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No companies found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCompanies.map((company, index) => (
                      <TableRow
                        key={company._id}
                        className={
                          theme === 'dark'
                            ? 'cursor-pointer border-slate-700/50 hover:bg-slate-800/50'
                            : 'cursor-pointer hover:bg-slate-100/50'
                        }
                        onClick={() => handleViewDetails(company._id)}
                      >
                        <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div
                              className={`flex items-center justify-center h-9 w-9 rounded-full ${
                                theme === 'dark'
                                  ? 'bg-indigo-500/20 text-indigo-400'
                                  : 'bg-indigo-100 text-indigo-600'
                              }`}
                            >
                              <Building2 className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-medium">{company.CompanyName}</div>
                              <div
                                className={`text-xs ${
                                  theme === 'dark' ? 'text-slate-400' : 'text-muted-foreground'
                                }`}
                              >
                                {company._id}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Globe
                              className={`h-4 w-4 mr-2 ${
                                theme === 'dark' ? 'text-slate-400' : 'text-muted-foreground'
                              }`}
                            />
                            {company.domain}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users
                              className={`h-4 w-4 mr-2 ${
                                theme === 'dark' ? 'text-slate-400' : 'text-muted-foreground'
                              }`}
                            />
                            {company.noofEmployees || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Briefcase
                              className={`h-4 w-4 mr-2 ${
                                theme === 'dark' ? 'text-slate-400' : 'text-muted-foreground'
                              }`}
                            />
                            {company.industry ? (
                              <Badge
                                variant="outline"
                                className={
                                  theme === 'dark' ? 'border-slate-600 bg-slate-800/50' : ''
                                }
                              >
                                {company.industry}
                              </Badge>
                            ) : (
                              'N/A'
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar
                              className={`h-4 w-4 mr-2 ${
                                theme === 'dark' ? 'text-slate-400' : 'text-muted-foreground'
                              }`}
                            />
                            {formatDate(company.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className={`h-8 ${
                                theme === 'dark'
                                  ? 'bg-slate-700/70 hover:bg-slate-600/70 text-white border-slate-600'
                                  : ''
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(company._id);
                              }}
                            >
                              View
                            </Button>
                            {/* <Button
                              size="sm"
                              variant="destructive"
                              className="h-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(company);
                              }}
                            >
                              Delete
                            </Button> */}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-between items-center mt-4 py-2">
              <div
                className={`text-sm ${
                  theme === 'dark' ? 'text-slate-400' : 'text-muted-foreground'
                }`}
              >
                Showing {filteredCompanies.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredCompanies.length)} of{' '}
                {filteredCompanies.length} results
              </div>
              {totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`h-8 w-8 p-0 ${
                      theme === 'dark'
                        ? 'bg-slate-700/70 hover:bg-slate-600/70 text-white border-slate-600'
                        : ''
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                          currentPage === pageNum
                            ? 'bg-indigo-600 text-primary-foreground hover:bg-indigo-700'
                            : theme === 'dark'
                            ? 'bg-slate-700/70 hover:bg-slate-600/70 text-white border-slate-600'
                            : ''
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
                    className={`h-8 w-8 p-0 ${
                      theme === 'dark'
                        ? 'bg-slate-700/70 hover:bg-slate-600/70 text-white border-slate-600'
                        : ''
                    }`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
