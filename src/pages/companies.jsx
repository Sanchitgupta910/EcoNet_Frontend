import { useState, useEffect } from "react";
import axios from "axios";
import SideMenu from "../components/layouts/side-menu";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router-dom";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { 
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "../components/ui/tabs";
import { Label } from "../components/ui/label";
import { MoreVertical, Plus, Search, Download } from 'lucide-react';

export default function Company() {
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [users, setUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userCurrentPage, setUserCurrentPage] = useState(1);

  const [newCompany, setNewCompany] = useState({
    CompanyName: "",
    domain: "",
    noofEmployees: "",
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const itemsPerPage = 10;
  const userItemsPerPage = 15;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get("/api/v1/company/getCompany", {withCredentials: true});
        setCompanies(response.data.data);
      } catch (error) {
        console.error("Error fetching companies!!!", error);
        if (error.response && error.response.status === 401){
          navigate("/login")
        }
      }
    };
    
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/v1/users/all-users");
        setUsers(response.data.data);
      } catch (error) {
        console.error("Error fetching list of users!!!", error);
      }
    };

    fetchCompanies();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!isAddDialogOpen) {
      setNewCompany({ CompanyName: "", domain: "", noofEmployees: "" });
    }
  }, [isAddDialogOpen]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedCompanies = [...companies].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setCompanies(sortedCompanies);
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.CompanyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (user.company?.CompanyName || "").toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      (user.branchAddress?.branchName || "").toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const userTotalPages = Math.ceil(filteredUsers.length / userItemsPerPage);
  
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const paginatedUsers = filteredUsers.slice(
    (userCurrentPage - 1) * userItemsPerPage,
    userCurrentPage * userItemsPerPage
  );

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleUserSearch = (event) => {
    setUserSearchTerm(event.target.value);
    setUserCurrentPage(1);
  };

  const handleDelete = (company) => {
    setCompanyToDelete(company);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.post("/api/v1/company/deleteCompany", {
        domain: companyToDelete.domain,
      });
      setCompanies(companies.filter((c) => c.domain !== companyToDelete.domain));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  };

  const handleAddCompany = async () => {
    if (newCompany.CompanyName && newCompany.domain) {
      try {
        const response = await axios.post("/api/v1/company/addCompany", {
          CompanyName: newCompany.CompanyName,
          domain: newCompany.domain,
          noofEmployees: newCompany.noofEmployees,
        });
        setCompanies([...companies, response.data.data]);
        setNewCompany({ CompanyName: "", domain: "", noofEmployees: "" });
        setIsAddDialogOpen(false);
      } catch (error) {
        if (error.response && error.response.status === 409) {
          alert("Company already exists!");
        } else {
          console.error("Error adding company:", error);
        }
      }
    } else {
      alert("Company name and domain are required!");
    }
  };

  const exportToCSV = (data, filename) => {
    const headers = Object.keys(data[0]).join(",");
    const csvContent = [
      headers,
      ...data.map((item) => Object.values(item).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleViewDetails = (id) => {
    navigate(`/company/${id}`);
  };

  return (
    <div className="flex h-screen">
      <SideMenu />

      <div className="flex-1 p-10 overflow-auto">
        <Tabs defaultValue="companies" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="companies" className="flex-1">Companies</TabsTrigger>
            <TabsTrigger value="users" className="flex-1">Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="companies">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="pl-8 pr-4 py-2 w-64"
                  />
                </div>
                <Button
                  onClick={() => exportToCSV(companies, "companies.csv")}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#2c7be5] hover:bg-[#1a68d1] text-white">
                    <Plus className="mr-2 h-4 w-4" /> New
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Company</DialogTitle>
                    <DialogDescription>
                      Enter the details of the new company here. Click save when you're done.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="CompanyName" className="text-right">
                        Name
                      </Label>
                      <Input
                        placeholder="Company Name"
                        id="CompanyName"
                        value={newCompany.CompanyName}
                        onChange={(e) =>
                          setNewCompany({ ...newCompany, CompanyName: e.target.value })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="domain" className="text-right">
                        Domain
                      </Label>
                      <Input
                        placeholder="Company's website"
                        id="domain"
                        value={newCompany.domain}
                        onChange={(e) =>
                          setNewCompany({ ...newCompany, domain: e.target.value })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="noofEmployees" className="text-right">
                        Employees
                      </Label>
                      <Input
                        placeholder="Number of employees"
                        id="noofEmployees"
                        type="number"
                        value={newCompany.noofEmployees}
                        onChange={(e) =>
                          setNewCompany({ ...newCompany, noofEmployees: e.target.value })
                        }
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="bg-[#2c7be5] hover:bg-[#1a68d1] text-white" onClick={handleAddCompany}>
                      Save
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-[#f8f8f8] transition-colors">
                  <TableRow>
                    <TableHead className="w-[100px]">Sl. No</TableHead>
                    <TableHead className="cursor-pointer">_id</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("CompanyName")}>
                      Company Name {sortConfig.key === "CompanyName" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("domain")}>
                      Domain {sortConfig.key === "domain" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("noofEmployees")}>
                      Employees {sortConfig.key === "noofEmployees" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("createdAt")}>
                      Created at {sortConfig.key === "createdAt" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCompanies.map((company, index) => (
                    <TableRow key={company._id} className="hover:bg-[#fafafa] transition-colors">
                      <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                      <TableCell>{company._id}</TableCell>
                      <TableCell>{company.CompanyName}</TableCell>
                      <TableCell>{company.domain}</TableCell>
                      <TableCell>{company.noofEmployees}</TableCell>
                      <TableCell>{company.createdAt}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(company._id)}>
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(company)} className="text-red-600">
                              Delete record
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCompanies.length)} of {filteredCompanies.length} results
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}
                        className="bg-[#2c7be5] hover:bg-[#1a68d1] text-white">
                  Previous
                </Button>
                <Button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="bg-[#2c7be5] hover:bg-[#1a68d1] text-white">
                  Next
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="flex justify-between items-center mb-6">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={userSearchTerm}
                  onChange={handleUserSearch}
                  className="pl-8 pr-4 py-2 w-64"
                />
              </div>
              <Button
                onClick={() => exportToCSV(users, "users.csv")}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden mb-8">
              <Table>
                <TableHeader className="bg-[#f8f8f8] transition-colors">
                  <TableRow>
                    <TableHead className="w-[100px]">Sl. No</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Company</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user, index) => (
                    <TableRow key={user._id} className="hover:bg-[#fafafa] transition-colors">
                      <TableCell>{(userCurrentPage - 1) * userItemsPerPage + index + 1}</TableCell>
                      <TableCell>{user._id}</TableCell>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>{user.branchAddress?.branchName || "N/A"}</TableCell>
                      <TableCell>{user.company?.CompanyName || "N/A"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>      

            <div className="flex justify-between items-center mt-4">
              <div>
                Showing {(userCurrentPage - 1) * userItemsPerPage + 1} to {Math.min(userCurrentPage * userItemsPerPage, filteredUsers.length)} of {filteredUsers.length} results
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setUserCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={userCurrentPage === 1}
                        className="bg-[#2c7be5] hover:bg-[#1a68d1] text-white">
                  Previous
                </Button>
                <Button onClick={() => setUserCurrentPage((prev) => Math.min(prev + 1, userTotalPages))}
                        disabled={userCurrentPage === userTotalPages}
                        className="bg-[#2c7be5] hover:bg-[#1a68d1] text-white">
                  Next
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-bold">{companyToDelete?.CompanyName}</span>? This action cannot be undone.
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

