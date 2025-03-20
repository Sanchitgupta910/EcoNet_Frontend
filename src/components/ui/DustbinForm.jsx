// // 'use client';

// // import { useState, useEffect } from 'react';
// // import axios from 'axios';
// // import { Button } from './Button';
// // import { Label } from './Label';
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
// // import { Trash2, Check, Loader2, AlertCircle } from 'lucide-react';

// // const AddBinsForm = () => {
// //   const [formData, setFormData] = useState({
// //     capacity: '',
// //     branchId: '',
// //     binTypes: [],
// //   });
// //   const [branches, setBranches] = useState([]);
// //   const [isSubmitting, setIsSubmitting] = useState(false);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [error, setError] = useState('');
// //   const [success, setSuccess] = useState('');

// //   // Bin types with their associated colors
// //   const binTypeOptions = [
// //     {
// //       id: 'general-waste',
// //       label: 'General Waste',
// //       color: 'bg-slate-600',
// //       hoverColor: 'hover:bg-slate-700',
// //       textColor: 'text-white',
// //     },
// //     {
// //       id: 'commingled',
// //       label: 'Commingled',
// //       color: 'bg-yellow-500',
// //       hoverColor: 'hover:bg-yellow-600',
// //       textColor: 'text-white',
// //     },
// //     {
// //       id: 'organic',
// //       label: 'Organic',
// //       color: 'bg-green-500',
// //       hoverColor: 'hover:bg-green-600',
// //       textColor: 'text-white',
// //     },
// //     {
// //       id: 'paper-cardboard',
// //       label: 'Paper & Cardboard',
// //       color: 'bg-blue-500',
// //       hoverColor: 'hover:bg-blue-600',
// //       textColor: 'text-white',
// //     },
// //     {
// //       id: 'glass',
// //       label: 'Glass',
// //       color: 'bg-purple-500',
// //       hoverColor: 'hover:bg-purple-600',
// //       textColor: 'text-white',
// //     },
// //   ];

// //   // Check if form is valid (all required fields filled)
// //   const isFormValid = formData.capacity && formData.branchId && formData.binTypes.length > 0;

// //   // Fetch branches from backend
// //   useEffect(() => {
// //     const fetchBranches = async () => {
// //       setIsLoading(true);
// //       setError('');

// //       try {
// //         // Replace with your actual API endpoint
// //         const response = await axios.get('/api/v1/branches');
// //         setBranches(response.data.data || []);
// //       } catch (err) {
// //         console.error('Error fetching branches:', err);
// //         setError('Failed to load branches. Please try again.');
// //       } finally {
// //         setIsLoading(false);
// //       }
// //     };

// //     fetchBranches();
// //   }, []);

// //   const handleBinTypeToggle = (binType) => {
// //     setFormData((prev) => {
// //       const currentBinTypes = [...prev.binTypes];

// //       if (currentBinTypes.includes(binType)) {
// //         // Remove if already selected
// //         return {
// //           ...prev,
// //           binTypes: currentBinTypes.filter((type) => type !== binType),
// //         };
// //       } else {
// //         // Add if not selected
// //         return {
// //           ...prev,
// //           binTypes: [...currentBinTypes, binType],
// //         };
// //       }
// //     });
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();

// //     if (!isFormValid) return;

// //     setIsSubmitting(true);
// //     setError('');
// //     setSuccess('');

// //     try {
// //       // Replace with your actual API endpoint
// //       await axios.post('/api/v1/dustbin/adddustbin', {
// //         binCapacity: formData.capacity,
// //         branchAddress: formData.branchId,
// //         binTypes: formData.binTypes,
// //       });

// //       setSuccess('Bins added successfully!');

