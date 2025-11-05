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
import { Download, Plus, Search, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ExpenseForm } from "@/components/forms/expense-form";
import { ActionsDropdown } from "@/components/ui/actions-dropdown";
import { DeleteConfirmationDialog } from "@/components/dialogs/delete-confirmation-dialog";
import { useToast } from "@/components/ui/use-toast";
import { expenseService, propertyService } from "@/lib/services";
import { ApiError, ApiErrorType } from "@/lib/api-client";
import type { Expense, Property } from "@/lib/transformers";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [expensesData, propertiesData] = await Promise.all([
        expenseService.getExpenses(),
        propertyService.getProperties(),
      ]);

      setExpenses(expensesData);
      setProperties(propertiesData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      const apiError = err as ApiError;

      if (apiError.type === ApiErrorType.AUTHENTICATION_ERROR) {
        setError("Please log in to view expenses");
      } else if (apiError.type === ApiErrorType.NETWORK_ERROR) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(apiError.message || "Failed to load expenses");
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesProperty =
      propertyFilter === "" || expense.pg_id === propertyFilter;
    const matchesCategory =
      categoryFilter === "" || expense.category === categoryFilter;
    const matchesDate =
      dateFilter === "" ||
      format(new Date(expense.expense_date), "yyyy-MM-dd") === dateFilter;
    return matchesSearch && matchesProperty && matchesCategory && matchesDate;
  });

  const handleAddExpense = async (data: any) => {
    try {
      setActionLoading("add");

      const newExpense = await expenseService.createExpense({
        pg_id: data.pg_id,
        category: data.category,
        description: data.description,
        amount: Number(data.amount),
        expense_date: data.expense_date,
        payment_method: data.payment_method || "cash",
        vendor: data.vendor,
        receipt_number: data.receipt_number,
      });

      setExpenses((prev) => [...prev, newExpense]);

      toast({
        title: "Expense Added",
        description: `${data.description} has been added successfully.`,
      });

      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Failed to add expense:", err);
      const apiError = err as ApiError;

      toast({
        title: "Error",
        description: apiError.message || "Failed to add expense",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditExpense = async (data: any) => {
    if (!selectedExpense) return;

    try {
      setActionLoading("edit");

      const updatedExpense = await expenseService.updateExpense(
        selectedExpense.id,
        {
          category: data.category,
          description: data.description,
          amount: Number(data.amount),
          expense_date: data.expense_date,
          payment_method: data.payment_method,
          vendor: data.vendor,
          receipt_number: data.receipt_number,
        },
      );

      setExpenses((prev) =>
        prev.map((expense) =>
          expense.id === selectedExpense.id ? updatedExpense : expense,
        ),
      );

      toast({
        title: "Expense Updated",
        description: `${data.description} has been updated successfully.`,
      });

      setIsEditModalOpen(false);
      setSelectedExpense(null);
    } catch (err) {
      console.error("Failed to update expense:", err);
      const apiError = err as ApiError;

      toast({
        title: "Error",
        description: apiError.message || "Failed to update expense",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsEditModalOpen(true);
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const handleDeleteClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedExpense) return;

    try {
      setActionLoading(`delete-${selectedExpense.id}`);

      await expenseService.deleteExpense(selectedExpense.id);

      setExpenses((prev) =>
        prev.filter((expense) => expense.id !== selectedExpense.id),
      );

      toast({
        title: "Expense Deleted",
        description: "The expense has been deleted successfully.",
      });

      setIsDeleteDialogOpen(false);
      setSelectedExpense(null);
    } catch (err) {
      console.error("Failed to delete expense:", err);
      const apiError = err as ApiError;

      toast({
        title: "Error",
        description: apiError.message || "Failed to delete expense",
        variant: "destructive",
      });
      throw err;
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportCSV = () => {
    // In a real app, you would generate and download a CSV file
    toast({
      title: "Export Started",
      description: "Your expense data is being exported to CSV.",
    });
  };

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
                onClick={fetchData}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Expense Management</CardTitle>
            <CardDescription>
              Track and manage all your expenses
            </CardDescription>
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
                disabled={loading}
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
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                disabled={loading}
              >
                <option value="">All Categories</option>
                <option value="maintenance">Maintenance</option>
                <option value="utilities">Utilities</option>
                <option value="repairs">Repairs</option>
                <option value="supplies">Supplies</option>
                <option value="staff">Staff</option>
                <option value="other">Other</option>
              </select>
              <Input
                type="date"
                className="w-full md:w-auto"
                value={dateFilter}
                disabled={loading}
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
                  {loading ? (
                    // Loading skeleton
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {error
                          ? "Failed to load expenses"
                          : "No expenses found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses.map((expense) => {
                      const property = properties.find(
                        (prop) => prop.id === expense.pg_id,
                      );
                      return (
                        <TableRow key={expense.id}>
                          <TableCell>{property?.name || "Unknown"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{expense.category}</Badge>
                          </TableCell>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell className="font-medium">
                            ₹{expense.amount}
                          </TableCell>
                          <TableCell>
                            {format(
                              new Date(expense.expense_date),
                              "dd MMM yyyy",
                            )}
                          </TableCell>
                          <TableCell>
                            <ActionsDropdown
                              onEdit={() => handleEditClick(expense)}
                              onDelete={() => handleDeleteClick(expense)}
                              showView={false}
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
                <span className="text-muted-foreground">Total Expenses: </span>
                <span className="font-bold">
                  ₹
                  {filteredExpenses
                    .reduce((sum, expense) => sum + expense.amount, 0)
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

      {/* Add Expense Modal */}
      <ExpenseForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddExpense}
        properties={properties}
        isSubmitting={actionLoading === "add"}
      />

      {/* Edit Expense Modal */}
      {selectedExpense && (
        <ExpenseForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={selectedExpense}
          onSubmit={handleEditExpense}
          properties={properties}
          isSubmitting={actionLoading === "edit"}
        />
      )}

      {/* Delete Expense Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedExpense(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Are you sure you want to delete this expense?"
        description={`This action cannot be undone. This will permanently delete the expense "${selectedExpense?.description}".`}
      />
    </div>
  );
}
