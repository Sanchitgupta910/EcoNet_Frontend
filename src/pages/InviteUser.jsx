'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
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

import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Home,
  UserPlus,
  Building2,
  ArrowRight,
  Mail,
  Shield,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useTheme } from '@/components/ui/theme-provider';

// Retrieve current logged-in user from sessionStorage (not localStorage)
const storedUser = sessionStorage.getItem('user');
let currentUser = { role: '' };
try {
  currentUser = storedUser ? JSON.parse(storedUser) : { role: '' };
} catch (err) {
  console.error('Error parsing stored user:', err);
  currentUser = { role: '' };
}

// Mapping of allowed roles based on the logged-in user's role.
const allowedRolesMapping = {
  SuperAdmin: [
    'SuperAdmin',
    'RegionalAdmin',
    'CountryAdmin',
    'CityAdmin',
    'OfficeAdmin',
    'EmployeeDashboardUser',
    'BinDisplayUser',
  ],
  CountryAdmin: [
    'CountryAdmin',
    'CityAdmin',
    'OfficeAdmin',
    'EmployeeDashboardUser',
    'BinDisplayUser',
  ],
  RegionalAdmin: [
    'RegionalAdmin',
    'CityAdmin',
    'OfficeAdmin',
    'EmployeeDashboardUser',
    'BinDisplayUser',
  ],
  CityAdmin: ['CityAdmin', 'OfficeAdmin', 'EmployeeDashboardUser', 'BinDisplayUser'],
  OfficeAdmin: ['OfficeAdmin', 'EmployeeDashboardUser', 'BinDisplayUser'],
};

const allowedRoles =
  typeof currentUser.role === 'string' && Array.isArray(allowedRolesMapping[currentUser.role])
    ? allowedRolesMapping[currentUser.role]
    : [];

// Mapping for OrgUnit type based on the selected invite role.
const roleToOrgUnitTypeMapping = {
  SuperAdmin: 'Country',
  RegionalAdmin: 'Region',
  CountryAdmin: 'Country',
  CityAdmin: 'City',
  OfficeAdmin: 'Branch',
  EmployeeDashboardUser: 'Branch',
  BinDisplayUser: 'Branch',
};

