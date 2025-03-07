import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Custom UI components and icons
import SideMenu from "../components/layouts/SideMenu";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/Table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/DropdownMenu";
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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/Tabs";
import AddCompanyForm from "../components/ui/CompanyForm";
import { MoreVertical, Plus, Search, Download } from "lucide-react";

export default function Company() {
  // ---------------------- State Variables ---------------------- //

  // List of companies fetched from the API
  const [companies, setCompanies] = useState([]);
  // List of users fetched from the API
  const [users, setUsers] = useState([]);

  // Search terms for filtering companies and users
  const [searchTerm, setSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");

  // Pagination state for companies and users
  const [currentPage, setCurrentPage] = useState(1);
  const [userCurrentPage, setUserCurrentPage] = useState(1);

  // Sorting configuration for companies table
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // State for dialog controls
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Constants for items per page
  const itemsPerPage = 10;
  const userItemsPerPage = 15;

  // React Router navigation hook
  const navigate = useNavigate();

  // ---------------------- Data Fetching ---------------------- //

  useEffect(() => {
    /**
     * Fetch companies from the API.
     * Redirects to login if user is unauthorized.
     */
    const fetchCompanies = async () => {
      try {
        const response = await axios.get("/api/v1/company/getCompany", {
          withCredentials: true,
        });
        setCompanies(response.data.data);
      } catch (error) {
        console.error("Error fetching companies:", error);
        if (error.response && error.response.status === 401) {
          navigate("/login");
        }
      }
    };

    /**
     * Fetch users from the API.
     */
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/v1/users/all-users");
        setUsers(response.data.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchCompanies();
    fetchUsers();
  }, [navigate]);

  // ---------------------- Data Filtering & Pagination ---------------------- //

  // Filter companies based on the search term (case-insensitive)
  const filteredCompanies = useMemo(() => {
    return companies.filter(
      (company) =>
        company.CompanyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.domain.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [companies, searchTerm]);

  // Filter users based on the search term (case-insensitive)
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (user.company?.CompanyName || "")
          .toLowerCase()
          .includes(userSearchTerm.toLowerCase()) ||
        (user.branchAddress?.officeName || "")
          .toLowerCase()
          .includes(userSearchTerm.toLowerCase())
    );
  }, [users, userSearchTerm]);

  // Calculate total pages for companies and users
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const userTotalPages = Math.ceil(filteredUsers.length / userItemsPerPage);

  // Paginate companies based on the current page
  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCompanies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCompanies, currentPage]);

  // Paginate users based on the current page
  const paginatedUsers = useMemo(() => {
    const startIndex = (userCurrentPage - 1) * userItemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + userItemsPerPage);
  }, [filteredUsers, userCurrentPage]);

  // ---------------------- Event Handlers ---------------------- //

  // Update search term for companies and reset pagination
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  // Update search term for users and reset pagination
  const handleUserSearch = (event) => {
    setUserSearchTerm(event.target.value);
    setUserCurrentPage(1);
  };

  // Toggle sorting order based on column key
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    // Sort companies without mutating the state directly
    const sortedCompanies = [...companies].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setCompanies(sortedCompanies);
  };

  // Prepare deletion of a company and open confirmation dialog
  const handleDelete = (company) => {
    setCompanyToDelete(company);
    setIsDeleteDialogOpen(true);
  };

  // Confirm deletion and update state after API call
  const confirmDelete = async () => {
    try {
      await axios.post("/api/v1/company/deleteCompany", {
        domain: companyToDelete.domain,
      });
      setCompanies(
        companies.filter((c) => c.domain !== companyToDelete.domain)
      );
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  };

  /**
   * Callback to handle adding a new company.
   * @param {Object} companyData - New company details passed from the form.
   */
  const handleAddCompany = async (companyData) => {
    if (companyData.CompanyName && companyData.domain) {
      try {
        const response = await axios.post("/api/v1/company/addCompany", {
          CompanyName: companyData.CompanyName,
          domain: companyData.domain,
          noofEmployees: companyData.noofEmployees,
          industry: companyData.industry, // Include industry field
        });
        setCompanies([...companies, response.data.data]);

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

  // Utility function to export data to CSV
  const exportToCSV = (data, filename) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(",");
    const csvContent = [
      headers,
      ...data.map((item) => Object.values(item).join(",")),
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

  // Navigate to detailed view for a selected company
  const handleViewDetails = (id) => {
    navigate(`/company/${id}`);
  };

  // ---------------------- Component Render ---------------------- //

  return (
    <div className="flex h-screen">
      {/* Side navigation */}
      <SideMenu />

      <div className="flex-1 p-10 overflow-auto">
        {/* Tabs for switching between Companies and Users */}
        <Tabs defaultValue="companies" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="companies" className="flex-1">
              Companies
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-1">
              Users
            </TabsTrigger>
          </TabsList>

          {/* Companies Tab */}
          <TabsContent value="companies">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                {/* Company search input */}
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
                {/* CSV Export button */}
                <Button
                  onClick={() => exportToCSV(companies, "companies.csv")}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
              </div>

              {/* Dialog for adding a new company */}
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#2c7be5] hover:bg-[#1a68d1] text-white">
                    <Plus className="mr-2 h-4 w-4" /> New
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl p-0">
                  {/* Passing the add company callback to the form */}
                  <AddCompanyForm onCompanyAdded={handleAddCompany} />
                </DialogContent>
              </Dialog>
            </div>

            {/* Companies Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-[#f8f8f8] transition-colors">
                  <TableRow>
                    <TableHead className="w-[100px]">Sl. No</TableHead>
                    <TableHead className="cursor-pointer">_id</TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("CompanyName")}
                    >
                      Company Name{" "}
                      {sortConfig.key === "CompanyName"
                        ? sortConfig.direction === "asc"
                          ? "▲"
                          : "▼"
                        : ""}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("domain")}
                    >
                      Domain{" "}
                      {sortConfig.key === "domain"
                        ? sortConfig.direction === "asc"
                          ? "▲"
                          : "▼"
                        : ""}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("noofEmployees")}
                    >
                      Employees{" "}
                      {sortConfig.key === "noofEmployees"
                        ? sortConfig.direction === "asc"
                          ? "▲"
                          : "▼"
                        : ""}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("createdAt")}
                    >
                      Created at{" "}
                      {sortConfig.key === "createdAt"
                        ? sortConfig.direction === "asc"
                          ? "▲"
                          : "▼"
                        : ""}
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCompanies.map((company, index) => (
                    <TableRow
                      key={company._id}
                      className="hover:bg-[#fafafa] transition-colors"
                    >
                      <TableCell>
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </TableCell>
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
                            <DropdownMenuItem
                              onClick={() => handleViewDetails(company._id)}
                            >
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(company)}
                              className="text-red-600"
                            >
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

            {/* Pagination Controls for Companies */}
            <div className="flex justify-between items-center mt-4">
              <div>
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredCompanies.length)}{" "}
                of {filteredCompanies.length} results
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="bg-[#2c7be5] hover:bg-[#1a68d1] text-white"
                >
                  Previous
                </Button>
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="bg-[#2c7be5] hover:bg-[#1a68d1] text-white"
                >
                  Next
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
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

            {/* Users Table */}
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
                    <TableRow
                      key={user._id}
                      className="hover:bg-[#fafafa] transition-colors"
                    >
                      <TableCell>
                        {(userCurrentPage - 1) * userItemsPerPage + index + 1}
                      </TableCell>
                      <TableCell>{user._id}</TableCell>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        {user.branchAddress?.officeName || "N/A"}
                      </TableCell>
                      <TableCell>
                        {user.company?.CompanyName || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls for Users */}
            <div className="flex justify-between items-center mt-4">
              <div>
                Showing {(userCurrentPage - 1) * userItemsPerPage + 1} to{" "}
                {Math.min(
                  userCurrentPage * userItemsPerPage,
                  filteredUsers.length
                )}{" "}
                of {filteredUsers.length} results
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    setUserCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={userCurrentPage === 1}
                  className="bg-[#2c7be5] hover:bg-[#1a68d1] text-white"
                >
                  Previous
                </Button>
                <Button
                  onClick={() =>
                    setUserCurrentPage((prev) =>
                      Math.min(prev + 1, userTotalPages)
                    )
                  }
                  disabled={userCurrentPage === userTotalPages}
                  className="bg-[#2c7be5] hover:bg-[#1a68d1] text-white"
                >
                  Next
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-bold">{companyToDelete?.CompanyName}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
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
