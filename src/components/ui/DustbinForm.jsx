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
        <Button className="bg-indigo-600 hover:bg-indigo-700" type="submit" disabled={!isFormValid || isSubmitting}>
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
