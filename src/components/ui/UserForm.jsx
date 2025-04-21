'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, EyeOff, User, Mail, Building2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

// Country codes for phone selection
const countryCodes = [
  { country: 'United States', code: '+1' },
  { country: 'United Kingdom', code: '+44' },
  { country: 'Australia', code: '+61' },

  { country: 'China', code: '+86' },
  { country: 'France', code: '+33' },
  { country: 'Germany', code: '+49' },
  { country: 'India', code: '+91' },
  { country: 'Japan', code: '+81' },
  { country: 'New Zealand', code: '+64' },
  { country: 'Singapore', code: '+65' },
];

export function UserForm({ onSubmit, companyId, initialData }) {
  const [user, setUser] = useState({
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    password: initialData ? '' : '',
    phone: initialData?.phone ? initialData.phone.replace(/^\+\d{1,3}/, '') : '',
    countryCode: initialData?.phone ? initialData.phone.match(/^\+\d{1,3}/)?.[0] || '' : '',
    role: initialData?.role || '',
    subdivision: initialData?.subdivision || '',
    subdivisionType: initialData?.subdivisionType || '',
    associatedCompany: companyId,
    OrgUnit: initialData?.OrgUnit || '',
    notifyUser: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [orgUnitOptions, setOrgUnitOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch OrgUnit options based on selected role and associated company (companyId)
  // Fetch OrgUnit options based on selected role and companyId
  useEffect(() => {
    // Determine the OrgUnit type based on the selected role
    let unitType = '';
    switch (user.role) {
      case 'CountryAdmin':
        unitType = 'Country';
        break;
      case 'RegionalAdmin':
        unitType = 'Region';
        break;
      case 'CityAdmin':
        unitType = 'City';
        break;
      case 'OfficeAdmin':
      case 'EmployeeDashboardUser':
      case 'BinDisplayUser':
        unitType = 'Branch';
        break;
      default:
        unitType = '';
    }

    // Only fetch if both unitType and companyId are provided
    if (unitType && companyId) {
      console.log(`Fetching OrgUnit options for type: ${unitType} and companyId: ${companyId}`);
      setIsLoading(true);
      setError('');

      axios
        .get(`/api/v1/orgUnits/byType?type=${unitType}&companyId=${companyId}`, {
          withCredentials: true,
        })
        .then((response) => {
          if (response.data && response.data.data) {
            console.log('OrgUnit options fetched successfully:', response.data.data);
            setOrgUnitOptions(response.data.data);
          } else {
            console.error('API returned no data for OrgUnit options:', response.data);
            setError('No organizational units data received.');
            setOrgUnitOptions([]);
          }
        })
        .catch((err) => {
          console.error('Error fetching OrgUnit options:', err);
          setOrgUnitOptions([]);
          setError('Failed to load organizational units.');
        })
        .finally(() => {
          console.log('Finished fetching OrgUnit options.');
          setIsLoading(false);
        });
    } else {
      console.log('Unit type or companyId not provided; skipping OrgUnit fetch.');
      setOrgUnitOptions([]);
    }
  }, [user.role, companyId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCountryCodeChange = (value) => {
    setUser((prevUser) => ({
      ...prevUser,
      countryCode: value,
    }));
  };

  const handleOrgUnitChange = (value) => {
    setUser((prevUser) => ({ ...prevUser, OrgUnit: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { countryCode, phone, notifyUser, password, associatedCompany, ...restUser } = user;

    let userPayload = {
      ...restUser,
      ...(phone && countryCode ? { phone: `${countryCode}${phone}` } : {}),
      ...(initialData ? {} : { password }),
      notifyViaEmail: notifyUser,
      company: associatedCompany,
    };

    if (initialData) {
      delete userPayload.email;
      delete userPayload.associatedCompany;
    } else {
      userPayload = { ...userPayload, company: associatedCompany };
    }

    Object.keys(userPayload).forEach((key) => {
      if (!userPayload[key]) delete userPayload[key];
    });

    onSubmit(userPayload);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      {/* Associated Company */}
      <div className="space-y-2">
        <Label htmlFor="associatedCompany">Associated Company</Label>
        <Input
          id="associatedCompany"
          name="associatedCompany"
          value={companyId}
          disabled
          className="bg-muted"
        />
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            id="fullName"
            name="fullName"
            placeholder="John Doe"
            className="pl-10"
            value={user.fullName}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john.doe@example.com"
            className="pl-10"
            value={user.email}
            onChange={handleChange}
            disabled={!!initialData} // Email is disabled only in update mode
            required
          />
        </div>
      </div>

      {/* Password - only shown for new users */}
      {!initialData && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={user.password}
              onChange={handleChange}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Number */}
      <div className="space-y-2">
        <Label>Mobile Number</Label>
        <div className="flex space-x-2">
          <Select
            name="countryCode"
            value={user.countryCode}
            onValueChange={handleCountryCodeChange}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Code" />
            </SelectTrigger>
            <SelectContent>
              {countryCodes.map((code) => (
                <SelectItem key={code.code} value={code.code}>
                  {code.country} {code.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={user.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            className="flex-1"
          />
        </div>
      </div>

      {/* Role Selection */}
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          name="role"
          value={user.role}
          onValueChange={(value) => handleChange({ target: { name: 'role', value } })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SuperAdmin">SuperAdmin</SelectItem>
            <SelectItem value="CountryAdmin">Country Admin</SelectItem>
            <SelectItem value="RegionalAdmin">Regional Admin</SelectItem>
            <SelectItem value="CityAdmin">City Admin</SelectItem>
            <SelectItem value="OfficeAdmin">Office Admin</SelectItem>
            <SelectItem value="EmployeeDashboardUser">Employee Dashboard User</SelectItem>
            <SelectItem value="BinDisplayUser">Bin Display User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Assigned Branch (Org Unit) Selection */}
      <div className="space-y-2">
        <Label htmlFor="OrgUnit">Assigned Branch (Org Unit)</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground z-10" />
          <Select
            name="OrgUnit"
            value={user.OrgUnit}
            onValueChange={handleOrgUnitChange}
            disabled={isLoading || orgUnitOptions.length === 0}
            required
          >
            <SelectTrigger className="pl-10">
              <SelectValue placeholder={isLoading ? 'Loading...' : 'Select a branch'} />
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
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      {/* Notification Checkbox (Edit Mode Only) */}
      {initialData && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="notifyUser"
            name="notifyUser"
            checked={user.notifyUser}
            onCheckedChange={(checked) =>
              handleChange({
                target: {
                  name: 'notifyUser',
                  type: 'checkbox',
                  checked,
                },
              })
            }
          />
          <Label htmlFor="notifyUser" className="text-sm font-normal">
            Notify user about this update via email
          </Label>
        </div>
      )}

      <div className="pt-2">
        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700">
          {initialData ? 'Update User' : 'Add User'}
        </Button>
      </div>
    </form>
  );
}
