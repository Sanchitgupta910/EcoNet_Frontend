import { useState, useEffect, useMemo } from "react";
import axios from "axios";
// import socket from "@/lib/socket";

// Importing custom UI components
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
  // ---------------------- State Variables ---------------------- //

  // State for managing companies data fetched from the backend
  const [companies, setCompanies] = useState([]);
  // Search term for filtering companies
  const [searchTerm, setSearchTerm] = useState("");
  // Pagination state for companies
  const [currentPage, setCurrentPage] = useState(1);
  // Company selected for deletion
  const [companyToDelete, setCompanyToDelete] = useState(null);
  // Dialog control for delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // Dialog control for adding a new company
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // State for managing users data fetched from the backend
  const [users, setUsers] = useState([]);
  // Search term for filtering users
  const [userSearchTerm, setUserSearchTerm] = useState("");
  // Pagination state for users
  const [userCurrentPage, setUserCurrentPage] = useState(1);

  // State for handling the form input when adding a new company
  const [newCompany, setNewCompany] = useState({
    CompanyName: "",
    domain: "",
    noofEmployees: "",
  });

  // State for sorting configuration: which key to sort by and in what direction
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Constants for number of items to show per page
  const itemsPerPage = 10;
  const userItemsPerPage = 15;

  // React Router's navigation hook for redirection
  const navigate = useNavigate();

  // ---------------------- Data Fetching ---------------------- //

  useEffect(() => {
    /**
     * Fetch companies data from the API.
     * If the user is unauthorized (status 401), redirect to the login page.
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
     * Fetch users data from the API.
     */
    const fetchUsers = async () => {
      try {
        const response = await axios.get("/api/v1/users/all-users");
        setUsers(response.data.data);
      } catch (error) {
        console.error("Error fetching list of users:", error);
      }
    };

    // Initiate both data fetching functions when the component mounts
    fetchCompanies();
    fetchUsers();
  }, [navigate]);

  // Reset the new company form whenever the "Add Company" dialog is closed.
  useEffect(() => {
    if (!isAddDialogOpen) {
      setNewCompany({ CompanyName: "", domain: "", noofEmployees: "" });
    }
  }, [isAddDialogOpen]);

  //-----------------------Socket Connection for testing and future refernce should be commented in this code file----------------------//

  // Listen for the "newCompany" event from Socket.io.
  // useEffect(() => {
  //   socket.on("newCompany", (newCompany) => {
  //     console.log("Received new company event:", newCompany);
  //     // Update companies state by prepending the new company.
  //     setCompanies((prevCompanies) => [newCompany, ...prevCompanies]);
  //   });

  //   return () => {
  //     socket.off("newCompany");
  //   };
  // }, []);


  // ---------------------- Data Filtering & Pagination (Using useMemo) ---------------------- //

  /**
   * Memoized filtered companies based on the search term.
   * Recomputes only when 'companies' or 'searchTerm' changes.
   */
  const filteredCompanies = useMemo(() => {
    return companies.filter(
      (company) =>
        company.CompanyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.domain.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [companies, searchTerm]);

  /**
   * Memoized filtered users based on the search term.
   * Recomputes only when 'users' or 'userSearchTerm' changes.
   */
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (user.company?.CompanyName || "").toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        (user.branchAddress?.branchName || "").toLowerCase().includes(userSearchTerm.toLowerCase())
    );
  }, [users, userSearchTerm]);

  // Total pages for companies and users based on filtered results
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const userTotalPages = Math.ceil(filteredUsers.length / userItemsPerPage);

  /**
   * Memoized pagination for companies.
   */
  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCompanies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCompanies, currentPage]);

  /**
   * Memoized pagination for users.
   */
  const paginatedUsers = useMemo(() => {
    const startIndex = (userCurrentPage - 1) * userItemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + userItemsPerPage);
  }, [filteredUsers, userCurrentPage]);

  // ---------------------- Event Handlers ---------------------- //

  /**
   * Handle search input for companies.
   * Resets the current page to 1 when the search term changes.
   */
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  /**
   * Handle search input for users.
   * Resets the user current page to 1 when the search term changes.
   */
  const handleUserSearch = (event) => {
    setUserSearchTerm(event.target.value);
    setUserCurrentPage(1);
  };

  /**
   * Handle the sorting logic.
   * Toggles the sort direction if the same key is clicked; otherwise, sets to ascending order.
   * Also, updates the companies state with sorted data.
   */
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    // Create a copy of companies to avoid mutating state directly
    const sortedCompanies = [...companies].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setCompanies(sortedCompanies);
  };

  /**
   * Handle deletion by setting the company to delete and opening the delete confirmation dialog.
   */
  const handleDelete = (company) => {
    setCompanyToDelete(company);
    setIsDeleteDialogOpen(true);
  };

  /**
   * Confirm deletion by sending a request to delete the company.
   * Updates the state to remove the deleted company from the list.
   */
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

  /**
   * Handle adding a new company.
   * Validates required fields and sends the request to add the company.
   * On success, appends the new company to the list and closes the dialog.
   */
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

  /**
   * Utility function to export provided data as a CSV file.
   * @param {Array} data - Array of objects to export.
   * @param {string} filename - Desired name for the downloaded CSV file.
   */
  const exportToCSV = (data, filename) => {
    if (!data.length) return; // Exit if there's no data to export

    // Extract headers from the keys of the first object
    const headers = Object.keys(data[0]).join(",");
    // Map data values and join them into CSV formatted rows
    const csvContent = [
      headers,
      ...data.map((item) => Object.values(item).join(","))
    ].join("\n");

    // Create a Blob from the CSV string and trigger a download
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

  /**
   * Navigate to the company details page.
   * @param {string} id - Company ID used in the URL.
   */
  const handleViewDetails = (id) => {
    navigate(`/company/${id}`);
  };

  // ---------------------- Component Render ---------------------- //

  return (
    <div className="flex h-screen">
      {/* Side navigation menu */}
      <SideMenu />

      <div className="flex-1 p-10 overflow-auto">
        {/* Tabs to switch between Companies and Users views */}
        <Tabs defaultValue="companies" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="companies" className="flex-1">
              Companies
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-1">
              Users
            </TabsTrigger>
          </TabsList>

          {/* ---------------------- Companies Tab ---------------------- */}
          <TabsContent value="companies">
            <div className="flex justify-between items-center mb-6">
              {/* Search input and CSV export button */}
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
              {/* Dialog for adding a new company */}
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
                    {/* Company Name Input */}
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
                    {/* Company Domain Input */}
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
                    {/* Number of Employees Input */}
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
                    <Button
                      type="submit"
                      className="bg-[#2c7be5] hover:bg-[#1a68d1] text-white"
                      onClick={handleAddCompany}
                    >
                      Save
                    </Button>
                  </DialogFooter>
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
                        {/* Dropdown for actions: view details or delete record */}
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
                {Math.min(currentPage * itemsPerPage, filteredCompanies.length)} of{" "}
                {filteredCompanies.length} results
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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

          {/* ---------------------- Users Tab ---------------------- */}
          <TabsContent value="users">
            <div className="flex justify-between items-center mb-6">
              {/* Search input for users */}
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
                        {user.branchAddress?.branchName || "N/A"}
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

      {/* ---------------------- Delete Confirmation Dialog ---------------------- */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-bold">{companyToDelete?.CompanyName}</span>? This
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
