"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ModalForm } from "@/components/modals/modal-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Remove unused imports - using props instead

interface IssueFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  onSubmit: (data: any) => void;
  properties?: any[];
  tenants?: any[];
  readOnly?: boolean;
}

export function IssueForm({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  properties,
  tenants,
  readOnly,
}: IssueFormProps) {
  const [formData, setFormData] = useState({
    pg_id: initialData?.pg_id || "",
    room_id: initialData?.room_id || "",
    tenant_id: initialData?.tenant_id || "",
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    priority: initialData?.priority || "medium",
    reported_by: initialData?.reported_by || "",
    contact_number: initialData?.contact_number || "",
    status: initialData?.status || "pending",
    reported_at: initialData?.reported_at
      ? new Date(initialData.reported_at).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    resolved_at: initialData?.resolved_at
      ? new Date(initialData.resolved_at).toISOString().split("T")[0]
      : "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredTenants, setFilteredTenants] = useState<any[]>([]);

  useEffect(() => {
    if (formData.pg_id && tenants) {
      const filtered = tenants.filter(
        (tenant) =>
          tenant.pg_id === formData.pg_id && tenant.status === "active",
      );
      setFilteredTenants(filtered);
    } else {
      setFilteredTenants([]);
    }
  }, [formData.pg_id, tenants]);

  // Auto-populate reported_by and contact_number when tenant is selected
  useEffect(() => {
    if (formData.tenant_id && tenants) {
      const selectedTenant = tenants.find((t) => t.id === formData.tenant_id);
      if (selectedTenant && !initialData) {
        setFormData((prev) => ({
          ...prev,
          reported_by: selectedTenant.name || "",
          contact_number: selectedTenant.phone || "",
        }));
      }
    }
  }, [formData.tenant_id, tenants, initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
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

    try {
      console.log("Form data being submitted:", formData);
      onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <Label htmlFor="pg_id">Property *</Label>
            <Select
              value={formData.pg_id}
              onValueChange={(value) => handleSelectChange("pg_id", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property" />
              </SelectTrigger>
              <SelectContent>
                {(properties || []).map((pg) => (
                  <SelectItem key={pg.id} value={pg.id}>
                    {pg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenant_id">Tenant *</Label>
            <Select
              value={formData.tenant_id}
              onValueChange={(value) => handleSelectChange("tenant_id", value)}
              disabled={!formData.pg_id || filteredTenants.length === 0}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    !formData.pg_id ? "Select property first" : "Select tenant"
                  }
                />
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

        <div className="space-y-2">
          <Label htmlFor="title">Issue Title *</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a brief title for the issue"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleSelectChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="electrical">Electrical</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => handleSelectChange("priority", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reported_by">Reported By *</Label>
            <Input
              id="reported_by"
              name="reported_by"
              value={formData.reported_by}
              onChange={handleChange}
              placeholder="Name of person reporting"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_number">Contact Number *</Label>
            <Input
              id="contact_number"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              placeholder="10-digit contact number"
              pattern="[0-9]{10}"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Detailed description of the issue (minimum 10 characters)"
            required
            minLength={10}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
    </ModalForm>
  );
}
