'use client';

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Download, Search, User } from 'lucide-react';
import { useTheme } from '@/components/ui/theme-provider';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import LoadingSpinner from '@/components/ui/Spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/badge';

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

export default function UserLogs() {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('/api/v1/users/all-users');
        setUsers(response.data.data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError('Failed to load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.company?.CompanyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.branchAddress?.officeName || '').toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [users, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

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
        <div className="flex justify-between items-center"></div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle></CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-4">
              <div className="relative">
                <Search
                  className={`absolute left-2.5 top-2.5 h-4 w-4 ${
                    theme === 'dark' ? 'text-slate-400' : 'text-muted-foreground'
                  }`}
                />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`pl-8 h-9 w-64 ${
                    theme === 'dark'
                      ? 'bg-slate-800/70 border-slate-700 text-white placeholder:text-slate-400'
                      : ''
                  }`}
                />
              </div>
              <Button
                onClick={() => exportToCSV(users, 'users.csv')}
                variant="outline"
                size="sm"
                className={`h-9 ${
                  theme === 'dark'
                    ? 'bg-slate-700/70 hover:bg-slate-600/70 text-white border-slate-600'
                    : ''
                }`}
                disabled={filteredUsers.length === 0}
              >
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            </div>
            <div className={`rounded-md border ${theme === 'dark' ? 'border-slate-700/50' : ''}`}>
              <Table>
                <TableHeader className={theme === 'dark' ? 'bg-slate-800/50 text-slate-300' : ''}>
                  <TableRow className={theme === 'dark' ? 'border-slate-700/50' : ''}>
                    <TableHead className="w-[80px] font-medium">Sl. No</TableHead>
                    <TableHead className="font-medium">Full Name</TableHead>
                    <TableHead className="font-medium">Email</TableHead>
                    <TableHead className="font-medium">Role</TableHead>
                    <TableHead className="font-medium">Phone</TableHead>
                    <TableHead className="font-medium">Branch</TableHead>
                    <TableHead className="font-medium">Company</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className={theme === 'dark' ? 'bg-slate-900' : ''}>
                  {paginatedUsers.length === 0 ? (
                    <TableRow className={theme === 'dark' ? 'border-slate-700/50' : ''}>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedUsers.map((user, index) => (
                      <TableRow
                        key={user._id}
                        className={
                          theme === 'dark'
                            ? 'border-slate-700/50 hover:bg-slate-800/50'
                            : 'hover:bg-slate-100/50'
                        }
                      >
                        <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div
                              className={`flex items-center justify-center h-8 w-8 rounded-full ${
                                theme === 'dark'
                                  ? 'bg-indigo-500/20 text-indigo-400'
                                  : 'bg-indigo-100 text-indigo-600'
                              }`}
                            >
                              <User className="h-4 w-4" />
                            </div>
                            <span className="font-medium">{user.fullName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getRoleBadgeClass(user.role, theme)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.phone || 'N/A'}</TableCell>
                        <TableCell>{user.branchAddress?.officeName || 'N/A'}</TableCell>
                        <TableCell>{user.company?.CompanyName || 'N/A'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 py-2">
                <div
                  className={`text-sm ${
                    theme === 'dark' ? 'text-slate-400' : 'text-muted-foreground'
                  }`}
                >
                  Showing {filteredUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{' '}
                  {filteredUsers.length} results
                </div>
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
                            ? 'bg-indigo-600 text-primary-foreground'
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
