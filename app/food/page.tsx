"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { foodRegister, pgs } from "@/lib/data"
import { Plus, Search } from "lucide-react"
import { FoodForm } from "@/components/forms/food-form"
import { useToast } from "@/components/ui/use-toast"

export default function FoodPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [propertyFilter, setPropertyFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedFood, setSelectedFood] = useState<any>(null)
  const { toast } = useToast()

  const filteredFood = foodRegister.filter((entry) => {
    const matchesSearch = entry.menu.some((item) => item.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesProperty = propertyFilter === "" || entry.pg_id === propertyFilter
    const matchesDate = dateFilter === "" || entry.date === dateFilter
    return matchesSearch && matchesProperty && matchesDate
  })

  const handleAddFood = (data: any) => {
    // In a real app, you would call an API to add the food entry
    console.log("Adding food entry:", data)
    toast({
      title: "Food Entry Added",
      description: `Food entry for ${data.date} has been added successfully.`,
    })
    setIsAddModalOpen(false)
  }

  const handleEditFood = (data: any) => {
    // In a real app, you would call an API to update the food entry
    console.log("Editing food entry:", data)
    toast({
      title: "Food Entry Updated",
      description: `Food entry for ${data.date} has been updated successfully.`,
    })
    setIsEditModalOpen(false)
  }

  const handleViewFood = (entry: any) => {
    setSelectedFood(entry)
    setIsViewModalOpen(true)
  }

  const handleEditClick = (entry: any) => {
    setSelectedFood(entry)
    setIsEditModalOpen(true)
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Food Register</h2>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Food Entry
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Food Management</CardTitle>
            <CardDescription>Track daily food consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search food entries..."
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
              <Input
                type="date"
                className="w-full md:w-auto"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Meals Served</TableHead>
                    <TableHead>Menu</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFood.map((entry) => {
                    const property = pgs.find((pg) => pg.id === entry.pg_id)
                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">{entry.date}</TableCell>
                        <TableCell>{property?.name || "Unknown"}</TableCell>
                        <TableCell>{entry.meals_served}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {entry.menu.map((item) => (
                              <Badge key={item} variant="outline">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(entry)}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleViewFood(entry)}>
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Meals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {filteredFood.reduce((sum, entry) => sum + entry.meals_served, 0)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Meals/Day</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {filteredFood.length > 0
                      ? Math.round(
                          filteredFood.reduce((sum, entry) => sum + entry.meals_served, 0) / filteredFood.length,
                        )
                      : 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Most Popular Item</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Rice</div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Food Modal */}
      <FoodForm isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddFood} />

      {/* Edit Food Modal */}
      {selectedFood && (
        <FoodForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={selectedFood}
          onSubmit={handleEditFood}
        />
      )}

      {/* View Food Modal */}
      {selectedFood && (
        <FoodForm
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          initialData={selectedFood}
          onSubmit={() => setIsViewModalOpen(false)}
        />
      )}
    </div>
  )
}
