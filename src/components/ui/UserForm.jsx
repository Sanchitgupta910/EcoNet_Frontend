import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Eye, EyeOff } from "lucide-react";
import { countryCodes } from "./countrycodes";

export function UserForm({ onSubmit, branches, companyId }) {
  const [user, setUser] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    countryCode: "",
    officeName: "",
    associatedCompany: companyId,
    branchAddress: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user.officeName) {
      const selectedBranch = branches.find(
        (branch) => branch.name === user.officeName
      );
      setUser((prevUser) => ({
        ...prevUser,
        branchAddress: selectedBranch ? selectedBranch.id : "",
      }));
    }
  }, [user.officeName, branches]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevUser) => ({
      ...prevUser,
      [name]: value,
    }));
  };

  const handleCountryCodeChange = (value) => {
    setUser((prevUser) => ({
      ...prevUser,
      countryCode: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { countryCode, phone, ...restUser } = user;
    const userWithPhone = {
      ...restUser,
      phone: `${countryCode}${phone}`,
    };
    onSubmit(userWithPhone);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="associatedCompany">Associated Company</Label>
        <Input
          id="associatedCompany"
          name="associatedCompany"
          value={companyId}
          disabled
          className="bg-gray-100"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          value={user.fullName}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          value={user.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={user.password}
            onChange={handleChange}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Country Code and Phone Number */}
      <div className="space-y-2">
        <Label>Mobile Number</Label>
        <div className="flex space-x-2">
          <Select name="countryCode" onValueChange={handleCountryCodeChange}>
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
          onValueChange={(value) =>
            handleChange({ target: { name: "role", value } })
          }
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SuperAdmin">SuperAdmin</SelectItem>
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

      <div className="space-y-2">
        <Label htmlFor="officeName">Branch</Label>
        <Select
          name="officeName"
          value={user.officeName}
          onValueChange={(value) =>
            handleChange({ target: { name: "officeName", value } })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.name}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="branchAddress">Branch ID</Label>
        <Input
          id="branchAddress"
          name="branchAddress"
          value={user.branchAddress}
          disabled
          className="bg-gray-100"
        />
      </div>

      <Button type="submit" className="w-full">
        Add Admin User
      </Button>
    </form>
  );
}
