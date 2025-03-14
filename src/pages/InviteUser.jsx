'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Home, UserPlus, Building2, ArrowRight, Mail, Shield } from 'lucide-react';
import SideMenu from '@/components/layouts/SideMenu';
// Import your SVG from the assets folder as a React component
import MySVG from '../assets/invite.svg';

/**
 * User Invitation Page Component
 * Allows administrators to invite new users to the system.
 * @returns {JSX.Element} - User invitation page.
 */
export default function InviteUserPage() {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    orgUnit: '',
  });

  // UI state
  const [orgUnitOptions, setOrgUnitOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Fetch organization unit options based on selected role.
   * Different roles have access to different organizational units.
   */
  useEffect(() => {
    if (formData.role) {
      // In a real app, this would be an API call.
      setTimeout(() => {
        const options = [
          { id: '1', name: 'Headquarters' },
          { id: '2', name: 'North Region' },
          { id: '3', name: 'South Region' },
          { id: '4', name: 'East Office' },
          { id: '5', name: 'West Office' },
        ].filter((option) => {
          // Filter options based on role.
          if (formData.role === 'OfficeAdmin') return option.name.includes('Office');
          if (formData.role === 'RegionalAdmin') return option.name.includes('Region');
          return true;
        });
        setOrgUnitOptions(options);
      }, 300);
    } else {
      setOrgUnitOptions([]);
    }
  }, [formData.role]);

  /**
   * Handle form field changes.
   * @param {string} field - Field name.
   * @param {string} value - New field value.
   */
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Reset org unit when role changes.
    if (field === 'role') {
      setFormData((prev) => ({
        ...prev,
        orgUnit: '',
      }));
    }
  };

  /**
   * Handle form submission.
   * @param {Event} e - Form submit event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call.
    try {
      // In a real app, call your API here.
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Redirect back to companies page.
      navigate('/companies');
    } catch (error) {
      console.error('Error sending invitation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* Side Menu */}
      <SideMenu />

      <div className="flex-1 flex flex-col">
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          {/* Breadcrumb Navigation */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/"
                  className="flex items-center hover:text-primary transition-colors"
                >
                  <Home className="h-4 w-4" />
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/companies" className="hover:text-primary transition-colors">
                  Companies
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink className="font-medium">Invite User</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid lg:grid-cols-5 gap-8 items-center">
            {/* SVG Image Section - Left */}
            <div className="lg:col-span-2 flex flex-col justify-center">
              <div className="max-w-md mx-auto lg:mx-0">
                {/* Use the imported SVG as a React component */}
                <MySVG className="w-full h-auto max-h-[300px] mb-8" />
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold tracking-tight">Streamline User Onboarding</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Inviting users to your company platform allows them to access features based on
                    their assigned role and organizational unit.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <Building2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">
                        Manage access across your organization with role-based permissions
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">
                        Automated email invitations with secure account setup links
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">
                        Granular access control based on organizational structure
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Invitation Form Card - Right */}
            <Card className="shadow-md lg:col-span-3 border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Invite User</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Send an invitation to a new user to join your company. They will receive an email
                  with instructions to set up their account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium">
                      Role
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => handleChange('role', value)}
                      required
                    >
                      <SelectTrigger id="role" className="h-11">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SuperAdmin">Super Admin</SelectItem>
                        <SelectItem value="RegionalAdmin">Regional Admin</SelectItem>
                        <SelectItem value="CountryAdmin">Country Admin</SelectItem>
                        <SelectItem value="CityAdmin">City Admin</SelectItem>
                        <SelectItem value="OfficeAdmin">Office Admin</SelectItem>
                        <SelectItem value="EmployeeDashboardUser">
                          Employee Dashboard User
                        </SelectItem>
                        <SelectItem value="BinDisplayUser">Bin Display User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Org Unit Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="orgUnit" className="text-sm font-medium">
                      Subdivision Type/Assigned Branch
                    </Label>
                    <Select
                      value={formData.orgUnit}
                      onValueChange={(value) => handleChange('orgUnit', value)}
                      disabled={!formData.role || orgUnitOptions.length === 0}
                      required
                    >
                      <SelectTrigger id="orgUnit" className="h-11">
                        <SelectValue placeholder="Select a branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {orgUnitOptions.map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? 'Sending Invitation...' : 'Send Invitation'}
                  {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
