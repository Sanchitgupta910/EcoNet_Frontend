// 'use client';

// import { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import axios from 'axios';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbSeparator,
// } from '@/components/ui/breadcrumb';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import {
//   Home,
//   UserPlus,
//   Building2,
//   ArrowRight,
//   Mail,
//   Shield,
//   CheckCircle,
//   AlertCircle,
// } from 'lucide-react';
// import SideMenu from '@/components/layouts/SideMenu';
// import MySVG from '../assets/invite.svg';

// // Retrieve current logged-in user from sessionStorage (not localStorage)
// const storedUser = sessionStorage.getItem('user');
// let currentUser = { role: '' };
// try {
//   currentUser = storedUser ? JSON.parse(storedUser) : { role: '' };
// } catch (err) {
//   console.error('Error parsing stored user:', err);
//   currentUser = { role: '' };
// }

// console.log('Loaded currentUser:', currentUser);

// // Mapping of allowed roles based on the logged-in user's role.
// const allowedRolesMapping = {
//   SuperAdmin: [
//     'SuperAdmin',
//     'RegionalAdmin',
//     'CountryAdmin',
//     'CityAdmin',
//     'OfficeAdmin',
//     'EmployeeDashboardUser',
//     'BinDisplayUser',
//   ],
//   CountryAdmin: [
//     'CountryAdmin',
//     'CityAdmin',
//     'OfficeAdmin',
//     'EmployeeDashboardUser',
//     'BinDisplayUser',
//   ],
//   RegionalAdmin: [
//     'RegionalAdmin',
//     'CityAdmin',
//     'OfficeAdmin',
//     'EmployeeDashboardUser',
//     'BinDisplayUser',
//   ],
//   CityAdmin: ['CityAdmin', 'OfficeAdmin', 'EmployeeDashboardUser', 'BinDisplayUser'],
//   OfficeAdmin: ['OfficeAdmin', 'EmployeeDashboardUser', 'BinDisplayUser'],
// };

// // Use an empty array as default if currentUser.role is not valid.
// const allowedRoles =
//   typeof currentUser.role === 'string' && Array.isArray(allowedRolesMapping[currentUser.role])
//     ? allowedRolesMapping[currentUser.role]
//     : [];

// console.log('Allowed roles:', allowedRoles);

// // Mapping for OrgUnit type based on the selected invite role.
// const roleToOrgUnitTypeMapping = {
//   SuperAdmin: 'Country',
//   RegionalAdmin: 'Region',
//   CountryAdmin: 'Country',
//   CityAdmin: 'City',
//   OfficeAdmin: 'Branch',
//   EmployeeDashboardUser: 'Branch',
//   BinDisplayUser: 'Branch',
// };

// export default function InviteUserPage() {
//   const navigate = useNavigate();
//   // Expect route: /invite-user/:companyId
//   const { companyId } = useParams();
//   console.log('Fetched companyId:', companyId);

//   // Form state for the invitation (keys must match backend expectation)
//   const [formData, setFormData] = useState({
//     email: '',
//     role: '',
//     OrgUnit: '',
//   });
//   const [orgUnitOptions, setOrgUnitOptions] = useState([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [error, setError] = useState('');

//   // When role changes, fetch OrgUnit options filtered by unit type and companyId.
//   useEffect(() => {
//     if (formData.role && companyId) {
//       const unitType = roleToOrgUnitTypeMapping[formData.role] || '';
//       if (unitType) {
//         axios
//           .get(`/api/v1/orgUnits/byType?type=${unitType}&company=${companyId}`, {
//             withCredentials: true,
//           })
//           .then((response) => {
//             setOrgUnitOptions(response.data.data);
//           })
//           .catch((err) => {
//             console.error('Error fetching OrgUnit options:', err);
//             setOrgUnitOptions([]);
//             setError('Failed to load organizational units. Please try again.');
//           });
//       } else {
//         setOrgUnitOptions([]);
//       }
//       // Reset OrgUnit selection when role changes.
//       setFormData((prev) => ({ ...prev, OrgUnit: '' }));
//     }
//   }, [formData.role, companyId]);

//   // Handle form field changes.
//   const handleChange = (field, value) => {
//     if (isSuccess) setIsSuccess(false);
//     if (error) setError('');
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   // Handle form submission.
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setIsSuccess(false);
//     setError('');