// //       // Reset form
// //       setFormData({
// //         capacity: '',
// //         branchId: '',
// //         binTypes: [],
// //       });
// //     } catch (err) {
// //       console.error('Error adding bins:', err);
// //       setError(err.response?.data?.message || 'Failed to add bins. Please try again.');
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   return (
// //     <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
// //       <div className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b">
// //         <h2 className="text-xl font-semibold text-slate-800 flex items-center">
// //           <Trash2 className="mr-2 h-5 w-5 text-primary" /> Add Waste Bins
// //         </h2>
// //         <p className="text-slate-600 text-sm mt-1">
// //           Configure and add waste bins to your selected branch
// //         </p>
// //       </div>

// //       {error && (
// //         <div className="mx-6 mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-start">
// //           <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
// //           <p className="text-red-800">{error}</p>
// //         </div>
// //       )}

// //       {success && (
// //         <div className="mx-6 mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded flex items-start">
// //           <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
// //           <p className="text-green-800">{success}</p>
// //         </div>
// //       )}

// //       <form onSubmit={handleSubmit} className="p-6 space-y-6">
// //         <div className="space-y-2">
// //           <Label htmlFor="capacity" className="text-slate-700 font-medium">
// //             Bin Capacity
// //           </Label>
// //           <Select
// //             value={formData.capacity}
// //             onValueChange={(value) => setFormData({ ...formData, capacity: value })}
// //             disabled={isSubmitting}
// //           >
// //             <SelectTrigger id="capacity" className="w-full">
// //               <SelectValue placeholder="Select bin capacity" />
// //             </SelectTrigger>
// //             <SelectContent>
// //               <SelectItem value="25">25L</SelectItem>
// //               <SelectItem value="50">50L</SelectItem>
// //               <SelectItem value="75">75L</SelectItem>
// //             </SelectContent>
// //           </Select>
// //         </div>

// //         <div className="space-y-2">
// //           <Label htmlFor="branch" className="text-slate-700 font-medium">
// //             Branch Location
// //           </Label>
// //           <Select
// //             value={formData.branchId}
// //             onValueChange={(value) => setFormData({ ...formData, branchId: value })}
// //             disabled={isSubmitting || isLoading}
// //           >
// //             <SelectTrigger id="branch" className="w-full">
// //               <SelectValue placeholder={isLoading ? 'Loading branches...' : 'Select branch'} />
// //             </SelectTrigger>
// //             <SelectContent>
// //               {branches.map((branch) => (
// //                 <SelectItem key={branch._id} value={branch._id}>
// //                   {branch.officeName}
// //                 </SelectItem>
// //               ))}
// //             </SelectContent>
// //           </Select>
// //           {isLoading && (
// //             <p className="text-sm text-slate-500 flex items-center mt-1">
// //               <Loader2 className="h-3 w-3 mr-2 animate-spin" />
// //               Loading branches...
// //             </p>
// //           )}
// //         </div>

// //         <div className="space-y-3">
// //           <Label className="text-slate-700 font-medium">Bin Types</Label>
// //           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
// //             {binTypeOptions.map((binType) => (
// //               <button
// //                 key={binType.id}
// //                 type="button"
// //                 onClick={() => handleBinTypeToggle(binType.label)}
// //                 className={`
// //                   flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all
// //                   ${
// //                     formData.binTypes.includes(binType.label)
// //                       ? `${binType.color} ${binType.textColor} border-transparent`
// //                       : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
// //                   }
// //                 `}
// //                 disabled={isSubmitting}
// //               >
// //                 <span className="font-medium">{binType.label}</span>
// //                 {formData.binTypes.includes(binType.label) && <Check className="h-5 w-5 ml-2" />}
// //               </button>
// //             ))}
// //           </div>
// //           {formData.binTypes.length === 0 && (
// //             <p className="text-sm text-slate-500">Please select at least one bin type</p>
// //           )}
// //         </div>

// //         <div className="pt-4">
// //           <Button
// //             type="submit"
// //             className="w-full bg-primary hover:bg-primary/90 text-white"
// //             disabled={!isFormValid || isSubmitting || isLoading}
// //           >
// //             {isSubmitting ? (
// //               <>
// //                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
// //                 Adding Bins...
// //               </>
// //             ) : (
// //               'Add Bins'
// //             )}
// //           </Button>
// //         </div>
// //       </form>
// //     </div>
// //   );
// // };

// // export default AddBinsForm;
// 'use client';

// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Button } from './Button';
// import { Label } from './Label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './Select';
// import { Trash2, Check, Loader2, AlertCircle } from 'lucide-react';

// const AddBinsForm = ({ branches, onDustbinAdded }) => {
//   const [formData, setFormData] = useState({
//     binCapacity: '',
//     branchAddress: '',
//     binTypes: [],
//   });

//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');

//   // Bin type options with colors
//   const binTypeOptions = [
//     { id: 'General Waste', label: 'General Waste', color: 'bg-slate-600' },
//     { id: 'Commingled', label: 'Commingled', color: 'bg-yellow-500' },
//     { id: 'Organic', label: 'Organic', color: 'bg-green-500' },
//     { id: 'Paper & Cardboard', label: 'Paper & Cardboard', color: 'bg-blue-500' },
//     { id: 'Glass', label: 'Glass', color: 'bg-purple-500' },
//   ];

//   const isFormValid =
//     formData.binCapacity && formData.branchAddress && formData.binTypes.length > 0;

//   const handleBinTypeToggle = (binType) => {
//     setFormData((prev) => {
//       const selectedBins = [...prev.binTypes];

//       if (selectedBins.includes(binType)) {
//         return { ...prev, binTypes: selectedBins.filter((type) => type !== binType) };
//       } else {
//         return { ...prev, binTypes: [...selectedBins, binType] };
//       }
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!isFormValid) return;

