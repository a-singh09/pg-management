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
import { Plus, Search, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { BookingForm } from "@/components/forms/booking-form";
import { useToast } from "@/components/ui/use-toast";
import {
  bookingService,
  type Booking,
  type BookingStats,
} from "@/lib/services/booking-service";
import {
  propertyService,
  type Property,
} from "@/lib/services/property-service";
import { tenantService, type Tenant } from "@/lib/services/tenant-service";
import { roomService, type Room } from "@/lib/services/room-service";
import { ApiError, ApiErrorType } from "@/lib/api-client";

export default function BookingsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const { toast } = useToast();

  // State for API data
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookingStats, setBookingStats] = useState<BookingStats | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load bookings, properties, tenants, rooms, and stats in parallel
      const [
        bookingsData,
        propertiesData,
        tenantsData,
        roomsData,
        statsData,
        upcomingData,
      ] = await Promise.all([
        bookingService.getBookings(),
        propertyService.getProperties(),
        tenantService.getTenants(),
        roomService.getRooms(),
        bookingService.getBookingStats().catch(() => null), // Optional
        bookingService.getUpcomingCheckIns().catch(() => []), // Optional
      ]);

      setBookings(bookingsData);
      setProperties(propertiesData);
      setTenants(tenantsData);
      setRooms(roomsData);
      setBookingStats(statsData);
      setUpcomingBookings(upcomingData);
    } catch (err) {
      console.error("Error loading bookings data:", err);
      const apiError = err as ApiError;

      if (apiError.type === ApiErrorType.AUTHENTICATION_ERROR) {
        setError("Please log in to view bookings.");
      } else if (apiError.type === ApiErrorType.NETWORK_ERROR) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(apiError.message || "Failed to load bookings data.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle search with debouncing
  useEffect(() => {
    if (searchTerm.trim()) {
      const timeoutId = setTimeout(async () => {
        try {
          setSearchLoading(true);
          const searchResults = await bookingService.searchBookings(searchTerm);
          setBookings(searchResults);
        } catch (err) {
          console.error("Search error:", err);
          toast({
            title: "Search Error",
            description: "Failed to search bookings. Please try again.",
            variant: "destructive",
          });
        } finally {
          setSearchLoading(false);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      // If search term is empty, reload all bookings
      if (!loading) {
        bookingService.getBookings().then(setBookings).catch(console.error);
      }
    }
  }, [searchTerm, loading, toast]);

  const filteredBookings = bookings.filter((booking) => {
    const matchesProperty =
      propertyFilter === "" || booking.pg_id === propertyFilter;
    const matchesStatus =
      statusFilter === "" || booking.status === statusFilter;
    return matchesProperty && matchesStatus;
  });

  const handleAddBooking = async (data: any) => {
    try {
      const newBooking = await bookingService.createBookingFromForm(data);
      setBookings((prev) => [...prev, newBooking]);

      // Refresh upcoming bookings if needed
      if (newBooking.status !== "cancelled") {
        const checkInDate = new Date(newBooking.check_in_date);
        const today = new Date();
        const sevenDaysLater = new Date(today);
        sevenDaysLater.setDate(today.getDate() + 7);

        if (checkInDate >= today && checkInDate <= sevenDaysLater) {
          setUpcomingBookings((prev) => [...prev, newBooking]);
        }
      }

      toast({
        title: "Booking Added",
        description: `Booking for ${data.tenant_name} has been added successfully.`,
      });
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Error adding booking:", err);
      const apiError = err as ApiError;
      toast({
        title: "Error",
        description:
          apiError.message || "Failed to add booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditBooking = async (data: any) => {
    if (!selectedBooking) return;

    try {
      const updatedBooking = await bookingService.updateBookingFromForm(
        selectedBooking.id,
        data,
      );

      // Update bookings list
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === selectedBooking.id ? updatedBooking : booking,
        ),
      );

      // Update upcoming bookings if needed
      setUpcomingBookings((prev) =>
        prev.map((booking) =>
          booking.id === selectedBooking.id ? updatedBooking : booking,
        ),
      );

      toast({
        title: "Booking Updated",
        description: `Booking for ${data.tenant_name} has been updated successfully.`,
      });
      setIsEditModalOpen(false);
      setSelectedBooking(null);
    } catch (err) {
      console.error("Error updating booking:", err);
      const apiError = err as ApiError;
      toast({
        title: "Error",
        description:
          apiError.message || "Failed to update booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (booking: any) => {
    setSelectedBooking(booking);
    setIsEditModalOpen(true);
  };

  const handleConfirmBooking = async (booking: Booking) => {
    try {
      const updatedBooking = await bookingService.updateBooking(booking.id, {
        status: "confirmed",
      });

      // Update bookings list
      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? updatedBooking : b)),
      );

      // Update upcoming bookings if needed
      setUpcomingBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? updatedBooking : b)),
      );

      toast({
        title: "Booking Confirmed",
        description: `Booking for ${booking.tenant_name} has been confirmed.`,
      });
    } catch (err) {
      console.error("Error confirming booking:", err);
      const apiError = err as ApiError;
      toast({
        title: "Error",
        description:
          apiError.message || "Failed to confirm booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
          <Button onClick={() => setIsAddModalOpen(true)} disabled={loading}>
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={loadInitialData}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Booking Calendar</CardTitle>
              <CardDescription>View upcoming check-ins</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Upcoming Check-ins</CardTitle>
              <CardDescription>Bookings for the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : upcomingBookings.length === 0 ? (
                  <p className="text-muted-foreground">
                    No upcoming check-ins for the next 7 days.
                  </p>
                ) : (
                  upcomingBookings.map((booking) => {
                    const property = properties.find(
                      (pg) => pg.id === booking.pg_id,
                    );
                    return (
                      <div
                        key={booking.id}
                        className="flex justify-between items-center border-b pb-2"
                      >
                        <div>
                          <div className="font-medium">
                            {booking.tenant_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {property?.name}
                          </div>
                          <div className="text-xs">
                            {format(
                              new Date(booking.check_in_date),
                              "dd MMM yyyy",
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={
                            booking.status === "confirmed"
                              ? "default"
                              : booking.status === "cancelled"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
            <CardDescription>Manage advance bookings for beds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search bookings..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                />
                {searchLoading && (
                  <div className="absolute right-2.5 top-2.5">
                    <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                  </div>
                )}
              </div>
              <select
                className="border rounded-md h-10 px-3 py-2 w-full md:w-auto"
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value)}
                disabled={loading}
              >
                <option value="">All Properties</option>
                {properties.map((pg) => (
                  <option key={pg.id} value={pg.id}>
                    {pg.name}
                  </option>
                ))}
              </select>
              <select
                className="border rounded-md h-10 px-3 py-2 w-full md:w-auto"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Room Type</TableHead>
                    <TableHead>Booking Date</TableHead>
                    <TableHead>Check-in Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    // Loading skeleton rows
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
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
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {searchTerm
                          ? "No bookings found matching your search."
                          : "No bookings found."}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => {
                      const property = properties.find(
                        (pg) => pg.id === booking.pg_id,
                      );
                      return (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">
                            {booking.tenant_name}
                          </TableCell>
                          <TableCell>{booking.phone}</TableCell>
                          <TableCell>{property?.name || "Unknown"}</TableCell>
                          <TableCell>{booking.room_type}</TableCell>
                          <TableCell>
                            {format(
                              new Date(booking.booking_date),
                              "dd MMM yyyy",
                            )}
                          </TableCell>
                          <TableCell>
                            {format(
                              new Date(booking.check_in_date),
                              "dd MMM yyyy",
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                booking.status === "confirmed"
                                  ? "default"
                                  : booking.status === "cancelled"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(booking)}
                            >
                              Edit
                            </Button>
                            {booking.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleConfirmBooking(booking)}
                              >
                                Confirm
                              </Button>
                            )}
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

      {/* Add Booking Modal */}
      <BookingForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddBooking}
        properties={properties}
        tenants={tenants}
        rooms={rooms}
      />

      {/* Edit Booking Modal */}
      {selectedBooking && (
        <BookingForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={selectedBooking}
          onSubmit={handleEditBooking}
          properties={properties}
          tenants={tenants}
          rooms={rooms}
        />
      )}
    </div>
  );
}
