"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { staff, pgs } from "@/lib/data"
import { Plus, Search } from "lucide-react"
import { format } from "date-fns"
import { StaffForm } from "@/components/forms/staff-form"
import { useToast } from "@/components/ui/use-toast"

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [propertyFilter, setPropertyFilter] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const { toast } = useToast()

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProperty = propertyFilter === "" || member.pg_id === propertyFilter
    const matchesRole = roleFilter === "" || member.role === roleFilter
    return matchesSearch && matchesProperty && matchesRole
  })

  const handleAddStaff = (data: any) => {
    // In a real app, you would call an API to add the staff member
    console.log("Adding staff member:", data)
    toast({
      title: "Staff Member Added",
      description: `${data.name} has been added successfully.`,
    })
    setIsAddModalOpen(false)
  }

  const handleEditStaff = (data: any) => {
    // In a real app, you would call an API to update the staff member
    console.log("Editing staff member:", data)
    toast({
      title: "Staff Member Updated",
      description: `${data.name} has been updated successfully.`,
    })
    setIsEditModalOpen(false)
  }

  const handleViewStaff = (member: any) => {
    setSelectedStaff(member)
    setIsViewModalOpen(true)
  }

  const handleEditClick = (member: any) => {
    setSelectedStaff(member)
    setIsEditModalOpen(true)
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
            <CardDescription>Manage your staff members and their roles</CardDescription>
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
                {pgs.map((pg) => (
                  <option key={pg.id} value={pg.id}>
                    {pg.name}
                  </option>
                ))}
              </select>
              <select
                className="border rounded-md h-10 px-3 py-2 w-full md:w-auto"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="Manager">Manager</option>
                <option value="Cleaner">Cleaner</option>
                <option value="Security">Security</option>
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
                  {filteredStaff.map((member) => {
                    const property = pgs.find((pg) => pg.id === member.pg_id)
                    return (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              member.role === "Manager"
                                ? "default"
                                : member.role === "Security"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {member.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{property?.name || "Unknown"}</TableCell>
                        <TableCell>{member.phone}</TableCell>
                        <TableCell>₹{member.salary}</TableCell>
                        <TableCell>{format(new Date(member.joining_date), "dd MMM yyyy")}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleViewStaff(member)}>
                            View
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(member)}>
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

      {/* Add Staff Modal */}
      <StaffForm isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddStaff} />

      {/* Edit Staff Modal */}
      {selectedStaff && (
        <StaffForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={selectedStaff}
          onSubmit={handleEditStaff}
        />
      )}

      {/* View Staff Modal */}
      {selectedStaff && (
        <StaffForm
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          initialData={selectedStaff}
          onSubmit={() => setIsViewModalOpen(false)}
        />
      )}
    </div>
  )
}
