"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { staffService, propertyService } from "@/lib/services";
import {
  Staff,
  Property,
  CreateStaffData,
  UpdateStaffData,
} from "@/lib/transformers";
import { Plus, Search, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { StaffForm } from "@/components/forms/staff-form";
import { useToast } from "@/components/ui/use-toast";

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [staffData, propertiesData] = await Promise.all([
        staffService.getStaff(),
        propertyService.getProperties(),
      ]);

      setStaff(staffData);
      setProperties(propertiesData);
    } catch (err) {
      console.error("Failed to load staff data:", err);
      setError("Failed to load staff data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProperty =
      propertyFilter === "" || member.pg_id === propertyFilter;
    const matchesRole = roleFilter === "" || member.role === roleFilter;
    return matchesSearch && matchesProperty && matchesRole;
  });

  const handleAddStaff = async (data: any) => {
    try {
      setIsSubmitting(true);

      const createData: CreateStaffData = {
        name: data.name,
        role: data.role,
        pg_id: data.pg_id,
        phone: data.phone,
        email: data.email,
        salary: Number(data.salary),
        joining_date: data.joining_date,
        address: data.address || "",
        emergency_contact: data.emergency_contact || "",
        emergency_contact_name: data.emergency_contact_name || "",
        id_proof_type: data.id_proof_type || "aadhar",
        id_proof_number: data.id_proof_number || "",
      };

      const newStaff = await staffService.createStaff(createData);
      setStaff((prev) => [...prev, newStaff]);

      toast({
        title: "Staff Member Added",
        description: `${data.name} has been added successfully.`,
      });
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Failed to add staff member:", err);
      toast({
        title: "Error",
        description: "Failed to add staff member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStaff = async (data: any) => {
    if (!selectedStaff) return;

    try {
      setIsSubmitting(true);

      const updateData: UpdateStaffData = {
        name: data.name,
        role: data.role,
        pg_id: data.pg_id,
        phone: data.phone,
        email: data.email,
        salary: Number(data.salary),
        joining_date: data.joining_date,
        address: data.address,
        emergency_contact: data.emergency_contact,
        emergency_contact_name: data.emergency_contact_name,
        id_proof_type: data.id_proof_type,
        id_proof_number: data.id_proof_number,
      };

      const updatedStaff = await staffService.updateStaff(
        selectedStaff.id,
        updateData,
      );
      setStaff((prev) =>
        prev.map((member) =>
          member.id === selectedStaff.id ? updatedStaff : member,
        ),
      );

      toast({
        title: "Staff Member Updated",
        description: `${data.name} has been updated successfully.`,
      });
      setIsEditModalOpen(false);
      setSelectedStaff(null);
    } catch (err) {
      console.error("Failed to update staff member:", err);
      toast({
        title: "Error",
        description: "Failed to update staff member. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    try {
      await staffService.deleteStaff(staffId);
      setStaff((prev) => prev.filter((member) => member.id !== staffId));

      toast({
        title: "Staff Member Deleted",
        description: "Staff member has been deleted successfully.",
      });
    } catch (err) {
      console.error("Failed to delete staff member:", err);
      toast({
        title: "Error",
        description: "Failed to delete staff member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewStaff = (member: Staff) => {
    setSelectedStaff(member);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (member: Staff) => {
    setSelectedStaff(member);
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Staff</h2>
            <Skeleton className="h-10 w-32" />
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Staff Management</CardTitle>
              <CardDescription>
                Manage your staff members and their roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-40" />
                  <Skeleton className="h-10 w-32" />
                </div>
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Staff</h2>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Staff
            </Button>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button onClick={loadData} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Staff</h2>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Staff
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Staff Management</CardTitle>
            <CardDescription>
              Manage your staff members and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search staff..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="border rounded-md h-10 px-3 py-2 w-full md:w-auto"
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value)}
              >
                <option value="">All Properties</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
              <select
                className="border rounded-md h-10 px-3 py-2 w-full md:w-auto"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="manager">Manager</option>
                <option value="caretaker">Caretaker</option>
                <option value="cleaner">Cleaner</option>
                <option value="cook">Cook</option>
                <option value="security">Security</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Salary</TableHead>
                    <TableHead>Joining Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No staff members found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStaff.map((member) => {
                      const property = properties.find(
                        (p) => p.id === member.pg_id,
                      );
                      return (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium">
                            {member.name}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                member.role === "manager"
                                  ? "default"
                                  : member.role === "security"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {member.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {property?.name || "Unassigned"}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div>{member.phone}</div>
                              <div className="text-sm text-muted-foreground">
                                {member.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            ₹{member.salary.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {format(
                              new Date(member.joining_date),
                              "dd MMM yyyy",
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewStaff(member)}
                              >
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(member)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteStaff(member.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Staff Modal */}
      <StaffForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddStaff}
      />

      {/* Edit Staff Modal */}
      {selectedStaff && (
        <StaffForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedStaff(null);
          }}
          initialData={selectedStaff}
          onSubmit={handleEditStaff}
        />
      )}

      {/* View Staff Modal */}
      {selectedStaff && (
        <StaffForm
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedStaff(null);
          }}
          initialData={selectedStaff}
          onSubmit={() => setIsViewModalOpen(false)}
        />
      )}
    </div>
  );
}