//     try {
//       await axios.post(
//         '/api/v1/users/invite',
//         {
//           ...formData,
//           company: companyId, // Use the companyId from the route.
//         },
//         { withCredentials: true },
//       );
//       setIsSuccess(true);
//       navigate('/companies');
//     } catch (error) {
//       console.error('Error sending invitation:', error);
//       setError(error.response?.data?.message || 'Failed to send invitation. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-[#F9FAFB]">
//       <SideMenu />
//       <div className="flex-1 flex flex-col">
//         <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
//           <Breadcrumb className="mb-8">
//             <BreadcrumbList>
//               <BreadcrumbItem>
//                 <BreadcrumbLink
//                   href="/"
//                   className="flex items-center hover:text-primary transition-colors"
//                 >
//                   <Home className="h-4 w-4" />
//                 </BreadcrumbLink>
//               </BreadcrumbItem>
//               <BreadcrumbSeparator />
//               <BreadcrumbItem>
//                 <BreadcrumbLink href="/companies" className="hover:text-primary transition-colors">
//                   Companies
//                 </BreadcrumbLink>
//               </BreadcrumbItem>
//               <BreadcrumbSeparator />
//               <BreadcrumbItem>
//                 <BreadcrumbLink className="font-medium hover:text-primary cursor-pointer  text-primary">
//                   Invite User
//                 </BreadcrumbLink>
//               </BreadcrumbItem>
//             </BreadcrumbList>
//           </Breadcrumb>

