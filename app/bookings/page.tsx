"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { bookings, pgs } from "@/lib/data"
import { Plus, Search } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { BookingForm } from "@/components/forms/booking-form"
import { useToast } from "@/components/ui/use-toast"

export default function BookingsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [propertyFilter, setPropertyFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const { toast } = useToast()

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProperty = propertyFilter === "" || booking.pg_id === propertyFilter
    const matchesStatus = statusFilter === "" || booking.status === statusFilter
    return matchesSearch && matchesProperty && matchesStatus
  })

  const upcomingBookings = bookings.filter((booking) => {
    const checkInDate = new Date(booking.check_in_date)
    const today = new Date()
    const sevenDaysLater = new Date(today)
    sevenDaysLater.setDate(today.getDate() + 7)
    return checkInDate >= today && checkInDate <= sevenDaysLater && booking.status !== "cancelled"
  })

  const handleAddBooking = (data: any) => {
    // In a real app, you would call an API to add the booking
    console.log("Adding booking:", data)
    toast({
      title: "Booking Added",
      description: `Booking for ${data.tenant_name} has been added successfully.`,
    })
    setIsAddModalOpen(false)
  }

  const handleEditBooking = (data: any) => {
    // In a real app, you would call an API to update the booking
    console.log("Editing booking:", data)
    toast({
      title: "Booking Updated",
      description: `Booking for ${data.tenant_name} has been updated successfully.`,
    })
    setIsEditModalOpen(false)
  }

  const handleEditClick = (booking: any) => {
    setSelectedBooking(booking)
    setIsEditModalOpen(true)
  }

  const handleConfirmBooking = (booking: any) => {
    setSelectedBooking({
      ...booking,
      status: "confirmed",
    })
    setIsEditModalOpen(true)
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Booking Calendar</CardTitle>
              <CardDescription>View upcoming check-ins</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Upcoming Check-ins</CardTitle>
              <CardDescription>Bookings for the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingBookings.length === 0 ? (
                  <p className="text-muted-foreground">No upcoming check-ins for the next 7 days.</p>
                ) : (
                  upcomingBookings.map((booking) => {
                    const property = pgs.find((pg) => pg.id === booking.pg_id)
                    return (
                      <div key={booking.id} className="flex justify-between items-center border-b pb-2">
                        <div>
                          <div className="font-medium">{booking.tenant_name}</div>
                          <div className="text-sm text-muted-foreground">{property?.name}</div>
                          <div className="text-xs">{format(new Date(booking.check_in_date), "dd MMM yyyy")}</div>
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
                    )
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
                />
              </div>
              <select
                className="border rounded-md h-10 px-3 py-2 w-full md:w-auto"
                value={propertyFilter}
                onChange={(e) => setPropertyFilter(e.target.value)}
              >
                <option value="">All Properties</option>
                {pgs.map((pg) => (
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
                  {filteredBookings.map((booking) => {
                    const property = pgs.find((pg) => pg.id === booking.pg_id)
                    return (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.tenant_name}</TableCell>
                        <TableCell>{booking.phone}</TableCell>
                        <TableCell>{property?.name || "Unknown"}</TableCell>
                        <TableCell>{booking.room_type}</TableCell>
                        <TableCell>{format(new Date(booking.booking_date), "dd MMM yyyy")}</TableCell>
                        <TableCell>{format(new Date(booking.check_in_date), "dd MMM yyyy")}</TableCell>
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
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(booking)}>
                            Edit
                          </Button>
                          {booking.status === "pending" && (
                            <Button variant="ghost" size="sm" onClick={() => handleConfirmBooking(booking)}>
                              Confirm
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Booking Modal */}
      <BookingForm isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddBooking} />

      {/* Edit Booking Modal */}
      {selectedBooking && (
        <BookingForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={selectedBooking}
          onSubmit={handleEditBooking}
        />
      )}
    </div>
  )
}
