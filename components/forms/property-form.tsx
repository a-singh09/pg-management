"use client";

import { Button } from "@/components/ui/button";

import type React from "react";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModalForm } from "@/components/modals/modal-form";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface PropertyFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  onSubmit: (data: any) => void;
}

export function PropertyForm({
  isOpen,
  onClose,
  initialData,
  onSubmit,
}: PropertyFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    location: initialData?.location || "",
    owner: initialData?.owner || "",
    contact: initialData?.contact || "",
    total_rooms: initialData?.total_rooms || "",
    beds_per_room: initialData?.beds_per_room || "2",
    rent_per_bed: initialData?.rent_per_bed || "",
    facilities: initialData?.facilities || [],
    newFacility: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFacility = () => {
    if (formData.newFacility.trim()) {
      setFormData((prev) => ({
        ...prev,
        facilities: [...prev.facilities, prev.newFacility.trim()],
        newFacility: "",
      }));
    }
  };

  const handleRemoveFacility = (facility: string) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.filter((f: string) => f !== facility),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { newFacility, ...dataToSubmit } = formData;

    // Validate contact number
    if (!/^[0-9]{10}$/.test(dataToSubmit.contact)) {
      alert("Contact number must be exactly 10 digits");
      return;
    }

    // Convert string numbers to actual numbers
    const processedData = {
      ...dataToSubmit,
      total_rooms: parseInt(dataToSubmit.total_rooms) || 0,
      beds_per_room: parseInt(dataToSubmit.beds_per_room) || 2,
      rent_per_bed: parseInt(dataToSubmit.rent_per_bed) || 0,
    };

    onSubmit(processedData);
  };

  return (
    <ModalForm
      title={initialData ? "Edit Property" : "Add New Property"}
      description="Enter the details of the property"
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    >
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Property Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter property name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter location"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="owner">Owner Name</Label>
            <Input
              id="owner"
              name="owner"
              value={formData.owner}
              onChange={handleChange}
              placeholder="Enter owner name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">Contact Number</Label>
            <Input
              id="contact"
              name="contact"
              type="tel"
              value={formData.contact}
              onChange={handleChange}
              placeholder="Enter 10-digit contact number"
              pattern="[0-9]{10}"
              maxLength={10}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="total_rooms">Total Rooms</Label>
            <Input
              id="total_rooms"
              name="total_rooms"
              type="number"
              value={formData.total_rooms}
              onChange={handleChange}
              placeholder="Enter total rooms"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="beds_per_room">Beds Per Room</Label>
            <Input
              id="beds_per_room"
              name="beds_per_room"
              type="number"
              value={formData.beds_per_room}
              onChange={handleChange}
              placeholder="Enter beds per room"
              min="1"
              max="10"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rent_per_bed">Rent Per Bed</Label>
            <Input
              id="rent_per_bed"
              name="rent_per_bed"
              type="number"
              value={formData.rent_per_bed}
              onChange={handleChange}
              placeholder="Enter rent per bed"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Facilities</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.facilities.map((facility: string, index: number) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {facility}
                <button
                  type="button"
                  onClick={() => handleRemoveFacility(facility)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              id="newFacility"
              name="newFacility"
              value={formData.newFacility}
              onChange={handleChange}
              placeholder="Add a facility"
            />
            <Button type="button" onClick={handleAddFacility} variant="outline">
              Add
            </Button>
          </div>
        </div>
      </div>
    </ModalForm>
  );
}
