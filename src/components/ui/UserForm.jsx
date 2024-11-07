// import React, { useState, useEffect } from 'react';
// import { Button } from "./button";
// import { Input } from "./input";
// import { Label } from "./label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
// import { Eye, EyeOff } from 'lucide-react';

// export function UserForm({ onSubmit, branches, companyId }) {
//   const [user, setUser] = useState({
//     fullName: '',
//     email: '',
//     password: '',
//     branchName: '',
//     associatedCompany: companyId,
//     associatedBranchId: ''
//   });
//   const [showPassword, setShowPassword] = useState(false);

//   useEffect(() => {
//     if (user.branchName) {
//       const selectedBranch = branches.find(branch => branch.name === user.branchName);
//       setUser(prevUser => ({
//         ...prevUser,
//         associatedBranchId: selectedBranch ? selectedBranch.id : ''
//       }));
//     }
//   }, [user.branchName, branches]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setUser(prevUser => ({
//       ...prevUser,
//       [name]: value
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     onSubmit(user);
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
//         <Input
//           id="email"
//           name="email"
//           type="email"
//           value={user.email}
//           onChange={handleChange}
//           required
//         />
//       </div>
//       <div className="space-y-2">
//         <Label htmlFor="password">Password</Label>
//         <div className="relative">
//           <Input
//             id="password"
//             name="password"
//             type={showPassword ? "text" : "password"}
//             value={user.password}
//             onChange={handleChange}
//             required
//           />
//           <Button
//             type="button"
//             variant="ghost"
//             size="icon"
//             className="absolute right-2 top-1/2 -translate-y-1/2"
//             onClick={togglePasswordVisibility}
//           >
//             {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//           </Button>
//         </div>
//       </div>
//       <div className="space-y-2">
//         <Label htmlFor="branchName">Branch</Label>
//         <Select name="branchName" value={user.branchName} onValueChange={(value) => handleChange({ target: { name: 'branchName', value } })}>
//           <SelectTrigger>
//             <SelectValue placeholder="Select a branch" />
//           </SelectTrigger>
//           <SelectContent>
//             {branches.map((branch) => (
//               <SelectItem key={branch.id} value={branch.name}>
//                 {branch.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>
//       <div className="space-y-2">
//         <Label htmlFor="associatedBranchId">Associated Branch ID</Label>
//         <Input
//           id="associatedBranchId"
//           name="associatedBranchId"
//           value={user.associatedBranchId}
//           disabled
//           className="bg-gray-100"
//         />
//       </div>
//       <Button type="submit" className="w-full">
//         Add User
//       </Button>
//     </form>
//   );
// }

import React, { useState, useEffect } from 'react';
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Eye, EyeOff } from 'lucide-react';

export function UserForm({ onSubmit, branches, companyId }) {
  const [user, setUser] = useState({
    fullName: '',
    email: '',
    password: '',
    branchName: '',
    associatedCompany: companyId,
    branchAddress: '' // Changed from associatedBranchId to branchAddress for backend compatibility
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user.branchName) {
      const selectedBranch = branches.find(branch => branch.name === user.branchName);
      setUser(prevUser => ({
        ...prevUser,
        branchAddress: selectedBranch ? selectedBranch.id : '' // Set branchAddress to branch ID
      }));
    }
  }, [user.branchName, branches]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prevUser => ({
      ...prevUser,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(user); // Pass user with branchAddress field
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
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="branchName">Branch</Label>
        <Select name="branchName" value={user.branchName} onValueChange={(value) => handleChange({ target: { name: 'branchName', value } })}>
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
          value={user.branchAddress} // Display branchAddress (branch ID)
          disabled
          className="bg-gray-100"
        />
      </div>
      <Button type="submit" className="w-full">
        Add User
      </Button>
    </form>
  );
}
