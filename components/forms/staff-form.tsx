"use client";

import type React from "react";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalForm } from "@/components/modals/modal-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pgs } from "@/lib/data";

interface StaffFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  onSubmit: (data: any) => void;
}

export function StaffForm({
  isOpen,
  onClose,
  initialData,
  onSubmit,
}: StaffFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    role: initialData?.role || "",
    pg_id: initialData?.pg_id || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    salary: initialData?.salary || "",
    joining_date: initialData?.joining_date
      ? new Date(initialData.joining_date).toISOString().split("T")[0]
      : "",
    address: initialData?.address || "",
    emergency_contact: initialData?.emergency_contact || "",
    emergency_contact_name: initialData?.emergency_contact_name || "",
    id_proof_type: initialData?.id_proof_type || "aadhar",
    id_proof_number: initialData?.id_proof_number || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      onSubmit(formData);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <ModalForm
      title={initialData ? "Edit Staff Member" : "Add New Staff Member"}
      description="Enter the staff member details"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Staff Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter staff name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleSelectChange("role", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="caretaker">Caretaker</SelectItem>
                <SelectItem value="cleaner">Cleaner</SelectItem>
                <SelectItem value="cook">Cook</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pg_id">Assigned Property</Label>
            <Select
              value={formData.pg_id}
              onValueChange={(value) => handleSelectChange("pg_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {pgs.map((pg) => (
                  <SelectItem key={pg.id} value={pg.id}>
                    {pg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary">Salary</Label>
            <Input
              id="salary"
              name="salary"
              type="number"
              value={formData.salary}
              onChange={handleChange}
              placeholder="Enter salary amount"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="joining_date">Joining Date</Label>
          <Input
            id="joining_date"
            name="joining_date"
            type="date"
            value={formData.joining_date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter full address"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_name">
              Emergency Contact Name
            </Label>
            <Input
              id="emergency_contact_name"
              name="emergency_contact_name"
              value={formData.emergency_contact_name}
              onChange={handleChange}
              placeholder="Enter emergency contact name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergency_contact">Emergency Contact Phone</Label>
            <Input
              id="emergency_contact"
              name="emergency_contact"
              value={formData.emergency_contact}
              onChange={handleChange}
              placeholder="Enter emergency contact phone"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="id_proof_type">ID Proof Type</Label>
            <Select
              value={formData.id_proof_type}
              onValueChange={(value) =>
                handleSelectChange("id_proof_type", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ID proof type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aadhar">Aadhar Card</SelectItem>
                <SelectItem value="pan">PAN Card</SelectItem>
                <SelectItem value="voter_id">Voter ID</SelectItem>
                <SelectItem value="driving_license">Driving License</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="id_proof_number">ID Proof Number</Label>
            <Input
              id="id_proof_number"
              name="id_proof_number"
              value={formData.id_proof_number}
              onChange={handleChange}
              placeholder="Enter ID proof number"
              required
            />
          </div>
        </div>
      </div>
    </ModalForm>
  );
}
