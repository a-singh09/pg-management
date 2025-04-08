"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ModalForm } from "@/components/modals/modal-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { pgs } from "@/lib/data"
import { Button } from "@/components/ui/button"

interface FoodFormProps {
  isOpen: boolean
  onClose: () => void
  initialData?: any
  onSubmit: (data: any) => void
}

export function FoodForm({ isOpen, onClose, initialData, onSubmit }: FoodFormProps) {
  const [formData, setFormData] = useState({
    pg_id: initialData?.pg_id || "",
    date: initialData?.date || new Date().toISOString().split("T")[0],
    meals_served: initialData?.meals_served || "",
    menu: initialData?.menu || [],
    newMenuItem: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddMenuItem = () => {
    if (formData.newMenuItem.trim()) {
      setFormData((prev) => ({
        ...prev,
        menu: [...prev.menu, prev.newMenuItem.trim()],
        newMenuItem: "",
      }))
    }
  }

  const handleRemoveMenuItem = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      menu: prev.menu.filter((menuItem: string) => menuItem !== item),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      const { newMenuItem, ...dataToSubmit } = formData
      onSubmit(dataToSubmit)
      setIsSubmitting(false)
    }, 1000)
  }

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
            <Select value={formData.pg_id} onValueChange={(value) => handleSelectChange("pg_id", value)}>
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
            <Label htmlFor="date">Date</Label>
            <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="meals_served">Meals Served</Label>
          <Input
            id="meals_served"
            name="meals_served"
            type="number"
            value={formData.meals_served}
            onChange={handleChange}
            placeholder="Enter number of meals served"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Menu Items</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.menu.map((item: string, index: number) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
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
      </div>
    </ModalForm>
  )
}
