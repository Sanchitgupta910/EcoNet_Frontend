"use client";

import { useState, useEffect } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { Label } from "./Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./Select";

// Country subdivision mapping for USA, UK, AUS, NZ
const countrySubdivisionMapping = {
  USA: {
    name: "United States",
    label: "State",
    options: [
      "Alabama",
      "Alaska",
      "Arizona",
      "Arkansas",
      "California",
      "Colorado",
      "Connecticut",
      "Delaware",
      "Florida",
      "Georgia",
      "Hawaii",
      "Idaho",
      "Illinois",
      "Indiana",
      "Iowa",
      "Kansas",
      "Kentucky",
      "Louisiana",
      "Maine",
      "Maryland",
      "Massachusetts",
      "Michigan",
      "Minnesota",
      "Mississippi",
      "Missouri",
      "Montana",
      "Nebraska",
      "Nevada",
      "New Hampshire",
      "New Jersey",
      "New Mexico",
      "New York",
      "North Carolina",
      "North Dakota",
      "Ohio",
      "Oklahoma",
      "Oregon",
      "Pennsylvania",
      "Rhode Island",
      "South Carolina",
      "South Dakota",
      "Tennessee",
      "Texas",
      "Utah",
      "Vermont",
      "Virginia",
      "Washington",
      "West Virginia",
      "Wisconsin",
      "Wyoming",
    ],
  },
  UK: {
    name: "United Kingdom",
    label: "Region",
    options: ["England", "Northern Ireland", "Scotland", "Wales"],
  },
  AUS: {
    name: "Australia",
    label: "State/Territory",
    options: [
      "New South Wales",
      "Victoria",
      "Queensland",
      "South Australia",
      "Western Australia",
      "Tasmania",
      "Northern Territory",
      "Australian Capital Territory",
    ],
  },
  NZ: {
    name: "New Zealand",
    label: "Region",
    options: [
      "Auckland",
      "Bay of Plenty",
      "Canterbury",
      "Gisborne",
      "Hawke's Bay",
      "Manawatu-Whanganui",
      "Marlborough",
      "Nelson",
      "Otago",
      "Southland",
      "Taranaki",
      "Tasman",
      "Waikato",
      "Wellington",
      "West Coast",
    ],
  },
};

const countryCodes = Object.keys(countrySubdivisionMapping);
const DEFAULT_SUBDIVISION_LABEL = "Region/Province";

export function AddressForm({ onSubmit, initialData, companyId }) {
  // Ensure initialData is an object
  const safeInitialData = initialData || {};
  const [address, setAddress] = useState({
    officeName: "",
    address: "",
    city: "",
    subdivision: "",
    postalCode: "",
    country: "",
    ...safeInitialData,
  });

  // Convert full country name to country code if needed
  useEffect(() => {
    if (safeInitialData.country) {
      const countryEntry = Object.entries(countrySubdivisionMapping).find(
        ([, data]) => data.name === safeInitialData.country
      );
      if (countryEntry) {
        setAddress((prev) => ({ ...prev, country: countryEntry[0] }));
      }
    }
  }, [safeInitialData]);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleCountryChange = (value) => {
    // Reset subdivision when country changes
    setAddress({ ...address, country: value, subdivision: "" });
  };

  const handleSubdivisionChange = (value) => {
    setAddress({ ...address, subdivision: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert country code to full name before submitting
    const countryName =
      address.country && countrySubdivisionMapping[address.country]
        ? countrySubdivisionMapping[address.country].name
        : address.country;

    // Attach subdivisionType using the mapping label
    onSubmit({
      ...address,
      country: countryName,
      subdivisionType:
        address.country && countrySubdivisionMapping[address.country]
          ? countrySubdivisionMapping[address.country].label
          : DEFAULT_SUBDIVISION_LABEL,
      associatedCompany: companyId,
    });
  };

  // Dynamic label for the subdivision field
  const getSubdivisionLabel = () => {
    return address.country && countrySubdivisionMapping[address.country]
      ? countrySubdivisionMapping[address.country].label
      : DEFAULT_SUBDIVISION_LABEL;
  };

  // Check if the selected country has predefined subdivision options
  const hasSubdivisionOptions =
    address.country && countrySubdivisionMapping[address.country];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="associatedCompany">Organization ID</Label>
        <Input
          id="associatedCompany"
          name="associatedCompany"
          value={companyId || ""}
          disabled
          className="bg-gray-100"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="officeName">Office Name</Label>
        <Input
          placeholder="e.g. NetNada HQ"
          id="officeName"
          name="officeName"
          value={address.officeName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Select
          value={address.country}
          onValueChange={handleCountryChange}
          required
        >
          <SelectTrigger id="country">
            <SelectValue placeholder="Select a country" />
          </SelectTrigger>
          <SelectContent>
            {countryCodes.map((code) => (
              <SelectItem key={code} value={code}>
                {countrySubdivisionMapping[code].name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subdivision">{getSubdivisionLabel()}</Label>
        {hasSubdivisionOptions ? (
          <Select
            value={address.subdivision}
            onValueChange={handleSubdivisionChange}
            required
          >
            <SelectTrigger id="subdivision">
              <SelectValue placeholder={`Select ${getSubdivisionLabel()}`} />
            </SelectTrigger>
            <SelectContent className="max-h-56 overflow-y-auto">
              {countrySubdivisionMapping[address.country].options.map(
                (option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="subdivision"
            name="subdivision"
            placeholder={`Enter ${getSubdivisionLabel().toLowerCase()}`}
            value={address.subdivision}
            onChange={handleChange}
            required
          />
        )}
      </div>

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
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={address.address}
          onChange={handleChange}
          required
        />
      </div>

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

      <Button type="submit" className="w-full mt-6">
        {safeInitialData && safeInitialData._id
          ? "Update Address"
          : "Add Address"}
      </Button>
    </form>
  );
}
