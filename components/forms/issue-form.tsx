"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ModalForm } from "@/components/modals/modal-form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { pgs, tenants } from "@/lib/data"

interface IssueFormProps {
  isOpen: boolean
  onClose: () => void
  initialData?: any
  onSubmit: (data: any) => void
}

export function IssueForm({ isOpen, onClose, initialData, onSubmit }: IssueFormProps) {
  const [formData, setFormData] = useState({
    pg_id: initialData?.pg_id || "",
    tenant_id: initialData?.tenant_id || "",
    issue_type: initialData?.issue_type || "",
    description: initialData?.description || "",
    status: initialData?.status || "pending",
    reported_at: initialData?.reported_at
      ? new Date(initialData.reported_at).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    resolved_at: initialData?.resolved_at ? new Date(initialData.resolved_at).toISOString().split("T")[0] : "",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      title={initialData ? "Edit Issue" : "Report New Issue"}
      description="Enter the issue details"
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
            <Label htmlFor="tenant_id">Reported By</Label>
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
            <Label htmlFor="issue_type">Issue Type</Label>
            <Select value={formData.issue_type} onValueChange={(value) => handleSelectChange("issue_type", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
                <SelectItem value="Electrical">Electrical</SelectItem>
                <SelectItem value="Plumbing">Plumbing</SelectItem>
                <SelectItem value="Furniture">Furniture</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter issue description"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reported_at">Reported Date</Label>
            <Input
              id="reported_at"
              name="reported_at"
              type="date"
              value={formData.reported_at}
              onChange={handleChange}
              required
            />
          </div>
          {formData.status === "resolved" && (
            <div className="space-y-2">
              <Label htmlFor="resolved_at">Resolved Date</Label>
              <Input
                id="resolved_at"
                name="resolved_at"
                type="date"
                value={formData.resolved_at}
                onChange={handleChange}
                required={formData.status === "resolved"}
              />
            </div>
          )}
        </div>
      </div>
    </ModalForm>
  )
}
