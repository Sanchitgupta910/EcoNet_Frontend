import { useState, useEffect } from "react";
import axios from "axios"; // Library to make HTTP requests to the backend
import SideMenu from "../components/layouts/side-menu"; // Side menu component
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom

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
import { Label } from "../components/ui/label";
import { MoreVertical, Plus, Search, Download } from "lucide-react";

// Main Company component
export default function Company() {
  const [companies, setCompanies] = useState([]); // List of companies
  const [searchTerm, setSearchTerm] = useState(""); // Search term state
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const [companyToDelete, setCompanyToDelete] = useState(null); // Company to be deleted
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false); // State for delete dialog
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false); // State for add company dialog
  const [newCompany, setNewCompany] = useState({
    CompanyName: "",
    domain: "",
    noofEmployees: "",
  }); // New company details
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" }); // Sorting configuration

  const itemsPerPage = 10; // Items per page for pagination
  const navigate = useNavigate(); // Initialize useNavigate for navigation

  // Fetch companies from the backend when the component loads
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get("/api/v1/company/getCompany");
        setCompanies(response.data.data); // Update the state with fetched data
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies(); // Call the function to fetch data
  }, []);

  // Reset form fields when the Add Company dialog is closed
  useEffect(() => {
    if (!isAddDialogOpen) {
      setNewCompany({ CompanyName: "", domain: "", noofEmployees: "" });
    }
  }, [isAddDialogOpen]);

  // Handle sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"; // Toggle sorting direction
    }
    setSortConfig({ key, direction });

    // Sort companies based on the key and direction
    const sortedCompanies = [...companies].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setCompanies(sortedCompanies); // Update state with sorted data
  };

  // Filter companies based on the search term
  const filteredCompanies = companies.filter(
    (company) =>
      company.CompanyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.domain.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage); // Calculate total pages
  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ); // Paginate companies

  // Handle search input change
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to the first page when search term changes
  };

  // Handle delete button click
  const handleDelete = (company) => {
    setCompanyToDelete(company);
    setIsDeleteDialogOpen(true); // Open delete confirmation dialog
  };

  // Confirm deletion
  const confirmDelete = async () => {
    try {
      await axios.post("/api/v1/company/deleteCompany", {
        domain: companyToDelete.domain,
      });
      setCompanies(companies.filter((c) => c.domain !== companyToDelete.domain)); // Remove company from state
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting company:", error);
    }
  };

  // Handle adding a new company
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
        setIsAddDialogOpen(false); // Close add company dialog
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

  // Export company data to CSV
  const exportToCSV = () => {
    const headers = ["_id", "Company Name", "Domain", "Number of Employees", "Created At", "isdeleted"];
    const csvContent = [
      headers.join(","), // Join headers with a comma
      ...companies.map((company) =>
        [
          company._id,
          company.CompanyName,
          company.domain,
          company.noofEmployees,
          company.createdAt,
          company.isdeleted,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "companies.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Handle navigation to the Company Info page
  const handleViewDetails = (id) => {
    navigate(`/company/${id}`);
  };

  return (
    <div className="flex h-screen">
      <SideMenu />

      <div className="flex-1 p-10 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder=" Search companies..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-8 pr-4 py-2 w-64"
              />
            </div>
            <Button
              onClick={exportToCSV}
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
            <Button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="bg-[#2c7be5] hover:bg-[#1a68d1] text-white">
              Previous
            </Button>
            <Button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="bg-[#2c7be5] hover:bg-[#1a68d1] text-white">
              Next
            </Button>
          </div>
        </div>
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
