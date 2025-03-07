import React, { useState } from "react";
import axios from "axios";
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

export function DustbinForm({ branches = [], onDustbinAdded }) {
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
      onDustbinAdded(); // Call the callback to close the form and refresh data
    } catch (error) {
      console.error("Error adding dustbin:", error);
      setLoading(false);
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
        >
          <SelectTrigger id="branch" className="w-full">
            <SelectValue placeholder="Select branch" />
          </SelectTrigger>
          <SelectContent>
            {branches
              .filter((branch) => !branch.isdeleted) // Exclude deleted branches
              .map((branch) => (
                <SelectItem key={branch.id} value={branch.name}>
                  {branch.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Adding..." : "Add Dustbin"}
      </Button>
    </form>
  );
}
