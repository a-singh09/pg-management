"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ModalForm } from "@/components/modals/modal-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { pgs, rooms } from "@/lib/data"

interface TenantFormProps {
  isOpen: boolean
  onClose: () => void
  initialData?: any
  onSubmit: (data: any) => void
}

export function TenantForm({ isOpen, onClose, initialData, onSubmit }: TenantFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    pg_id: initialData?.pg_id || "",
    room_id: initialData?.room_id || "",
    bed_no: initialData?.bed_no || "",
    check_in: initialData?.check_in ? new Date(initialData.check_in).toISOString().split("T")[0] : "",
    check_out: initialData?.check_out ? new Date(initialData.check_out).toISOString().split("T")[0] : "",
    rent_due: initialData?.rent_due ? new Date(initialData.rent_due).toISOString().split("T")[0] : "",
    rent_paid: initialData?.rent_paid || "",
    status: initialData?.status || "active",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableRooms, setAvailableRooms] = useState<any[]>([])

  useEffect(() => {
    if (formData.pg_id) {
      const filteredRooms = rooms.filter((room) => room.pg_id === formData.pg_id && room.available_beds > 0)
      setAvailableRooms(filteredRooms)
    } else {
      setAvailableRooms([])
    }
  }, [formData.pg_id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      onSubmit(formData)
      setIsSubmitting(false)
    }, 1000)
  }

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
          />
        </div>

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
            <Label htmlFor="room_id">Room</Label>
            <Select
              value={formData.room_id}
              onValueChange={(value) => handleSelectChange("room_id", value)}
              disabled={!formData.pg_id || availableRooms.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={!formData.pg_id ? "Select property first" : "Select room"} />
              </SelectTrigger>
              <SelectContent>
                {availableRooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    Room {room.room_number} ({room.available_beds} beds available)
                  </SelectItem>
                ))}
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
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
            <Input id="check_out" name="check_out" type="date" value={formData.check_out} onChange={handleChange} />
          </div>
        )}
      </div>
    </ModalForm>
  )
}
