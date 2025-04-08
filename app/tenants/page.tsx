"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { tenants, pgs } from "@/lib/data"
import { Search, UserPlus } from "lucide-react"
import { format } from "date-fns"
import { TenantForm } from "@/components/forms/tenant-form"
import { useToast } from "@/components/ui/use-toast"

export default function TenantsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [propertyFilter, setPropertyFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState<any>(null)
  const { toast } = useToast()

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.phone.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProperty = propertyFilter === "" || tenant.pg_id === propertyFilter
    const matchesStatus = statusFilter === "" || tenant.status === statusFilter
    return matchesSearch && matchesProperty && matchesStatus
  })

  const handleAddTenant = (data: any) => {
    // In a real app, you would call an API to add the tenant
    console.log("Adding tenant:", data)
    toast({
      title: "Tenant Added",
      description: `${data.name} has been checked in successfully.`,
    })
    setIsAddModalOpen(false)
  }

  const handleEditTenant = (data: any) => {
    // In a real app, you would call an API to update the tenant
    console.log("Editing tenant:", data)
    toast({
      title: "Tenant Updated",
      description: `${data.name} has been updated successfully.`,
    })
    setIsEditModalOpen(false)
  }

  const handleViewTenant = (tenant: any) => {
    setSelectedTenant(tenant)
    setIsViewModalOpen(true)
  }

  const handleEditClick = (tenant: any) => {
    setSelectedTenant(tenant)
    setIsEditModalOpen(true)
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
            <CardDescription>Manage your tenants and their details</CardDescription>
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
                  {filteredTenants.map((tenant) => {
                    const property = pgs.find((pg) => pg.id === tenant.pg_id)
                    return (
                      <TableRow key={tenant.id}>
                        <TableCell className="font-medium">{tenant.name}</TableCell>
                        <TableCell>{property?.name || "Unknown"}</TableCell>
                        <TableCell>
                          Room {tenant.room_id.replace("room", "")}, Bed {tenant.bed_no}
                        </TableCell>
                        <TableCell>{format(new Date(tenant.check_in), "dd MMM yyyy")}</TableCell>
                        <TableCell>{format(new Date(tenant.rent_due), "dd MMM yyyy")}</TableCell>
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
                            {tenant.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleViewTenant(tenant)}>
                            View
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(tenant)}>
                            Edit
                          </Button>
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

      {/* Add Tenant Modal */}
      <TenantForm isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddTenant} />

      {/* Edit Tenant Modal */}
      {selectedTenant && (
        <TenantForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={selectedTenant}
          onSubmit={handleEditTenant}
        />
      )}

      {/* View Tenant Modal */}
      {selectedTenant && (
        <TenantForm
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          initialData={selectedTenant}
          onSubmit={() => setIsViewModalOpen(false)}
        />
      )}
    </div>
  )
}
