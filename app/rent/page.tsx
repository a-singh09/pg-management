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
import {
  Download,
  Mail,
  MessageCirclePlus,
  Plus,
  Search,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { RentForm } from "@/components/forms/rent-form";
import { useToast } from "@/components/ui/use-toast";
import { ActionsDropdown } from "@/components/ui/actions-dropdown";
import { rentService, type Rent } from "@/lib/services/rent-service";
import { tenantService, type Tenant } from "@/lib/services/tenant-service";
import {
  propertyService,
  type Property,
} from "@/lib/services/property-service";

export default function RentPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRent, setSelectedRent] = useState<Rent | null>(null);
  const { toast } = useToast();

  // API data state
  const [rents, setRents] = useState<Rent[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rentSummary, setRentSummary] = useState({
    totalCollected: 0,
    totalPending: 0,
    totalOverdue: 0,
    collectionRate: 0,
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load all data in parallel
      const [rentsData, tenantsData, propertiesData] = await Promise.all([
        rentService.getRents(),
        tenantService.getTenants(),
        propertyService.getProperties(),
      ]);

      setRents(rentsData);
      setTenants(tenantsData);
      setProperties(propertiesData);

      // Calculate rent collection summary
      const summary = calculateRentSummary(rentsData);
      setRentSummary(summary);
    } catch (err) {
      console.error("Error loading rent data:", err);
      setError("Failed to load rent data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateRentSummary = (rentsData: Rent[]) => {
    const totalCollected = rentsData
      .filter((rent) => rent.status === "paid")
      .reduce((sum, rent) => sum + rent.amount_paid, 0);

    const totalPending = rentsData
      .filter((rent) => rent.status === "pending")
      .reduce((sum, rent) => sum + rent.amount_paid, 0);

    const totalOverdue = rentsData
      .filter((rent) => rent.status === "overdue")
      .reduce((sum, rent) => sum + rent.amount_paid, 0);

    const totalExpected = totalCollected + totalPending + totalOverdue;
    const collectionRate =
      totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

    return {
      totalCollected,
      totalPending,
      totalOverdue,
      collectionRate: Math.round(collectionRate),
    };
  };

  const filteredRents = rents.filter((rent) => {
    const tenant = tenants.find((t) => t.id === rent.tenant_id);
    const matchesSearch =
      tenant?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesProperty =
      propertyFilter === "" || rent.pg_id === propertyFilter;
    const matchesStatus = statusFilter === "" || rent.status === statusFilter;
    const matchesMonth =
      monthFilter === "" ||
      (rent.payment_date &&
        format(new Date(rent.payment_date), "yyyy-MM").includes(monthFilter));
    return matchesSearch && matchesProperty && matchesStatus && matchesMonth;
  });

  const handleAddRent = async (data: any) => {
    try {
      await rentService.createRentFromForm(data);
      toast({
        title: "Rent Payment Added",
        description: "The rent payment has been recorded successfully.",
      });
      setIsAddModalOpen(false);
      // Reload data to reflect changes
      await loadData();
    } catch (error) {
      console.error("Error adding rent payment:", error);
      toast({
        title: "Error",
        description: "Failed to add rent payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditRent = async (data: any) => {
    if (!selectedRent) return;

    try {
      await rentService.updateRentFromForm(selectedRent.id, data);
      toast({
        title: "Rent Payment Updated",
        description: "The rent payment has been updated successfully.",
      });
      setIsEditModalOpen(false);
      setSelectedRent(null);
      // Reload data to reflect changes
      await loadData();
    } catch (error) {
      console.error("Error updating rent payment:", error);
      toast({
        title: "Error",
        description: "Failed to update rent payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (rent: any) => {
    setSelectedRent(rent);
    setIsEditModalOpen(true);
  };

  const handleMarkAsPaid = async (rent: Rent) => {
    try {
      await rentService.markAsPaid(rent.id, rent.amount_paid);
      toast({
        title: "Payment Recorded",
        description: "Rent has been marked as paid successfully.",
      });
      // Reload data to reflect changes
      await loadData();
    } catch (error) {
      console.error("Error marking rent as paid:", error);
      toast({
        title: "Error",
        description: "Failed to mark rent as paid. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    // In a real app, you would generate and download a CSV file
    toast({
      title: "Export Started",
      description: "Your rent collection data is being exported to CSV.",
    });
  };

  const handleSendMessage = (rent: any) => {
    toast({
      title: "Opening Whatsapp",
      description: "Send the rent reminder to the tenant's WhatsApp.",
    });
  };

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Rent Collection</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Collect Rent
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={loadData}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Rent Collection Summary */}
        {!isLoading && !error && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Collected
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{rentSummary.totalCollected.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{rentSummary.totalPending.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  ₹{rentSummary.totalOverdue.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Collection Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {rentSummary.collectionRate}%
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Rent Management</CardTitle>
            <CardDescription>Track and manage rent payments</CardDescription>
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
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
              <Input
                type="month"
                className="w-full md:w-auto"
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
              />
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    // Loading skeleton rows
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredRents.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {error
                          ? "Failed to load rent data"
                          : "No rent records found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRents.map((rent) => {
                      const tenant = tenants.find(
                        (t) => t.id === rent.tenant_id,
                      );
                      const property = properties.find(
                        (p) => p.id === rent.pg_id,
                      );
                      return (
                        <TableRow key={rent.id}>
                          <TableCell className="font-medium">
                            {tenant?.name || "Unknown"}
                          </TableCell>
                          <TableCell>{property?.name || "Unknown"}</TableCell>
                          <TableCell>
                            ₹{rent.amount_paid || property?.rent_per_bed || 0}
                          </TableCell>
                          <TableCell>
                            {format(new Date(rent.due_date), "dd MMM yyyy")}
                          </TableCell>
                          <TableCell>
                            {rent.payment_date
                              ? format(
                                  new Date(rent.payment_date),
                                  "dd MMM yyyy",
                                )
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                rent.status === "paid"
                                  ? "default"
                                  : rent.status === "overdue"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {rent.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <ActionsDropdown
                              onEdit={() => handleEditClick(rent)}
                              showView={false}
                              showDelete={false}
                              customActions={[
                                ...(rent.status === "pending" ||
                                rent.status === "overdue"
                                  ? [
                                      {
                                        label: "Mark as Paid",
                                        onClick: () => handleMarkAsPaid(rent),
                                      },
                                    ]
                                  : [
                                      {
                                        label: "Send Reminder",
                                        icon: (
                                          <MessageCirclePlus className="h-4 w-4" />
                                        ),
                                        onClick: () => handleSendMessage(rent),
                                      },
                                    ]),
                              ]}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row justify-between">
              <div>
                <span className="text-muted-foreground">
                  Filtered Total Collected:{" "}
                </span>
                <span className="font-bold">
                  {isLoading ? (
                    <Skeleton className="inline-block h-4 w-16" />
                  ) : (
                    `₹${filteredRents
                      .reduce(
                        (sum, rent) =>
                          sum + (rent.status === "paid" ? rent.amount_paid : 0),
                        0,
                      )
                      .toLocaleString()}`
                  )}
                </span>
              </div>
              <div className="flex gap-2 mt-2 sm:mt-0">
                <Button variant="outline" size="sm">
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Rent Modal */}
      <RentForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddRent}
      />

      {/* Edit Rent Modal */}
      {selectedRent && (
        <RentForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={selectedRent}
          onSubmit={handleEditRent}
        />
      )}
    </div>
  );
}