//           <div className="grid lg:grid-cols-5 gap-8 items-center">
//             {/* Left Section: Informational SVG and details */}
//             <div className="lg:col-span-2 flex flex-col justify-center">
//               <div className="max-w-md mx-auto lg:mx-0">
//                 <MySVG className="w-full h-auto max-h-[300px] mb-8" />
//                 <div className="space-y-6">
//                   <h2 className="text-2xl font-bold tracking-tight">Streamline User Onboarding</h2>
//                   <p className="text-muted-foreground leading-relaxed">
//                     Inviting users lets them access the platform based on their predefined role and
//                     assigned organizational unit.
//                   </p>
//                   <div className="space-y-4">
//                     <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
//                       <Building2 className="h-5 w-5 text-primary flex-shrink-0" />
//                       <span className="text-sm">Manage access with role-based permissions.</span>
//                     </div>
//                     <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
//                       <Mail className="h-5 w-5 text-primary flex-shrink-0" />
//                       <span className="text-sm">
//                         Automated email invitations with secure account setup links.
//                       </span>
//                     </div>
//                     <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
//                       <Shield className="h-5 w-5 text-primary flex-shrink-0" />
//                       <span className="text-sm">
//                         Granular access control based on your organizational structure.
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Right Section: Invitation Form */}
//             <Card className="shadow-md lg:col-span-3 border-0">
//               <CardHeader className="pb-4">
//                 <div className="flex items-center gap-2 mb-2">
//                   <div className="p-2 rounded-full bg-primary/10">
//                     <UserPlus className="h-5 w-5 text-primary" />
//                   </div>
//                   <CardTitle className="text-2xl font-bold">Invite User</CardTitle>
//                 </div>
//                 <CardDescription className="text-base">
//                   Send an invitation to a new user. They will receive an email with instructions to
//                   complete registration.
//                 </CardDescription>
//               </CardHeader>
//               <CardContent>
//                 {isSuccess && (
//                   <Alert className="mb-6 bg-green-50 border-green-200">
//                     <CheckCircle className="h-4 w-4 text-green-600" />
//                     <AlertDescription className="text-green-800">
//                       Invitation sent successfully! An email has been sent to {formData.email} with
//                       instructions to complete registration.
//                     </AlertDescription>
//                   </Alert>
//                 )}
//                 {error && (
//                   <Alert className="mb-6 bg-red-50 border-red-200" variant="destructive">
//                     <AlertCircle className="h-4 w-4 text-red-600" />
//                     <AlertDescription className="text-red-800">{error}</AlertDescription>
//                   </Alert>
//                 )}
//                 <form onSubmit={handleSubmit} className="space-y-6">
//                   <div className="space-y-2">
//                     <Label htmlFor="email" className="text-sm font-medium">
//                       Email Address
//                     </Label>
//                     <Input
//                       id="email"
//                       type="email"
//                       placeholder="user@example.com"
//                       value={formData.email}
//                       onChange={(e) => handleChange('email', e.target.value)}
//                       required
//                       className="h-11"
//                     />
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="role" className="text-sm font-medium">
//                       Role
//                     </Label>
//                     <Select
//                       value={formData.role}
//                       onValueChange={(value) => handleChange('role', value)}
//                       required
//                     >
//                       <SelectTrigger id="role" className="h-11">
//                         <SelectValue placeholder="Select a role" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {allowedRoles.map((roleOption) => (
//                           <SelectItem key={roleOption} value={roleOption}>
//                             {roleOption}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                   <div className="space-y-2">
//                     <Label htmlFor="OrgUnit" className="text-sm font-medium">
//                       {formData.role
//                         ? `${roleToOrgUnitTypeMapping[formData.role]} (Assigned Unit)`
//                         : 'Assigned Unit'}
//                     </Label>
//                     <Select
//                       value={formData.OrgUnit}
//                       onValueChange={(value) => handleChange('OrgUnit', value)}
//                       disabled={!formData.role || orgUnitOptions.length === 0}
//                       required
//                     >
//                       <SelectTrigger id="OrgUnit" className="h-11">
//                         <SelectValue placeholder="Select an organizational unit" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {orgUnitOptions.map((unit) => (
//                           <SelectItem key={unit._id} value={unit._id}>
//                             {unit.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </form>
//               </CardContent>
//               <CardFooter className="pt-2">
//                 <Button
//                   type="submit"
//                   className="w-full h-11 text-base font-medium"
//                   disabled={isSubmitting}
//                   onClick={handleSubmit}
//                 >
//                   {isSubmitting ? 'Sending Invitation...' : 'Send Invitation'}
//                   {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
//                 </Button>
//               </CardFooter>
//             </Card>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
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
// import SideMenu from '@/components/layouts/SideMenu';
import MySVG from '../assets/invite.svg';

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
  const navigate = useNavigate();
  // Expect route: /invite-user/:companyId
  const { companyId } = useParams();
  const location = useLocation();
  // If navigated from the dashboard, state flag is set to true.
  const fromDashboard = location.state?.fromDashboard || false;
  console.log('Fetched companyId:', companyId);

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
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* Always render SideMenu if not coming from dashboard
      {!fromDashboard && <SideMenu />} */}
      <div className="flex-1 flex flex-col">
        {/* Breadcrumbs */}
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={fromDashboard ? '/dashboard' : '/'}
                  className="flex items-center hover:text-primary transition-colors"
                >
                  <Home className="h-4 w-4" />
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink className="font-medium hover:text-primary cursor-pointer text-primary">
                  Invite User
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-5 gap-8 items-center">
            {/* Left Section: Informational SVG and details */}
            <div className="lg:col-span-2 flex flex-col justify-center">
              <div className="max-w-md mx-auto lg:mx-0">
                <MySVG className="w-full h-auto max-h-[300px] mb-8" />
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold tracking-tight">Streamline User Onboarding</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Inviting users lets them access the platform based on their predefined role and
                    assigned organizational unit.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <Building2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">Manage access with role-based permissions.</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">
                        Automated email invitations with secure account setup links.
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-sm">
                        Granular access control based on your organizational structure.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section: Invitation Form */}
            <Card className="shadow-md lg:col-span-3 border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-full bg-primary/10">
                    <UserPlus className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-2xl font-bold">Invite User</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Send an invitation to a new user. They will receive an email with instructions to
                  complete registration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSuccess && (
                  <Alert className="mb-6 bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Invitation sent successfully! An email has been sent to {formData.email} with
                      instructions to complete registration.
                    </AlertDescription>
                  </Alert>
                )}
                {error && (
                  <Alert className="mb-6 bg-red-50 border-red-200" variant="destructive">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
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
                        {allowedRoles.map((roleOption) => (
                          <SelectItem key={roleOption} value={roleOption}>
                            {roleOption}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="OrgUnit" className="text-sm font-medium">
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
                      <SelectTrigger id="OrgUnit" className="h-11">
                        <SelectValue placeholder="Select an organizational unit" />
                      </SelectTrigger>
                      <SelectContent>
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
