import React, { useState, useEffect } from 'react';
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";

export function AddressForm({ onSubmit, initialData = {}, companyId }) {
  const [address, setAddress] = useState({
    officeName: '',
    address: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
    ...initialData // Ensure initialData is safely spread
  });

  useEffect(() => {
    // Update address state when initialData changes, e.g., when editing an existing address
    setAddress((prevAddress) => ({
      ...prevAddress,
      ...initialData
    }));
  }, [initialData]);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...address, associatedCompany: companyId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="associatedCompany">Organization ID</Label>
        <Input
          id="associatedCompany"
          name="associatedCompany"
          value={companyId || ''}
          disabled
          className="bg-gray-100"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="officeName">Office</Label>
        <Input
          placeholder="Company Name_region, e.g. NetNada_sydney"
          id="officeName"
          name="officeName"
          value={address.officeName}
          onChange={handleChange}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={address.address}
          onChange={handleChange}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            value={address.city}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">Region</Label>
          <Input
            id="region"
            name="region"
            value={address.region}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input
            id="postalCode"
            name="postalCode"
            value={address.postalCode}
            onChange={handleChange}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            name="country"
            value={address.country}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <Button type="submit" className="w-full">
        {initialData && initialData._id ? 'Update Address' : 'Add Address'}
      </Button>
    </form>
  );
}
