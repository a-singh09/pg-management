"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { pgs } from "@/lib/data"
import { Plus, Search } from "lucide-react"
import { PropertyForm } from "@/components/forms/property-form"
import { useToast } from "@/components/ui/use-toast"

export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [propertyType, setPropertyType] = useState("")
  const [location, setLocation] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const { toast } = useToast()

  const filteredProperties = pgs.filter((property) => {
    const matchesSearch =
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = propertyType === "" || property.name.toLowerCase().includes(propertyType.toLowerCase())
    const matchesLocation = location === "" || property.location.toLowerCase().includes(location.toLowerCase())
    return matchesSearch && matchesType && matchesLocation
  })

  const handleAddProperty = (data: any) => {
    // In a real app, you would call an API to add the property
    console.log("Adding property:", data)
    toast({
      title: "Property Added",
      description: `${data.name} has been added successfully.`,
    })
    setIsAddModalOpen(false)
  }

  const handleEditProperty = (data: any) => {
    // In a real app, you would call an API to update the property
    console.log("Editing property:", data)
    toast({
      title: "Property Updated",
      description: `${data.name} has been updated successfully.`,
    })
    setIsEditModalOpen(false)
  }

  const handleViewProperty = (property: any) => {
    setSelectedProperty(property)
    setIsViewModalOpen(true)
  }

  const handleEditClick = (property: any) => {
    setSelectedProperty(property)
    setIsEditModalOpen(true)
  }

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
            <CardDescription>Manage your PGs, hostels, and apartments</CardDescription>
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
                  {filteredProperties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium">{property.name}</TableCell>
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
                            <Badge variant="outline">+{property.facilities.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => handleViewProperty(property)}>
                          View
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(property)}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Property Modal */}
      <PropertyForm isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddProperty} />

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
  )
}
