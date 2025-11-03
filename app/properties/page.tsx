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
import { Plus, Search, Loader2 } from "lucide-react";
import { PropertyForm } from "@/components/forms/property-form";
import { useToast } from "@/components/ui/use-toast";
import { propertyService } from "@/lib/services/property-service";
import {
  Property,
  CreatePropertyData,
  UpdatePropertyData,
} from "@/lib/transformers/property-transformer";
import { ApiError, ApiErrorType } from "@/lib/api-client";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Load properties on component mount
  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await propertyService.getProperties();
      setProperties(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Failed to load properties");

      if (apiError.type === ApiErrorType.AUTHENTICATION_ERROR) {
        toast({
          title: "Authentication Error",
          description: "Please log in to access properties.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: apiError.message || "Failed to load properties",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      propertyType === "" ||
      property.name.toLowerCase().includes(propertyType.toLowerCase());
    const matchesLocation =
      location === "" ||
      property.location.toLowerCase().includes(location.toLowerCase());
    return matchesSearch && matchesType && matchesLocation;
  });

  const handleAddProperty = async (data: CreatePropertyData) => {
    try {
      setIsSubmitting(true);
      const newProperty = await propertyService.createProperty(data);
      setProperties((prev) => [...prev, newProperty]);
      toast({
        title: "Property Added",
        description: `${data.name} has been added successfully.`,
      });
      setIsAddModalOpen(false);
    } catch (err) {
      const apiError = err as ApiError;
      toast({
        title: "Error",
        description: apiError.message || "Failed to add property",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditProperty = async (data: UpdatePropertyData) => {
    if (!selectedProperty) return;

    try {
      setIsSubmitting(true);
      const updatedProperty = await propertyService.updateProperty(
        selectedProperty.id,
        data,
      );
      setProperties((prev) =>
        prev.map((p) => (p.id === selectedProperty.id ? updatedProperty : p)),
      );
      toast({
        title: "Property Updated",
        description: `${data.name || selectedProperty.name} has been updated successfully.`,
      });
      setIsEditModalOpen(false);
      setSelectedProperty(null);
    } catch (err) {
      const apiError = err as ApiError;
      toast({
        title: "Error",
        description: apiError.message || "Failed to update property",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (property: Property) => {
    setSelectedProperty(property);
    setIsEditModalOpen(true);
  };

  const handleDeleteProperty = async (property: Property) => {
    if (
      !confirm(
        `Are you sure you want to delete "${property.name}"? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await propertyService.deleteProperty(property.id);
      setProperties((prev) => prev.filter((p) => p.id !== property.id));
      toast({
        title: "Property Deleted",
        description: `${property.name} has been deleted successfully.`,
      });
    } catch (err) {
      const apiError = err as ApiError;
      toast({
        title: "Error",
        description: apiError.message || "Failed to delete property",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Properties</h2>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Property Management</CardTitle>
            <CardDescription>
              Manage your PGs, hostels, and apartments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search properties..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="border rounded-md h-10 px-3 py-2 w-full md:w-auto"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="pg">PG</option>
                <option value="hostel">Hostel</option>
                <option value="apartment">Apartment</option>
              </select>
              <select
                className="border rounded-md h-10 px-3 py-2 w-full md:w-auto"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">All Locations</option>
                <option value="bangalore">Bangalore</option>
                <option value="mumbai">Mumbai</option>
                <option value="delhi">Delhi</option>
              </select>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Total Rooms</TableHead>
                    <TableHead>Available Beds</TableHead>
                    <TableHead>Rent/Bed</TableHead>
                    <TableHead>Facilities</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin mr-2" />
                          Loading properties...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-red-500">
                          <p>{error}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={loadProperties}
                            className="mt-2"
                          >
                            Retry
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredProperties.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-muted-foreground">
                          No properties found
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProperties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium">
                          {property.name}
                        </TableCell>
                        <TableCell>{property.location}</TableCell>
                        <TableCell>{property.total_rooms}</TableCell>
                        <TableCell>{property.available_beds}</TableCell>
                        <TableCell>₹{property.rent_per_bed}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {property.facilities.slice(0, 2).map((facility) => (
                              <Badge key={facility} variant="outline">
                                {facility}
                              </Badge>
                            ))}
                            {property.facilities.length > 2 && (
                              <Badge variant="outline">
                                +{property.facilities.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewProperty(property)}
                            >
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(property)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProperty(property)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Property Modal */}
      <PropertyForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddProperty}
      />

      {/* Edit Property Modal */}
      {selectedProperty && (
        <PropertyForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={selectedProperty}
          onSubmit={handleEditProperty}
        />
      )}

      {/* View Property Modal */}
      {selectedProperty && (
        <PropertyForm
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          initialData={selectedProperty}
          onSubmit={() => setIsViewModalOpen(false)}
        />
      )}
    </div>
  );
}
