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

interface Property {
  id: string;
  name: string;
}

interface Tenant {
  id: string;
  name: string;
}

interface Room {
  id: string;
  room_number: string;
  pg_id: string;
}

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  onSubmit: (data: any) => void;
  properties?: Property[];
  tenants?: Tenant[];
  rooms?: Room[];
}

export function BookingForm({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  properties = [],
  tenants = [],
  rooms = [],
}: BookingFormProps) {
  const [formData, setFormData] = useState({
    pg_id: initialData?.pg_id || "",
    tenant_id: initialData?.tenant_id || "",
    room_id: initialData?.room_id || "",
    booking_date: initialData?.booking_date
      ? new Date(initialData.booking_date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    check_in_date: initialData?.check_in_date
      ? new Date(initialData.check_in_date).toISOString().split("T")[0]
      : "",
    rent_amount: initialData?.rent_amount || "",
    deposit_amount: initialData?.deposit_amount || "",
    status: initialData?.status || "pending",
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
      title={initialData ? "Edit Booking" : "New Booking"}
      description="Enter the booking details"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pg_id">Property</Label>
            <Select
              value={formData.pg_id}
              onValueChange={(value) => handleSelectChange("pg_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {properties.map((pg) => (
                  <SelectItem key={pg.id} value={pg.id}>
                    {pg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenant_id">Tenant</Label>
            <Select
              value={formData.tenant_id}
              onValueChange={(value) => handleSelectChange("tenant_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tenant" />
              </SelectTrigger>
              <SelectContent>
                {tenants.map((tenant) => (
                  <SelectItem key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="room_id">Room</Label>
            <Select
              value={formData.room_id}
              onValueChange={(value) => handleSelectChange("room_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select room" />
              </SelectTrigger>
              <SelectContent>
                {rooms
                  .filter(
                    (room) => !formData.pg_id || room.pg_id === formData.pg_id,
                  )
                  .map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      Room {room.room_number}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="check_in_date">Check-in Date</Label>
            <Input
              id="check_in_date"
              name="check_in_date"
              type="date"
              value={formData.check_in_date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="rent_amount">Rent Amount</Label>
            <Input
              id="rent_amount"
              name="rent_amount"
              type="number"
              value={formData.rent_amount}
              onChange={handleChange}
              placeholder="Enter rent amount"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deposit_amount">Deposit Amount</Label>
            <Input
              id="deposit_amount"
              name="deposit_amount"
              type="number"
              value={formData.deposit_amount}
              onChange={handleChange}
              placeholder="Enter deposit amount"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="booking_date">Booking Date</Label>
            <Input
              id="booking_date"
              name="booking_date"
              type="date"
              value={formData.booking_date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </ModalForm>
  );
}