//     setIsSubmitting(true);
//     setError('');
//     setSuccess('');

//     try {
//       await axios.post('/api/v1/dustbin/adddustbin', formData);

//       setSuccess('Bins added successfully!');
//       setFormData({ binCapacity: '', branchAddress: '', binTypes: [] });

//       if (onDustbinAdded) onDustbinAdded();
//     } catch (err) {
//       console.error('Error adding bins:', err);
//       setError(err.response?.data?.message || 'Failed to add bins. Please try again.');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="w-full">
//       <div className="p-3 mb-1 ">
//         <h2 className="text-xl font-semibold text-slate-800 flex items-center">
//           <Trash2 className="mr-2 h-5 w-5 text-primary" /> Add Waste Bins
//         </h2>
//         <p className="text-slate-600 text-sm mt-1">Select and add waste bins to your branch.</p>
//       </div>

//       {error && (
//         <div className="mx-6 mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded flex items-start">
//           <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
//           <p className="text-red-800">{error}</p>
//         </div>
//       )}

//       {success && (
//         <div className="mx-6 mt-6 p-4 bg-green-50 border-l-4 border-green-500 rounded flex items-start">
//           <Check className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
//           <p className="text-green-800">{success}</p>
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="p-3 space-y-6">
//         {/* Bin Capacity Dropdown */}
//         <div className="space-y-2">
//           <Label htmlFor="capacity" className="text-slate-700 font-medium">
//             Bin Capacity
//           </Label>
//           <Select
//             value={formData.binCapacity}
//             onValueChange={(value) => setFormData({ ...formData, binCapacity: value })}
//             disabled={isSubmitting}
//           >
//             <SelectTrigger id="capacity" className="w-full">
//               <SelectValue placeholder="Select bin capacity" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="25">25L</SelectItem>
//               <SelectItem value="50">50L</SelectItem>
//               <SelectItem value="75">75L</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Branch Selection Dropdown */}
//         <div className="space-y-2">
//           <Label htmlFor="branch" className="text-slate-700 font-medium">
//             Branch Location
//           </Label>
//           <Select
//             value={formData.branchAddress}
//             onValueChange={(value) => setFormData({ ...formData, branchAddress: value })}
//             disabled={isSubmitting || !branches.length}
//           >
//             <SelectTrigger id="branch" className="w-full">
//               <SelectValue
//                 placeholder={branches.length ? 'Select branch' : 'No branches available'}
//               />
//             </SelectTrigger>
//             <SelectContent>
//               {branches.map((branch) => (
//                 <SelectItem key={branch.id} value={branch.id}>
//                   {branch.name}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>

//         {/* Bin Type Selection */}
//         <div className="space-y-3">
//           <Label className="text-slate-700 font-medium">Bin Types</Label>
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//             {binTypeOptions.map((binType) => (
//               <button
//                 key={binType.id}
//                 type="button"
//                 onClick={() => handleBinTypeToggle(binType.label)}
//                 className={`
//                   flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all
//                   ${
//                     formData.binTypes.includes(binType.label)
//                       ? `${binType.color} text-white border-transparent`
//                       : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
//                   }
//                 `}
//                 disabled={isSubmitting}
//               >
//                 <span className="font-medium">{binType.label}</span>
//                 {formData.binTypes.includes(binType.label) && <Check className="h-5 w-5 ml-2" />}
//               </button>
//             ))}
//           </div>
//           {formData.binTypes.length === 0 && (
//             <p className="text-sm text-slate-500">Please select at least one bin type</p>
//           )}
//         </div>

