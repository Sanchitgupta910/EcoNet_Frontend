// 'use client';

// import { useState, useEffect } from 'react';
// import { Button } from './Button';
// import { Input } from './Input';
// import { Label } from './Label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
// import { Eye, EyeOff } from 'lucide-react';
// import { countryCodes } from './CountryCodes';
// import { useToast } from '@/components/ui/ToastProvider';
// export function UserForm({ onSubmit, branches, companyId, initialData }) {
//   const [user, setUser] = useState({
//     fullName: initialData?.fullName || '',
//     email: initialData?.email || '',
//     password: initialData ? '' : '',
//     phone: initialData?.phone?.replace(/^\+\d+/, '') || '',
//     countryCode: initialData?.phone ? initialData.phone.match(/^\+(\d+)/)?.[0] || '' : '',
//     role: initialData?.role || '',
//     subdivision: initialData?.subdivision || '',
//     subdivisionType: initialData?.subdivisionType || '',
//     associatedCompany: companyId,
//     branchAddress: initialData?.branchAddress || '',
//     notifyUser: false,
//   });
//   const [showPassword, setShowPassword] = useState(false);

//   useEffect(() => {
//     if (user.officeName) {
//       const selectedBranch = branches.find((branch) => branch.name === user.officeName);
//       setUser((prevUser) => ({
//         ...prevUser,
//         branchAddress: selectedBranch ? selectedBranch.id : '',
//       }));
//     }
//   }, [user.officeName, branches]);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setUser((prevUser) => ({
//       ...prevUser,
//       [name]: type === 'checkbox' ? checked : value,
//     }));
//   };

//   const handleCountryCodeChange = (value) => {
//     setUser((prevUser) => ({
//       ...prevUser,
//       countryCode: value,
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const { countryCode, phone, notifyUser, password, associatedCompany, ...restUser } = user;

//     // Build the payload for update
//     let userPayload = {
//       ...restUser,
//       ...(phone && countryCode ? { phone: `${countryCode}${phone}` } : {}),
//       // For new users, include password; for updates, don't include password
//       ...(initialData ? {} : { password }),
//       notifyViaEmail: notifyUser,
//       company: associatedCompany,
//     };

//     // In edit mode, remove email and associatedCompany (since these fields are disabled)
//     if (initialData) {
//       delete userPayload.email;
//       delete userPayload.associatedCompany;
//     } else {
//       // For new users, rename associatedCompany to company to match the model
//       userPayload = { ...userPayload, company: associatedCompany };
//     }

//     // Remove any empty fields from the payload
//     Object.keys(userPayload).forEach((key) => !userPayload[key] && delete userPayload[key]);

//     onSubmit(userPayload);
//   };

//   const togglePasswordVisibility = () => {
//     setShowPassword(!showPassword);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div className="space-y-2">
//         <Label htmlFor="associatedCompany">Associated Company</Label>
//         <Input
//           id="associatedCompany"
//           name="associatedCompany"
//           value={companyId}
//           disabled
//           className="bg-gray-100"
//         />
//       </div>
//       <div className="space-y-2">
//         <Label htmlFor="fullName">Full Name</Label>
//         <Input
//           id="fullName"
//           name="fullName"
//           value={user.fullName}
//           onChange={handleChange}
//           required
//         />
//       </div>
//       <div className="space-y-2">
//         <Label htmlFor="email">Email</Label>
//         <Input id="email" name="email" type="email" value={user.email} disabled />
//       </div>
//       {!initialData && (
//         <div className="space-y-2">
//           <Label htmlFor="password">Password</Label>
//           <div className="relative">
//             <Input
//               id="password"
//               name="password"
//               type={showPassword ? 'text' : 'password'}
//               value={user.password}
//               onChange={handleChange}
//               required
//             />
//             <Button
//               type="button"
//               variant="ghost"
//               size="icon"
//               className="absolute right-2 top-1/2 -translate-y-1/2"
//               onClick={togglePasswordVisibility}
//             >
//               {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//             </Button>
//           </div>
//         </div>
//       )}

//       {/* Country Code and Phone Number */}
//       <div className="space-y-2">
//         <Label>Mobile Number</Label>
//         <div className="flex space-x-2">
//           <Select
//             name="countryCode"
//             value={user.countryCode}
//             onValueChange={handleCountryCodeChange}
//           >
//             <SelectTrigger className="w-[150px]">
//               <SelectValue placeholder="Code" />
//             </SelectTrigger>
//             <SelectContent>
//               {countryCodes.map((code) => (
//                 <SelectItem key={code.code} value={code.code}>
//                   {code.country} {code.code}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//           <Input
//             id="phone"
//             name="phone"
//             type="tel"
//             value={user.phone}
//             onChange={handleChange}
//             placeholder="Phone Number"
//             className="flex-1"
//           />
//         </div>
//       </div>

