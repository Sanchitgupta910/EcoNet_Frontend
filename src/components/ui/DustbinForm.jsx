import React, { useState, useEffect } from 'react'
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"


export function DustbinForm({ branches = [], onDustbinAdded  }) {
  const [formData, setFormData] = useState({
    capacity: '',
    branchName: '',
    branchId: ''
  })

  useEffect(() => {
    if (formData.branchName) {
      const selectedBranch = branches.find(branch => branch.name === formData.branchName)
      setFormData(prev => ({
        ...prev,
        branchId: selectedBranch ? selectedBranch.id : ''
      }))
    }
  }, [formData.branchName, branches])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
        await axios.post('/api/v1/dustbin/addDustbin', {
            binCapacity: formData.capacity,
            branchAddress: formData.branchId
        })

        onDustbinAdded();
    } catch (error) {
        console.log("Error adding dustbins due to the following error: ",error)
    }
  }

  return (
    
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="capacity">Dustbin Capacity</Label>
            <Select
              value={formData.capacity}
              onValueChange={(value) => setFormData({ ...formData, capacity: value })}
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
              value={formData.branchName}
              onValueChange={(value) => setFormData({ ...formData, branchName: value })}
            >
              <SelectTrigger id="branch" className="w-full">
                <SelectValue placeholder="Select branch" />
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
            <Label htmlFor="branchId">Branch ID</Label>
            <Input
              id="branchId"
              value={formData.branchId}
              disabled
              className="w-full bg-gray-100"
            />
          </div>

          <Button type="submit" className="w-full">
            Add Dustbin
          </Button>
        </form>
      
  )
}