//         {/* Submit Button */}
//         <div className="pt-4">
//           <Button
//             type="submit"
//             className="w-full bg-primary hover:bg-primary/90 text-white"
//             disabled={!isFormValid || isSubmitting}
//           >
//             {isSubmitting ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Adding Bins...
//               </>
//             ) : (
//               'Add Bins'
//             )}
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export { AddBinsForm };

'use client';

import { useState } from 'react';
import axios from 'axios';
import { Trash2, Check, Loader2, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AddBinsForm({ branches, onDustbinAdded }) {
  const [formData, setFormData] = useState({
    binCapacity: '',
    branchAddress: '',
    binTypes: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Bin type options with colors
  const binTypeOptions = [
    { id: 'General Waste', label: 'General Waste', color: 'bg-slate-600' },
    { id: 'Commingled', label: 'Commingled', color: 'bg-yellow-500' },
    { id: 'Organic', label: 'Organic', color: 'bg-green-500' },
    { id: 'Paper & Cardboard', label: 'Paper & Cardboard', color: 'bg-blue-500' },
    { id: 'Glass', label: 'Glass', color: 'bg-purple-500' },
  ];

  const isFormValid =
    formData.binCapacity && formData.branchAddress && formData.binTypes.length > 0;

  const handleBinTypeToggle = (binType) => {
    setFormData((prev) => {
      const selectedBins = [...prev.binTypes];

      if (selectedBins.includes(binType)) {
        return { ...prev, binTypes: selectedBins.filter((type) => type !== binType) };
      } else {
        return { ...prev, binTypes: [...selectedBins, binType] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/v1/dustbin/adddustbin', formData);

      setSuccess('Bins added successfully!');
      setFormData({ binCapacity: '', branchAddress: '', binTypes: [] });

      if (onDustbinAdded) onDustbinAdded();
    } catch (err) {
      console.error('Error adding bins:', err);
      setError(err.response?.data?.message || 'Failed to add bins. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out deleted branches
  const activeBranches = branches.filter((branch) => !branch.isdeleted);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Trash2 className="mr-2 h-5 w-5 text-primary" /> Add Waste Bins
        </DialogTitle>
      </DialogHeader>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success" className="bg-green-50 text-green-800 border-green-200">
          <Check className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4 py-2">
        {/* Bin Capacity Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="binCapacity">Bin Capacity</Label>
          <Select
            value={formData.binCapacity}
            onValueChange={(value) => setFormData({ ...formData, binCapacity: value })}
            disabled={isSubmitting}
          >
            <SelectTrigger id="binCapacity">
              <SelectValue placeholder="Select bin capacity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25L</SelectItem>
              <SelectItem value="50">50L</SelectItem>
              <SelectItem value="75">75L</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Branch Selection Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="branchAddress">Branch Location</Label>
          <Select
            value={formData.branchAddress}
            onValueChange={(value) => setFormData({ ...formData, branchAddress: value })}
            disabled={isSubmitting || !activeBranches.length}
          >
            <SelectTrigger id="branchAddress">
              <SelectValue
                placeholder={activeBranches.length ? 'Select branch' : 'No branches available'}
              />
            </SelectTrigger>
            <SelectContent>
              {activeBranches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bin Type Selection */}
        <div className="space-y-3">
          <Label>Bin Types</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {binTypeOptions.map((binType) => (
              <button
                key={binType.id}
                type="button"
                onClick={() => handleBinTypeToggle(binType.label)}
                className={`
                  flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all
                  ${
                    formData.binTypes.includes(binType.label)
                      ? `${binType.color} text-white border-transparent`
                      : 'bg-background border-border text-foreground hover:border-primary/30'
                  }
                `}
                disabled={isSubmitting}
              >
                <span className="font-medium">{binType.label}</span>
                {formData.binTypes.includes(binType.label) && <Check className="h-5 w-5 ml-2" />}
              </button>
            ))}
          </div>
          {formData.binTypes.length === 0 && (
            <p className="text-sm text-muted-foreground">Please select at least one bin type</p>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={!isFormValid || isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Bins...
            </>
          ) : (
            'Add Bins'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