//       {/* Role Selection */}
//       <div className="space-y-2">
//         <Label htmlFor="role">Role</Label>
//         <Select
//           name="role"
//           value={user.role}
//           onValueChange={(value) => handleChange({ target: { name: 'role', value } })}
//           required
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Select a role" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="SuperAdmin">SuperAdmin</SelectItem>
//             <SelectItem value="RegionalAdmin">Regional Admin</SelectItem>
//             <SelectItem value="CountryAdmin">Country Admin</SelectItem>
//             <SelectItem value="CityAdmin">City Admin</SelectItem>
//             <SelectItem value="OfficeAdmin">Office Admin</SelectItem>
//             <SelectItem value="EmployeeDashboardUser">Employee Dashboard User</SelectItem>
//             <SelectItem value="BinDisplayUser">Bin Display User</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="branchAddress">Branch</Label>
//         <Select
//           name="branchAddress"
//           value={user.branchAddress}
//           onValueChange={(value) => handleChange({ target: { name: 'branchAddress', value } })}
//         >
//           <SelectTrigger>
//             <SelectValue placeholder="Select a branch" />
//           </SelectTrigger>
//           <SelectContent>
//             {branches.map((branch) => (
//               <SelectItem key={branch.id} value={branch.id}>
//                 {branch.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Notification checkbox - only shown when editing */}
//       {initialData && (
//         <div className="flex items-center space-x-2">
//           <input
//             type="checkbox"
//             id="notifyUser"
//             name="notifyUser"
//             checked={user.notifyUser}
//             onChange={handleChange}
//             className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
//           />
//           <Label htmlFor="notifyUser" className="text-sm font-normal">
//             Notify user about this update via email
//           </Label>
//         </div>
//       )}

//       <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">
//         {initialData ? 'Update User' : 'Add User'}
//       </Button>
//     </form>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Label } from './Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
import { Eye, EyeOff } from 'lucide-react';
import { countryCodes } from './CountryCodes';
import { useToast } from '@/components/ui/ToastProvider';

export function UserForm({ onSubmit, branches, companyId, initialData }) {
  const [user, setUser] = useState({
    fullName: initialData?.fullName || '',
    email: initialData?.email || '',
    password: initialData ? '' : '',
    // Updated regex: only remove the first 1-3 digits after the '+'.
    phone: initialData?.phone ? initialData.phone.replace(/^\+\d{1,3}/, '') : '',
    // Updated regex to capture only a 1-3 digit country code.
    countryCode: initialData?.phone ? initialData.phone.match(/^\+\d{1,3}/)?.[0] || '' : '',
    role: initialData?.role || '',
    subdivision: initialData?.subdivision || '',
    subdivisionType: initialData?.subdivisionType || '',
    associatedCompany: companyId,
    branchAddress: initialData?.branchAddress || '',
    notifyUser: false,
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user.officeName) {
      const selectedBranch = branches.find((branch) => branch.name === user.officeName);
      setUser((prevUser) => ({
        ...prevUser,
        branchAddress: selectedBranch ? selectedBranch.id : '',
      }));
    }
  }, [user.officeName, branches]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const { countryCode, phone, notifyUser, password, associatedCompany, ...restUser } = user;

    // Build the payload for update
    let userPayload = {
      ...restUser,
      ...(phone && countryCode ? { phone: `${countryCode}${phone}` } : {}),
      // For new users, include password; for updates, don't include password
      ...(initialData ? {} : { password }),
      notifyViaEmail: notifyUser,
      company: associatedCompany,
    };

    // In edit mode, remove email and associatedCompany (since these fields are disabled)
    if (initialData) {
      delete userPayload.email;
      delete userPayload.associatedCompany;
    } else {
      // For new users, rename associatedCompany to company to match the model
      userPayload = { ...userPayload, company: associatedCompany };
    }

    // Remove any empty fields from the payload
    Object.keys(userPayload).forEach((key) => !userPayload[key] && delete userPayload[key]);

    onSubmit(userPayload);
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
        <Input id="email" name="email" type="email" value={user.email} disabled />
      </div>
      {!initialData && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
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
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Country Code and Phone Number */}
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
            <SelectItem value="RegionalAdmin">Regional Admin</SelectItem>
            <SelectItem value="CountryAdmin">Country Admin</SelectItem>
            <SelectItem value="CityAdmin">City Admin</SelectItem>
            <SelectItem value="OfficeAdmin">Office Admin</SelectItem>
            <SelectItem value="EmployeeDashboardUser">Employee Dashboard User</SelectItem>
            <SelectItem value="BinDisplayUser">Bin Display User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="branchAddress">Branch</Label>
        <Select
          name="branchAddress"
          value={user.branchAddress}
          onValueChange={(value) => handleChange({ target: { name: 'branchAddress', value } })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a branch" />
          </SelectTrigger>
          <SelectContent>
            {branches.map((branch) => (
              <SelectItem key={branch.id} value={branch.id}>
                {branch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notification checkbox - only shown when editing */}
      {initialData && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="notifyUser"
            name="notifyUser"
            checked={user.notifyUser}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="notifyUser" className="text-sm font-normal">
            Notify user about this update via email
          </Label>
        </div>
      )}

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white">
        {initialData ? 'Update User' : 'Add User'}
      </Button>
    </form>
  );
}
