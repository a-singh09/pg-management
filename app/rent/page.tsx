"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { rents, tenants, pgs } from "@/lib/data"
import { Download, Mail, MessageCirclePlus, Plus, Search } from "lucide-react"
import { format } from "date-fns"
import { RentForm } from "@/components/forms/rent-form"
import { useToast } from "@/components/ui/use-toast"

export default function RentPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [propertyFilter, setPropertyFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [monthFilter, setMonthFilter] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedRent, setSelectedRent] = useState<any>(null)
  const { toast } = useToast()

  const filteredRents = rents.filter((rent) => {
    const tenant = tenants.find((t) => t.id === rent.tenant_id)
    const matchesSearch = tenant?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false
    const matchesProperty = propertyFilter === "" || rent.pg_id === propertyFilter
    const matchesStatus = statusFilter === "" || rent.status === statusFilter
    const matchesMonth =
      monthFilter === "" || (rent.payment_date && format(new Date(rent.payment_date), "yyyy-MM").includes(monthFilter))
    return matchesSearch && matchesProperty && matchesStatus && matchesMonth
  })

  const handleAddRent = (data: any) => {
    // In a real app, you would call an API to add the rent payment
    console.log("Adding rent payment:", data)
    toast({
      title: "Rent Payment Added",
      description: "The rent payment has been recorded successfully.",
    })
    setIsAddModalOpen(false)
  }

  const handleEditRent = (data: any) => {
    // In a real app, you would call an API to update the rent payment
    console.log("Editing rent payment:", data)
    toast({
      title: "Rent Payment Updated",
      description: "The rent payment has been updated successfully.",
    })
    setIsEditModalOpen(false)
  }

  const handleEditClick = (rent: any) => {
    setSelectedRent(rent)
    setIsEditModalOpen(true)
  }

  const handleMarkAsPaid = (rent: any) => {
    setSelectedRent({
      ...rent,
      status: "paid",
      payment_date: new Date().toISOString(),
    })
    setIsEditModalOpen(true)
  }

  const handleExportCSV = () => {
    // In a real app, you would generate and download a CSV file
    toast({
      title: "Export Started",
      description: "Your rent collection data is being exported to CSV.",
    })
  }

  const handleSendMessage = (rent: any) => {
    toast({
      title: "Opening Whatsapp",
      description: "Send the rent reminder to the tenant's WhatsApp.",
    })
  }

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
                  {filteredRents.map((rent) => {
                    const tenant = tenants.find((t) => t.id === rent.tenant_id)
                    const property = pgs.find((pg) => pg.id === rent.pg_id)
                    return (
                      <TableRow key={rent.id}>
                        <TableCell className="font-medium">{tenant?.name || "Unknown"}</TableCell>
                        <TableCell>{property?.name || "Unknown"}</TableCell>
                        <TableCell>₹{rent.amount_paid || property?.rent_per_bed || 0}</TableCell>
                        <TableCell>{format(new Date(rent.due_date), "dd MMM yyyy")}</TableCell>
                        <TableCell>
                          {rent.payment_date ? format(new Date(rent.payment_date), "dd MMM yyyy") : "-"}
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
                          {rent.status === "pending" || rent.status === "overdue" ? (
                            <Button variant="default" size="sm" onClick={() => handleMarkAsPaid(rent)}>
                              Mark as Paid
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => handleSendMessage(rent)}>
                              <MessageCirclePlus className="mr-1 h-3 w-3" />
                              Send Reminder
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(rent)}>
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row justify-between">
              <div>
                <span className="text-muted-foreground">Total Collected: </span>
                <span className="font-bold">
                  ₹
                  {filteredRents
                    .reduce((sum, rent) => sum + (rent.status === "paid" ? rent.amount_paid : 0), 0)
                    .toLocaleString()}
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
      <RentForm isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddRent} />

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
  )
}