export default function InviteUserPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  // Expect route: /invite-user/:companyId
  const { companyId } = useParams();
  const location = useLocation();
  // If navigated from the dashboard, state flag is set to true.
  const fromDashboard = location.state?.fromDashboard || false;

  // Form state for the invitation (keys must match backend expectation)
  const [formData, setFormData] = useState({
    email: '',
    role: '',
    OrgUnit: '',
  });
  const [orgUnitOptions, setOrgUnitOptions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // When role changes, fetch OrgUnit options filtered by unit type and companyId.
  useEffect(() => {
    if (formData.role && companyId) {
      const unitType = roleToOrgUnitTypeMapping[formData.role] || '';
      if (unitType) {
        axios
          .get(`/api/v1/orgUnits/byType?type=${unitType}&company=${companyId}`, {
            withCredentials: true,
          })
          .then((response) => {
            setOrgUnitOptions(response.data.data);
          })
          .catch((err) => {
            console.error('Error fetching OrgUnit options:', err);
            setOrgUnitOptions([]);
            setError('Failed to load organizational units. Please try again.');
          });
      } else {
        setOrgUnitOptions([]);
      }
      // Reset OrgUnit selection when role changes.
      setFormData((prev) => ({ ...prev, OrgUnit: '' }));
    }
  }, [formData.role, companyId]);

  // Handle form field changes.
  const handleChange = (field, value) => {
    if (isSuccess) setIsSuccess(false);
    if (error) setError('');
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle form submission.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSuccess(false);
    setError('');

    try {
      await axios.post(
        '/api/v1/users/invite',
        {
          ...formData,
          company: companyId, // Use the companyId from the route.
        },
        { withCredentials: true },
      );
      setIsSuccess(true);
      navigate('/companies');
    } catch (error) {
      console.error('Error sending invitation:', error);
      setError(error.response?.data?.message || 'Failed to send invitation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen mt-[5%] ${
        theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}
    >
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Section: Informational SVG and details */}
          <div className="lg:col-span-1 flex flex-col justify-center w-full">
            <div className="max-w-md mx-auto lg:mx-0">
              <div className="space-y-6">
                <h2
                  className={`text-2xl font-bold tracking-tight ${
                    theme === 'dark' ? 'text-white' : 'text-slate-800'
                  }`}
                >
                  Streamline User Onboarding
                </h2>
                <p
                  className={`leading-relaxed ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Inviting users lets them access the platform based on their predefined role and
                  assigned organizational unit.
                </p>
                <div className="space-y-4">
                  <div
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-indigo-500/20 border border-indigo-500/30'
                        : 'bg-indigo-100/70 border border-indigo-200/70'
                    }`}
                  >
                    <Building2
                      className={`h-5 w-5 ${
                        theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                      } flex-shrink-0`}
                    />
                    <span
                      className={`text-sm ${
                        theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                      }`}
                    >
                      Manage access with role-based permissions.
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-indigo-500/20 border border-indigo-500/30'
                        : 'bg-indigo-100/70 border border-indigo-200/70'
                    }`}
                  >
                    <Mail
                      className={`h-5 w-5 ${
                        theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                      } flex-shrink-0`}
                    />
                    <span
                      className={`text-sm ${
                        theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                      }`}
                    >
                      Automated email invitations with secure account setup links.
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      theme === 'dark'
                        ? 'bg-indigo-500/20 border border-indigo-500/30'
                        : 'bg-indigo-100/70 border border-indigo-200/70'
                    }`}
                  >
                    <Shield
                      className={`h-5 w-5 ${
                        theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'
                      } flex-shrink-0`}
                    />
                    <span
                      className={`text-sm ${
                        theme === 'dark' ? 'text-slate-200' : 'text-slate-700'
                      }`}
                    >
                      Granular access control based on your organizational structure.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section: Invitation Form */}
          <div className="lg:col-span-1 w-full">
            <Card
              className={`shadow-lg border-0 ${
                theme === 'dark'
                  ? 'backdrop-blur-md bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50'
                  : 'backdrop-blur-md bg-white border-slate-200/70'
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`p-2 rounded-full ${
                      theme === 'dark'
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'bg-indigo-100 text-indigo-600'
                    }`}
                  >
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <CardTitle
                    className={`text-2xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-slate-800'
                    }`}
                  >
                    Invite User
                  </CardTitle>
                </div>
                <CardDescription
                  className={`text-base ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}
                >
                  Send an invitation to a new user. They will receive an email with instructions to
                  complete registration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSuccess && (
                  <Alert
                    className={`mb-6 ${
                      theme === 'dark'
                        ? 'bg-green-900/30 border-green-700'
                        : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <CheckCircle
                      className={`h-4 w-4 ${
                        theme === 'dark' ? 'text-green-400' : 'text-green-600'
                      }`}
                    />
                    <AlertDescription
                      className={theme === 'dark' ? 'text-green-300' : 'text-green-800'}
                    >
                      Invitation sent successfully! An email has been sent to {formData.email} with
                      instructions to complete registration.
                    </AlertDescription>
                  </Alert>
                )}
                {error && (
                  <Alert
                    className={`mb-6 ${
                      theme === 'dark' ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'
                    }`}
                    variant="destructive"
                  >
                    <AlertCircle
                      className={`h-4 w-4 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}
                    />
                    <AlertDescription
                      className={theme === 'dark' ? 'text-red-300' : 'text-red-800'}
                    >
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                      className={`h-11 ${
                        theme === 'dark'
                          ? 'bg-slate-800 border-slate-700 text-slate-100'
                          : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="role"
                      className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      Role
                    </Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => handleChange('role', value)}
                      required
                    >
                      <SelectTrigger
                        id="role"
                        className={`h-11 ${
                          theme === 'dark'
                            ? 'bg-slate-800 border-slate-700 text-slate-100'
                            : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      >
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent
                        className={
                          theme === 'dark'
                            ? 'bg-slate-800 border-slate-700'
                            : 'bg-white border-slate-200'
                        }
                      >
                        {allowedRoles.map((roleOption) => (
                          <SelectItem key={roleOption} value={roleOption}>
                            {roleOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="OrgUnit"
                      className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      {formData.role
                        ? `${roleToOrgUnitTypeMapping[formData.role]} (Assigned Unit)`
                        : 'Assigned Unit'}
                    </Label>
                    <Select
                      value={formData.OrgUnit}
                      onValueChange={(value) => handleChange('OrgUnit', value)}
                      disabled={!formData.role || orgUnitOptions.length === 0}
                      required
                    >
                      <SelectTrigger
                        id="OrgUnit"
                        className={`h-11 ${
                          theme === 'dark'
                            ? 'bg-slate-800 border-slate-700 text-slate-100'
                            : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      >
                        <SelectValue placeholder="Select an organizational unit" />
                      </SelectTrigger>
                      <SelectContent
                        className={
                          theme === 'dark'
                            ? 'bg-slate-800 border-slate-700'
                            : 'bg-white border-slate-200'
                        }
                      >
                        {orgUnitOptions.map((unit) => (
                          <SelectItem key={unit._id} value={unit._id}>
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
                  className={`w-full h-11 text-base font-medium ${
                    theme === 'dark'
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
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
