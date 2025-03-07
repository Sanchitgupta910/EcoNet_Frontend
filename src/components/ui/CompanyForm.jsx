"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useToast } from "@/components/ui/ToastProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Building, Globe, Users, Briefcase } from "lucide-react";

// Employee headcount options
const headcountOptions = [
  "1-10",
  "11-50",
  "51-100",
  "101-250",
  "251-500",
  "More than 500",
];

// Industry options
const industryOptions = [
  "Accommodation and Tourism",
  "Architecture",
  "Construction",
  "Consulting",
  "Education & Training",
  "Environmental Services",
  "Financial Services",
  "Food",
  "Healthcare",
  "Information Technology",
  "Legal Services",
  "Manufacturing",
  "Mining",
  "Non-Profit Organisations",
  "Professional, Scientific & Technical Services",
  "Property & Real Estate",
  "Public Administration",
  "Retail & Wholesale Trade",
  "Transport & Logistics",
  "Utilities, Energy & Waste Services",
];

export default function AddCompanyForm({ onCompanyAdded }) {
  const { success } = useToast();
  const [formData, setFormData] = useState({
    companyName: "",
    domain: "",
    noofEmployees: "",
    industry: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Replace with your actual API call. Here we simulate a delay.
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Form submitted:", formData);

      // Call the callback function with the new company data
      if (onCompanyAdded) {
        onCompanyAdded({
          CompanyName: formData.companyName,
          domain: formData.domain,
          noofEmployees: formData.noofEmployees, // Adjust if necessary
          industry: formData.industry,
        });
      }

      // Reset form after successful submission
      setFormData({
        companyName: "",
        domain: "",
        noofEmployees: "",
        industry: "",
      });
      setTimeout(() => {
        success("Company added successfully!", {
          title: "Success",
        });
      }, 500);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-1 mb-6 p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <h2 className="text-2xl font-bold">Add a New Company</h2>
        <p className="text-muted-foreground">
          Enter the company details to add it to your organization
        </p>
      </div>
      <form className="mt-[-22px]" onSubmit={handleSubmit}>
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="flex items-center gap-2">
              <Building className="h-4 w-4 text-primary" />
              Company Name
            </Label>
            <Input
              id="companyName"
              name="companyName"
              placeholder="Acme Corporation"
              value={formData.companyName}
              onChange={handleInputChange}
              className="transition-all focus-visible:ring-primary"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain" className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Domain
            </Label>
            <Input
              id="domain"
              name="domain"
              placeholder="acmecorp.com"
              value={formData.domain}
              onChange={handleInputChange}
              className="transition-all focus-visible:ring-primary"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="noofEmployees"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4 text-primary" />
                Employee Headcount
              </Label>
              <Select
                value={formData.noofEmployees} // Changed from headcount to noofEmployees
                onValueChange={
                  (value) => handleSelectChange("noofEmployees", value) // Changed key to noofEmployees
                }
                required
              >
                <SelectTrigger
                  id="noofEmployees"
                  className="transition-all focus-visible:ring-primary"
                >
                  <SelectValue placeholder="Select headcount range" />
                </SelectTrigger>
                <SelectContent>
                  {headcountOptions.map((option) => (
                    <SelectItem
                      key={option}
                      value={option}
                      className="cursor-pointer"
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary" />
                Industry
              </Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => handleSelectChange("industry", value)}
                required
              >
                <SelectTrigger
                  id="industry"
                  className="transition-all focus-visible:ring-primary"
                >
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {industryOptions.map((option) => (
                    <SelectItem
                      key={option}
                      value={option}
                      className="cursor-pointer"
                    >
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t">
          <Button
            variant="outline"
            type="button"
            className="transition-all"
            onClick={() =>
              setFormData({
                companyName: "",
                domain: "",
                noofEmployees: "",
                industry: "",
              })
            }
          >
            Reset
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 transition-all"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Adding...
              </>
            ) : (
              "Add Company"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
