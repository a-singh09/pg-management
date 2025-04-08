"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { expenses, pgs } from "@/lib/data"
import { Download, Plus, Search } from "lucide-react"
import { format } from "date-fns"
import { ExpenseForm } from "@/components/forms/expense-form"
import { useToast } from "@/components/ui/use-toast"

export default function ExpensesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [propertyFilter, setPropertyFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<any>(null)
  const { toast } = useToast()

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProperty = propertyFilter === "" || expense.pg_id === propertyFilter
    const matchesCategory = categoryFilter === "" || expense.category === categoryFilter
    const matchesDate = dateFilter === "" || format(new Date(expense.expense_date), "yyyy-MM-dd") === dateFilter
    return matchesSearch && matchesProperty && matchesCategory && matchesDate
  })

  const handleAddExpense = (data: any) => {
    // In a real app, you would call an API to add the expense
    console.log("Adding expense:", data)
    toast({
      title: "Expense Added",
      description: `${data.description} has been added successfully.`,
    })
    setIsAddModalOpen(false)
  }

  const handleEditExpense = (data: any) => {
    // In a real app, you would call an API to update the expense
    console.log("Editing expense:", data)
    toast({
      title: "Expense Updated",
      description: `${data.description} has been updated successfully.`,
    })
    setIsEditModalOpen(false)
  }

  const handleEditClick = (expense: any) => {
    setSelectedExpense(expense)
    setIsEditModalOpen(true)
  }

  const handleExportCSV = () => {
    // In a real app, you would generate and download a CSV file
    toast({
      title: "Export Started",
      description: "Your expense data is being exported to CSV.",
    })
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Expenses</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Expense Management</CardTitle>
            <CardDescription>Track and manage all your expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search expenses..."
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
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Utility">Utility</option>
                <option value="Salary">Salary</option>
                <option value="Food">Food</option>
                <option value="Miscellaneous">Miscellaneous</option>
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
                    <TableHead>Property</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.map((expense) => {
                    const property = pgs.find((pg) => pg.id === expense.pg_id)
                    return (
                      <TableRow key={expense.id}>
                        <TableCell>{property?.name || "Unknown"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{expense.category}</Badge>
                        </TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell className="font-medium">₹{expense.amount}</TableCell>
                        <TableCell>{format(new Date(expense.expense_date), "dd MMM yyyy")}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleEditClick(expense)}>
                            Edit
                          </Button>
                          <Button variant="ghost" size="sm">
                            Delete
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
                <span className="text-muted-foreground">Total Expenses: </span>
                <span className="font-bold">
                  ₹{filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0).toLocaleString()}
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

      {/* Add Expense Modal */}
      <ExpenseForm isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddExpense} />

      {/* Edit Expense Modal */}
      {selectedExpense && (
        <ExpenseForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={selectedExpense}
          onSubmit={handleEditExpense}
        />
      )}
    </div>
  )
}
