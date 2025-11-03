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
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Property } from "@/lib/transformers";

interface FoodFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  onSubmit: (data: any) => void;
  properties?: Property[];
}

export function FoodForm({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  properties = [],
}: FoodFormProps) {
  const [formData, setFormData] = useState({
    pg_id: initialData?.pg_id || "",
    date: initialData?.date || new Date().toISOString().split("T")[0],
    meal_type: initialData?.meal_type || "",
    menu_items: initialData?.menu_items || [],
    cost_per_person: initialData?.cost_per_person || "",
    total_cost: initialData?.total_cost || "",
    people_prepared_for: initialData?.people_prepared_for || "",
    people_actually_ate: initialData?.people_actually_ate || "",
    prepared_by: initialData?.prepared_by || "",
    notes: initialData?.notes || "",
    newMenuItem: "",
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

  const handleAddMenuItem = () => {
    if (formData.newMenuItem.trim()) {
      setFormData((prev) => ({
        ...prev,
        menu_items: [...prev.menu_items, prev.newMenuItem.trim()],
        newMenuItem: "",
      }));
    }
  };

  const handleRemoveMenuItem = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      menu_items: prev.menu_items.filter(
        (menuItem: string) => menuItem !== item,
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const { newMenuItem, ...dataToSubmit } = formData;
      onSubmit(dataToSubmit);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <ModalForm
      title={initialData ? "Edit Food Entry" : "Add Food Entry"}
      description="Enter the food register details"
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
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="meal_type">Meal Type</Label>
          <Select
            value={formData.meal_type}
            onValueChange={(value) => handleSelectChange("meal_type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select meal type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="breakfast">Breakfast</SelectItem>
              <SelectItem value="lunch">Lunch</SelectItem>
              <SelectItem value="dinner">Dinner</SelectItem>
              <SelectItem value="snacks">Snacks</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Menu Items</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.menu_items.map((item: string, index: number) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {item}
                <button
                  type="button"
                  onClick={() => handleRemoveMenuItem(item)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              id="newMenuItem"
              name="newMenuItem"
              value={formData.newMenuItem}
              onChange={handleChange}
              placeholder="Add a menu item"
            />
            <Button type="button" onClick={handleAddMenuItem} variant="outline">
              Add
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="people_prepared_for">People Prepared For</Label>
            <Input
              id="people_prepared_for"
              name="people_prepared_for"
              type="number"
              value={formData.people_prepared_for}
              onChange={handleChange}
              placeholder="Enter number of people prepared for"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="people_actually_ate">People Actually Ate</Label>
            <Input
              id="people_actually_ate"
              name="people_actually_ate"
              type="number"
              value={formData.people_actually_ate}
              onChange={handleChange}
              placeholder="Enter number of people who ate"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cost_per_person">Cost Per Person</Label>
            <Input
              id="cost_per_person"
              name="cost_per_person"
              type="number"
              step="0.01"
              value={formData.cost_per_person}
              onChange={handleChange}
              placeholder="Enter cost per person"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="total_cost">Total Cost</Label>
            <Input
              id="total_cost"
              name="total_cost"
              type="number"
              step="0.01"
              value={formData.total_cost}
              onChange={handleChange}
              placeholder="Enter total cost"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="prepared_by">Prepared By</Label>
            <Input
              id="prepared_by"
              name="prepared_by"
              value={formData.prepared_by}
              onChange={handleChange}
              placeholder="Enter who prepared the meal"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter any notes"
            />
          </div>
        </div>
      </div>
    </ModalForm>
  );
}
