"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import type { Property } from "@/lib/services/property-service";
import { roomService, type Room } from "@/lib/services/room-service";

interface TenantFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  readOnly?: boolean;
  properties?: Property[];
  rooms?: Room[];
}

export function TenantForm({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  isSubmitting = false,
  readOnly = false,
  properties = [],
  rooms = [],
}: TenantFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    address: initialData?.address || "",
    emergency_contact: initialData?.emergency_contact || "",
    emergency_contact_name: initialData?.emergency_contact_name || "",
    id_proof_type: initialData?.id_proof_type || "",
    id_proof_number: initialData?.id_proof_number || "",
    dob: initialData?.dob
      ? new Date(initialData.dob).toISOString().split("T")[0]
      : "",
    pg_id: initialData?.pg_id || "",
    room_id: initialData?.room_id || "",
    bed_no: initialData?.bed_no || "",
    check_in: initialData?.check_in
      ? new Date(initialData.check_in).toISOString().split("T")[0]
      : "",
    check_out: initialData?.check_out
      ? new Date(initialData.check_out).toISOString().split("T")[0]
      : "",
    rent_due: initialData?.rent_due
      ? new Date(initialData.rent_due).toISOString().split("T")[0]
      : "",
    rent_paid: initialData?.rent_paid || "",
    status: initialData?.status || "active",
  });

  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);

  useEffect(() => {
    if (formData.pg_id) {
      // First, let's see all rooms for the property (without available_beds filter)
      const allRoomsForProperty = rooms.filter(
        (room) => room.pg_id === formData.pg_id,
      );

      // Then filter for available beds
      const filteredRooms = allRoomsForProperty.filter(
        (room) => room.available_beds > 0,
      );

      console.log(
        `Property ${formData.pg_id}: ${allRoomsForProperty.length} total rooms, ${filteredRooms.length} with available beds`,
      );

      setAvailableRooms(filteredRooms);
    } else {
      setAvailableRooms([]);
    }
  }, [formData.pg_id, rooms]);

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

    // Client-side validation
    const requiredFields = [
      "name",
      "phone",
      "email",
      "address",
      "emergency_contact",
      "emergency_contact_name",
      "id_proof_type",
      "id_proof_number",
      "dob",
      "pg_id",
      "room_id",
      "bed_no",
      "check_in",
      "rent_due",
      "rent_paid",
    ];

    const missingFields = requiredFields.filter((field) => {
      const value = formData[field as keyof typeof formData];
      return !value || (typeof value === "string" && value.trim() === "");
    });

    if (missingFields.length > 0) {
      alert(
        `Please fill in the following required fields: ${missingFields.join(", ")}`,
      );
      return;
    }

    console.log("Submitting tenant form data:", formData);
    onSubmit(formData);
  };

  return (
    <ModalForm
      title={initialData ? "Edit Tenant" : "Check In New Tenant"}
      description="Enter the tenant details"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tenant Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter tenant name"
              required
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
              disabled={readOnly}
            />
          </div>
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
            disabled={readOnly}
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
            disabled={readOnly}
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
              disabled={readOnly}
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
              disabled={readOnly}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="id_proof_type">ID Proof Type</Label>
            <Select
              value={formData.id_proof_type}
              onValueChange={(value) =>
                handleSelectChange("id_proof_type", value)
              }
              disabled={readOnly}
              required
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
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input
              id="dob"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              required
              disabled={readOnly}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pg_id">Property</Label>
            <Select
              value={formData.pg_id}
              onValueChange={(value) => handleSelectChange("pg_id", value)}
              disabled={readOnly}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="room_id">
              Room {formData.pg_id && `(${availableRooms.length} available)`}
            </Label>
            <Select
              value={formData.room_id}
              onValueChange={(value) => handleSelectChange("room_id", value)}
              disabled={
                readOnly || !formData.pg_id || availableRooms.length === 0
              }
              required
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !formData.pg_id
                      ? "Select property first"
                      : availableRooms.length === 0
                        ? "No rooms available"
                        : "Select room"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.length === 0 ? (
                  <SelectItem value="no-rooms" disabled>
                    {!formData.pg_id
                      ? "Please select a property first"
                      : rooms.filter((r) => r.pg_id === formData.pg_id)
                            .length === 0
                        ? "No rooms found for this property. Please create rooms first."
                        : "All rooms are occupied. No available beds."}
                  </SelectItem>
                ) : (
                  availableRooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      Room {room.room_number} ({room.available_beds} beds
                      available)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bed_no">Bed Number</Label>
            <Input
              id="bed_no"
              name="bed_no"
              type="number"
              value={formData.bed_no}
              onChange={handleChange}
              placeholder="Enter bed number"
              required
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="check_in">Check In Date</Label>
            <Input
              id="check_in"
              name="check_in"
              type="date"
              value={formData.check_in}
              onChange={handleChange}
              required
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rent_due">Rent Due Date</Label>
            <Input
              id="rent_due"
              name="rent_due"
              type="date"
              value={formData.rent_due}
              onChange={handleChange}
              required
              disabled={readOnly}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rent_paid">Rent Amount</Label>
            <Input
              id="rent_paid"
              name="rent_paid"
              type="number"
              value={formData.rent_paid}
              onChange={handleChange}
              placeholder="Enter rent amount"
              required
              disabled={readOnly}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange("status", value)}
              disabled={readOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="left">Left</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {formData.status === "left" && (
          <div className="space-y-2">
            <Label htmlFor="check_out">Check Out Date</Label>
            <Input
              id="check_out"
              name="check_out"
              type="date"
              value={formData.check_out}
              onChange={handleChange}
              disabled={readOnly}
            />
          </div>
        )}
      </div>
    </ModalForm>
  );
}
