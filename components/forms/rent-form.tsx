"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ModalForm } from "@/components/modals/modal-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { pgs, tenants } from "@/lib/data"

interface RentFormProps {
  isOpen: boolean
  onClose: () => void
  initialData?: any
  onSubmit: (data: any) => void
}

export function RentForm({ isOpen, onClose, initialData, onSubmit }: RentFormProps) {
  const [formData, setFormData] = useState({
    tenant_id: initialData?.tenant_id || "",
    pg_id: initialData?.pg_id || "",
    amount_paid: initialData?.amount_paid || "",
    payment_date: initialData?.payment_date
      ? new Date(initialData.payment_date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    due_date: initialData?.due_date ? new Date(initialData.due_date).toISOString().split("T")[0] : "",
    status: initialData?.status || "paid",
    receipt_url: initialData?.receipt_url || "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filteredTenants, setFilteredTenants] = useState<any[]>([])

  useEffect(() => {
    if (formData.pg_id) {
      const filtered = tenants.filter((tenant) => tenant.pg_id === formData.pg_id && tenant.status === "active")
      setFilteredTenants(filtered)
    } else {
      setFilteredTenants([])
    }
  }, [formData.pg_id])

  useEffect(() => {
    if (formData.tenant_id) {
      const tenant = tenants.find((t) => t.id === formData.tenant_id)
      if (tenant) {
        const property = pgs.find((p) => p.id === tenant.pg_id)
        setFormData((prev) => ({
          ...prev,
          pg_id: tenant.pg_id,
          amount_paid: property?.rent_per_bed || "",
          due_date: tenant.rent_due,
        }))
      }
    }
  }, [formData.tenant_id])

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
      title={initialData ? "Edit Rent Payment" : "Collect Rent"}
      description="Enter the rent payment details"
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
            <Label htmlFor="tenant_id">Tenant</Label>
            <Select
              value={formData.tenant_id}
              onValueChange={(value) => handleSelectChange("tenant_id", value)}
              disabled={!formData.pg_id || filteredTenants.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={!formData.pg_id ? "Select property first" : "Select tenant"} />
              </SelectTrigger>
              <SelectContent>
                {filteredTenants.map((tenant) => (
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
            <Label htmlFor="amount_paid">Amount Paid</Label>
            <Input
              id="amount_paid"
              name="amount_paid"
              type="number"
              value={formData.amount_paid}
              onChange={handleChange}
              placeholder="Enter amount paid"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment_date">Payment Date</Label>
            <Input
              id="payment_date"
              name="payment_date"
              type="date"
              value={formData.payment_date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              name="due_date"
              type="date"
              value={formData.due_date}
              onChange={handleChange}
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
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="receipt_url">Receipt URL (Optional)</Label>
          <Input
            id="receipt_url"
            name="receipt_url"
            value={formData.receipt_url}
            onChange={handleChange}
            placeholder="Enter receipt URL if available"
          />
        </div>
      </div>
    </ModalForm>
  )
}
