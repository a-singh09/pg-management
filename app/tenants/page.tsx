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
import { tenantService, type Tenant } from "@/lib/services/tenant-service";
import {
  propertyService,
  type Property,
} from "@/lib/services/property-service";
import { roomService, type Room } from "@/lib/services/room-service";
import { ApiError, ApiErrorType } from "@/lib/api-client";
import { Search, UserPlus, AlertCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { TenantForm } from "@/components/forms/tenant-form";
import { useToast } from "@/components/ui/use-toast";

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
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

      const [tenantsData, propertiesData, roomsData] = await Promise.all([
        tenantService.getTenants(),
        propertyService.getProperties(),
        roomService.getRooms(),
      ]);

      setTenants(tenantsData);
      setProperties(propertiesData);
      setRooms(roomsData);
    } catch (err) {
      console.error("Error loading data:", err);
      const apiError = err as ApiError;

      if (apiError.type === ApiErrorType.AUTHENTICATION_ERROR) {
        setError("Authentication failed. Please log in again.");
      } else if (apiError.type === ApiErrorType.NETWORK_ERROR) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(apiError.message || "Failed to load data. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      (tenant.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (tenant.phone?.toLowerCase() || "").includes(searchTerm.toLowerCase());
    const matchesProperty =
      propertyFilter === "" || tenant.pg_id === propertyFilter;
    const matchesStatus = statusFilter === "" || tenant.status === statusFilter;
    return matchesSearch && matchesProperty && matchesStatus;
  });

  const handleAddTenant = async (data: any) => {
    try {
      setIsSubmitting(true);
      const newTenant = await tenantService.createTenantFromForm(data);

      // Update local state
      setTenants((prev) => [...prev, newTenant]);

      toast({
        title: "Tenant Added",
        description: `${newTenant.name} has been checked in successfully.`,
      });
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Error adding tenant:", err);
      const apiError = err as ApiError;

      toast({
        title: "Error",
        description:
          apiError.message || "Failed to add tenant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTenant = async (data: any) => {
    if (!selectedTenant) return;

    try {
      setIsSubmitting(true);
      const updatedTenant = await tenantService.updateTenantFromForm(
        selectedTenant.id,
        data,
      );

      // Update local state
      setTenants((prev) =>
        prev.map((tenant) =>
          tenant.id === selectedTenant.id ? updatedTenant : tenant,
        ),
      );

      toast({
        title: "Tenant Updated",
        description: `${updatedTenant.name} has been updated successfully.`,
      });
      setIsEditModalOpen(false);
      setSelectedTenant(null);
    } catch (err) {
      console.error("Error updating tenant:", err);
      const apiError = err as ApiError;

      toast({
        title: "Error",
        description:
          apiError.message || "Failed to update tenant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTenant = async (tenant: Tenant) => {
    if (!confirm(`Are you sure you want to delete ${tenant.name}?`)) {
      return;
    }

    try {
      await tenantService.deleteTenant(tenant.id);

      // Update local state
      setTenants((prev) => prev.filter((t) => t.id !== tenant.id));

      toast({
        title: "Tenant Deleted",
        description: `${tenant.name} has been deleted successfully.`,
      });
    } catch (err) {
      console.error("Error deleting tenant:", err);
      const apiError = err as ApiError;

      toast({
        title: "Error",
        description:
          apiError.message || "Failed to delete tenant. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsEditModalOpen(true);
  };

  const handleRetry = () => {
    loadData();
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-10 w-40" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-40" />
                  <Skeleton className="h-10 w-32" />
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
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

  // Error state
  if (error) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Tenants</h2>
            <Button onClick={handleRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Tenants</h2>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Check In Tenant
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tenant Management</CardTitle>
            <CardDescription>
              Manage your tenants and their details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search tenants..."
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="left">Left</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Room/Bed</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Rent Due</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        {tenants.length === 0
                          ? "No tenants found. Add your first tenant to get started."
                          : "No tenants match your search criteria."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTenants.map((tenant) => {
                      const property = properties.find(
                        (p) => p.id === tenant.pg_id,
                      );
                      return (
                        <TableRow key={tenant.id}>
                          <TableCell className="font-medium">
                            {tenant.name || "Unknown"}
                          </TableCell>
                          <TableCell>{property?.name || "Unknown"}</TableCell>
                          <TableCell>
                            Room{" "}
                            {tenant.room_id?.replace("room", "") ||
                              tenant.room_id ||
                              "N/A"}
                            , Bed {tenant.bed_no || "N/A"}
                          </TableCell>
                          <TableCell>
                            {tenant.check_in
                              ? format(new Date(tenant.check_in), "dd MMM yyyy")
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            {tenant.rent_due
                              ? format(new Date(tenant.rent_due), "dd MMM yyyy")
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                tenant.status === "active"
                                  ? "default"
                                  : tenant.status === "left"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {tenant.status || "unknown"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewTenant(tenant)}
                              >
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditClick(tenant)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTenant(tenant)}
                                className="text-destructive hover:text-destructive"
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

      {/* Add Tenant Modal */}
      <TenantForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddTenant}
        isSubmitting={isSubmitting}
        properties={properties}
        rooms={rooms}
      />

      {/* Edit Tenant Modal */}
      {selectedTenant && (
        <TenantForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTenant(null);
          }}
          initialData={selectedTenant}
          onSubmit={handleEditTenant}
          isSubmitting={isSubmitting}
          properties={properties}
          rooms={rooms}
        />
      )}

      {/* View Tenant Modal */}
      {selectedTenant && (
        <TenantForm
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedTenant(null);
          }}
          initialData={selectedTenant}
          onSubmit={() => setIsViewModalOpen(false)}
          readOnly={true}
          properties={properties}
          rooms={rooms}
        />
      )}
    </div>
  );
}
