"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Search,
  Plus,
  Loader2,
  Bed,
  User,
  DollarSign,
  Edit,
  UserMinus,
  UserPlus,
} from "lucide-react";
import {
  roomService,
  Room,
  BedAssignmentData,
  BedReleaseData,
  BedRentUpdateData,
} from "@/lib/services/room-service";
import { propertyService, Property } from "@/lib/services/property-service";
import { tenantService, Tenant } from "@/lib/services/tenant-service";
import { toast } from "@/hooks/use-toast";

export default function BedsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "available" | "occupied"
  >("all");
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);

  // Dialog states
  const [assignBedDialog, setAssignBedDialog] = useState(false);
  const [releaseBedDialog, setReleaseBedDialog] = useState(false);
  const [updateRentDialog, setUpdateRentDialog] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedBedNumber, setSelectedBedNumber] = useState<number>(0);
  const [selectedTenant, setSelectedTenant] = useState("");
  const [customRent, setCustomRent] = useState("");
  const [newRent, setNewRent] = useState("");

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Filter rooms when search term, property, or status changes
  useEffect(() => {
    filterRooms();
  }, [rooms, searchTerm, selectedProperty, selectedStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [roomsData, propertiesData, tenantsData] = await Promise.all([
        roomService.getRooms(),
        propertyService.getProperties(),
        tenantService.getTenants(),
      ]);
      setRooms(roomsData);
      setProperties(propertiesData);
      setTenants(tenantsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRooms = () => {
    try {
      let filtered = rooms;

      // Filter by property
      if (selectedProperty) {
        filtered = filtered.filter((room) => room.pg_id === selectedProperty);
      }

      // Filter by search term
      if (searchTerm.trim()) {
        filtered = filtered.filter((room) =>
          room.room_number.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

      // Filter by status
      if (selectedStatus !== "all") {
        filtered = filtered.filter((room) => {
          if (selectedStatus === "available") {
            return room.available_beds > 0;
          } else if (selectedStatus === "occupied") {
            return room.available_beds < room.total_beds;
          }
          return true;
        });
      }

      setFilteredRooms(filtered);
    } catch (error) {
      console.error("Error filtering rooms:", error);
    }
  };

  const handleAssignBed = (room: Room, bedNumber: number) => {
    setSelectedRoom(room);
    setSelectedBedNumber(bedNumber);
    setCustomRent(room.default_rent.toString());
    setAssignBedDialog(true);
  };

  const handleReleaseBed = (room: Room, bedNumber: number) => {
    setSelectedRoom(room);
    setSelectedBedNumber(bedNumber);
    setReleaseBedDialog(true);
  };

  const handleUpdateRent = (room: Room, bedNumber: number) => {
    setSelectedRoom(room);
    setSelectedBedNumber(bedNumber);
    const bed = room.beds.find((b) => b.bedNumber === bedNumber);
    setNewRent(bed?.rent.toString() || "0");
    setUpdateRentDialog(true);
  };

  const confirmAssignBed = async () => {
    if (!selectedRoom || !selectedTenant || !customRent) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const assignmentData: BedAssignmentData = {
        roomId: selectedRoom.id,
        bedNumber: selectedBedNumber,
        tenantId: selectedTenant,
        customRent: parseFloat(customRent),
      };

      await roomService.assignBed(assignmentData);
      await loadData(); // Refresh data
      setAssignBedDialog(false);
      setSelectedTenant("");
      setCustomRent("");

      toast({
        title: "Success",
        description: "Bed assigned successfully",
      });
    } catch (error) {
      console.error("Error assigning bed:", error);
      toast({
        title: "Error",
        description: "Failed to assign bed",
        variant: "destructive",
      });
    }
  };

  const confirmReleaseBed = async () => {
    if (!selectedRoom) return;

    try {
      const releaseData: BedReleaseData = {
        roomId: selectedRoom.id,
        bedNumber: selectedBedNumber,
      };

      await roomService.releaseBed(releaseData);
      await loadData(); // Refresh data
      setReleaseBedDialog(false);

      toast({
        title: "Success",
        description: "Bed released successfully",
      });
    } catch (error) {
      console.error("Error releasing bed:", error);
      toast({
        title: "Error",
        description: "Failed to release bed",
        variant: "destructive",
      });
    }
  };

  const confirmUpdateRent = async () => {
    if (!selectedRoom || !newRent) {
      toast({
        title: "Error",
        description: "Please enter a valid rent amount",
        variant: "destructive",
      });
      return;
    }

    try {
      const updateData: BedRentUpdateData = {
        roomId: selectedRoom.id,
        bedNumber: selectedBedNumber,
        newRent: parseFloat(newRent),
      };

      await roomService.updateBedRent(updateData);
      await loadData(); // Refresh data
      setUpdateRentDialog(false);
      setNewRent("");

      toast({
        title: "Success",
        description: "Bed rent updated successfully",
      });
    } catch (error) {
      console.error("Error updating bed rent:", error);
      toast({
        title: "Error",
        description: "Failed to update bed rent",
        variant: "destructive",
      });
    }
  };

  const getTenantName = (tenantId: string) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    return tenant ? tenant.name : "Unknown Tenant";
  };

  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Bed Management</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bed Availability & Management</CardTitle>
            <CardDescription>
              Manage individual bed assignments, rent, and availability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search rooms..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="border rounded-md h-10 px-3 py-2"
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
              >
                <option value="">All Properties</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
              <select
                className="border rounded-md h-10 px-3 py-2"
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(
                    e.target.value as "all" | "available" | "occupied",
                  )
                }
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
              </select>
            </div>

            <div className="space-y-6">
              {properties
                .filter(
                  (property) =>
                    !selectedProperty || property.id === selectedProperty,
                )
                .map((property) => {
                  const propertyRooms = filteredRooms.filter(
                    (room) => room.pg_id === property.id,
                  );

                  if (propertyRooms.length === 0) return null;

                  const totalBeds = propertyRooms.reduce(
                    (sum, room) => sum + room.total_beds,
                    0,
                  );
                  const availableBeds = propertyRooms.reduce(
                    (sum, room) => sum + room.available_beds,
                    0,
                  );

                  return (
                    <Card key={property.id} className="overflow-hidden">
                      <CardHeader className="bg-secondary p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {property.name}
                            </CardTitle>
                            <CardDescription>
                              {availableBeds} beds available out of {totalBeds}
                            </CardDescription>
                          </div>
                          <Badge variant="outline">
                            {propertyRooms.length} rooms
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          {propertyRooms.map((room) => (
                            <Card
                              key={room.id}
                              className="border-l-4 border-l-blue-500"
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-base">
                                    Room {room.room_number}
                                  </CardTitle>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary">
                                      {room.available_beds}/{room.total_beds}{" "}
                                      available
                                    </Badge>
                                    <Badge variant="outline">
                                      Default: ₹{room.default_rent}
                                    </Badge>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                  {room.beds.map((bed) => (
                                    <Card
                                      key={bed.bedNumber}
                                      className={`p-3 ${
                                        bed.isOccupied
                                          ? "bg-red-50 border-red-200"
                                          : "bg-green-50 border-green-200"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <Bed className="h-4 w-4" />
                                          <span className="font-medium">
                                            Bed {bed.bedNumber}
                                          </span>
                                        </div>
                                        <Badge
                                          variant={
                                            bed.isOccupied
                                              ? "destructive"
                                              : "default"
                                          }
                                        >
                                          {bed.isOccupied
                                            ? "Occupied"
                                            : "Available"}
                                        </Badge>
                                      </div>

                                      <div className="space-y-1 text-sm">
                                        <div className="flex items-center gap-1">
                                          <DollarSign className="h-3 w-3" />
                                          <span>₹{bed.rent}/month</span>
                                        </div>

                                        {bed.isOccupied && bed.tenantId && (
                                          <div className="flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            <span className="truncate">
                                              {getTenantName(bed.tenantId)}
                                            </span>
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex gap-1 mt-3">
                                        {bed.isOccupied ? (
                                          <>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="flex-1"
                                              onClick={() =>
                                                handleReleaseBed(
                                                  room,
                                                  bed.bedNumber,
                                                )
                                              }
                                            >
                                              <UserMinus className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() =>
                                                handleUpdateRent(
                                                  room,
                                                  bed.bedNumber,
                                                )
                                              }
                                            >
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                          </>
                                        ) : (
                                          <>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="flex-1"
                                              onClick={() =>
                                                handleAssignBed(
                                                  room,
                                                  bed.bedNumber,
                                                )
                                              }
                                            >
                                              <UserPlus className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() =>
                                                handleUpdateRent(
                                                  room,
                                                  bed.bedNumber,
                                                )
                                              }
                                            >
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    </Card>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>

            {filteredRooms.length === 0 && !loading && (
              <div className="text-center text-muted-foreground py-8">
                No rooms match your current filters
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assign Bed Dialog */}
      <Dialog open={assignBedDialog} onOpenChange={setAssignBedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Bed</DialogTitle>
            <DialogDescription>
              Assign Bed {selectedBedNumber} in Room {selectedRoom?.room_number}{" "}
              to a tenant
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tenant">Select Tenant</Label>
              <select
                id="tenant"
                className="w-full border rounded-md h-10 px-3 py-2 mt-1"
                value={selectedTenant}
                onChange={(e) => setSelectedTenant(e.target.value)}
              >
                <option value="">Choose a tenant...</option>
                {tenants
                  .filter((tenant) => !tenant.room_id) // Only show unassigned tenants
                  .map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name} - {tenant.phone}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <Label htmlFor="customRent">Custom Rent (₹)</Label>
              <Input
                id="customRent"
                type="number"
                value={customRent}
                onChange={(e) => setCustomRent(e.target.value)}
                placeholder="Enter custom rent amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignBedDialog(false)}>
              Cancel
            </Button>
            <Button onClick={confirmAssignBed}>Assign Bed</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Release Bed Dialog */}
      <Dialog open={releaseBedDialog} onOpenChange={setReleaseBedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release Bed</DialogTitle>
            <DialogDescription>
              Are you sure you want to release Bed {selectedBedNumber} in Room{" "}
              {selectedRoom?.room_number}? This will make the bed available for
              new tenants.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReleaseBedDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmReleaseBed}>
              Release Bed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Rent Dialog */}
      <Dialog open={updateRentDialog} onOpenChange={setUpdateRentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Bed Rent</DialogTitle>
            <DialogDescription>
              Update the rent for Bed {selectedBedNumber} in Room{" "}
              {selectedRoom?.room_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newRent">New Rent Amount (₹)</Label>
              <Input
                id="newRent"
                type="number"
                value={newRent}
                onChange={(e) => setNewRent(e.target.value)}
                placeholder="Enter new rent amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpdateRentDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmUpdateRent}>Update Rent</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
