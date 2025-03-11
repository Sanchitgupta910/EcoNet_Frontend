// import React, { useState } from "react";
// import axios from "axios";
// import { Button } from "./Button";
// import { Label } from "./Label";
// import { useToast } from "@/components/ui/ToastProvider";

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "./Select";

// export function DustbinForm({ branches = [], onDustbinAdded }) {
//   const { success, error } = useToast();
//   const [formData, setFormData] = useState({
//     capacity: "",
//     officeName: "",
//     branchId: "",
//   });
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await axios.post("/api/v1/dustbin/adddustbin", {
//         binCapacity: formData.capacity,
//         branchAddress: formData.branchId,
//       });
//       setLoading(false);
//       success("Dustbin added successfully!", { title: "Success" });
//       onDustbinAdded(); // Refresh data after successful addition
//     } catch (err) {
//       setLoading(false);
//       if (err.response && err.response.data && err.response.data.message) {
//         setLoading(false);
//         error(err.response.data.message, { title: "Error" });
//       } else {
//         setLoading(false);
//         error("Bins already exist for this branch", {
//           title: "Error",
//         });
//       }
//     }
//   };

//   // Filter branches; if isdeleted is missing, assume it's not deleted
//   const filteredBranches = branches.filter(
//     (branch) => branch.isdeleted === false || branch.isdeleted === undefined
//   );

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div className="space-y-2">
//         <Label htmlFor="capacity">Dustbin Capacity</Label>
//         <Select
//           value={formData.capacity}
//           onValueChange={(value) =>
//             setFormData({ ...formData, capacity: value })
//           }
//         >
//           <SelectTrigger id="capacity" className="w-full">
//             <SelectValue placeholder="Select capacity" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="25">25L</SelectItem>
//             <SelectItem value="50">50L</SelectItem>
//             <SelectItem value="75">75L</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="branch">Branch</Label>
//         <Select
//           value={formData.officeName}
//           onValueChange={(value) => {
//             const selectedBranch = branches.find(
//               (branch) => branch.officeName === value || branch.name === value
//             );
//             setFormData({
//               ...formData,
//               officeName: value,
//               branchId: selectedBranch
//                 ? selectedBranch._id || selectedBranch.id
//                 : "",
//             });
//           }}
//         >
//           <SelectTrigger id="branch" className="w-full">
//             <SelectValue placeholder="Select branch" />
//           </SelectTrigger>
//           <SelectContent>
//             {filteredBranches.map((branch) => (
//               <SelectItem
//                 key={branch._id || branch.id}
//                 value={branch.officeName || branch.name}
//               >
//                 {branch.name || branch.officeName}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       <Button type="submit" className="w-full" disabled={loading}>
//         {loading ? "Adding..." : "Add Dustbin"}
//       </Button>
//     </form>
//   );
// }
"use client";

import { useState } from "react";
import axios from "axios";
import { Button } from "./Button";
import { Label } from "./Label";
import { useToast } from "@/components/ui/ToastProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";

export function DustbinForm({ branches = [], onDustbinAdded }) {
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    capacity: "",
    officeName: "",
    branchId: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/api/v1/dustbin/adddustbin", {
        binCapacity: formData.capacity,
        branchAddress: formData.branchId,
      });

      setLoading(false);

      // Call onDustbinAdded to close the dialog first
      onDustbinAdded();

      // Show success toast after a small delay to ensure dialog is closed
      setTimeout(() => {
        success("Bins added successfully!", { title: "Success" });
      }, 300);
    } catch (err) {
      setLoading(false);

      // Store the error message
      const errorMessage =
        err.response?.data?.message ||
        "Bins for this branch already exist. Please try again with a different branch.";

      // Call onDustbinAdded to close the dialog first
      onDustbinAdded();

      // Show error toast after a small delay to ensure dialog is closed
      setTimeout(() => {
        error(errorMessage, { title: "Error" });
      }, 300);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="capacity">Dustbin Capacity</Label>
        <Select
          value={formData.capacity}
          onValueChange={(value) =>
            setFormData({ ...formData, capacity: value })
          }
          required
        >
          <SelectTrigger id="capacity" className="w-full">
            <SelectValue placeholder="Select capacity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="25">25L</SelectItem>
            <SelectItem value="50">50L</SelectItem>
            <SelectItem value="75">75L</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="branch">Branch</Label>
        <Select
          value={formData.officeName}
          onValueChange={(value) => {
            const selectedBranch = branches.find(
              (branch) => branch.name === value
            );
            setFormData({
              ...formData,
              officeName: value,
              branchId: selectedBranch ? selectedBranch.id : "",
            });
          }}
          required
        >
          <SelectTrigger id="branch" className="w-full">
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent>
            {branches
              .filter((branch) => !branch.isdeleted)
              .map((branch) => (
                <SelectItem key={branch.id} value={branch.name}>
                  {branch.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        className="w-full bg-primary hover:bg-primary/90 text-white"
        disabled={loading}
      >
        {loading ? (
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
          "Add Bins"
        )}
      </Button>
    </form>
  );
}
