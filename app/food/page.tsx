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
import { FoodForm } from "@/components/forms/food-form";
import { useToast } from "@/components/ui/use-toast";
import { ActionsDropdown } from "@/components/ui/actions-dropdown";
import { foodService, propertyService } from "@/lib/services";
import {
  Food,
  Property,
  FoodAnalytics,
  KitchenInsights,
} from "@/lib/transformers";

export default function FoodPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [foodEntries, setFoodEntries] = useState<Food[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [analytics, setAnalytics] = useState<FoodAnalytics | null>(null);
  const [insights, setInsights] = useState<KitchenInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load properties and food entries in parallel
      const [propertiesData, foodData] = await Promise.all([
        propertyService.getProperties(),
        foodService.getFoodEntries(),
      ]);

      setProperties(propertiesData);
      setFoodEntries(foodData);

      // Load analytics and insights
      try {
        const [analyticsData, insightsData] = await Promise.all([
          foodService.getFoodAnalytics(),
          foodService.getKitchenInsights(),
        ]);
        setAnalytics(analyticsData);
        setInsights(insightsData);
      } catch (analyticsError) {
        // Analytics are optional, don't fail the whole page
        console.warn("Failed to load food analytics:", analyticsError);
      }
    } catch (err: any) {
      console.error("Failed to load food data:", err);
      setError(err.message || "Failed to load food data");
    } finally {
      setLoading(false);
    }
  };

  const filteredFood = foodEntries.filter((entry) => {
    const matchesSearch =
      entry.menu_items?.some((item) =>
        item.toLowerCase().includes(searchTerm.toLowerCase()),
      ) || false;
    const matchesProperty =
      propertyFilter === "" || entry.pg_id === propertyFilter;
    const matchesDate = dateFilter === "" || entry.date === dateFilter;
    return matchesSearch && matchesProperty && matchesDate;
  });

  const handleAddFood = async (data: any) => {
    try {
      const newFood = await foodService.createFoodEntry(data);
      setFoodEntries((prev) => [...prev, newFood]);
      toast({
        title: "Food Entry Added",
        description: `Food entry for ${data.date} has been added successfully.`,
      });
      setIsAddModalOpen(false);
      // Refresh analytics
      try {
        const [analyticsData, insightsData] = await Promise.all([
          foodService.getFoodAnalytics(),
          foodService.getKitchenInsights(),
        ]);
        setAnalytics(analyticsData);
        setInsights(insightsData);
      } catch (analyticsError) {
        console.warn("Failed to refresh analytics:", analyticsError);
      }
    } catch (error: any) {
      console.error("Failed to add food entry:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add food entry",
        variant: "destructive",
      });
    }
  };

  const handleEditFood = async (data: any) => {
    if (!selectedFood) return;

    try {
      const updatedFood = await foodService.updateFoodEntry(
        selectedFood.id,
        data,
      );
      setFoodEntries((prev) =>
        prev.map((food) => (food.id === selectedFood.id ? updatedFood : food)),
      );
      toast({
        title: "Food Entry Updated",
        description: `Food entry for ${data.date} has been updated successfully.`,
      });
      setIsEditModalOpen(false);
      setSelectedFood(null);
      // Refresh analytics
      try {
        const [analyticsData, insightsData] = await Promise.all([
          foodService.getFoodAnalytics(),
          foodService.getKitchenInsights(),
        ]);
        setAnalytics(analyticsData);
        setInsights(insightsData);
      } catch (analyticsError) {
        console.warn("Failed to refresh analytics:", analyticsError);
      }
    } catch (error: any) {
      console.error("Failed to update food entry:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update food entry",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFood = async (foodId: string) => {
    try {
      await foodService.deleteFoodEntry(foodId);
      setFoodEntries((prev) => prev.filter((food) => food.id !== foodId));
      toast({
        title: "Food Entry Deleted",
        description: "Food entry has been deleted successfully.",
      });
      // Refresh analytics
      try {
        const [analyticsData, insightsData] = await Promise.all([
          foodService.getFoodAnalytics(),
          foodService.getKitchenInsights(),
        ]);
        setAnalytics(analyticsData);
        setInsights(insightsData);
      } catch (analyticsError) {
        console.warn("Failed to refresh analytics:", analyticsError);
      }
    } catch (error: any) {
      console.error("Failed to delete food entry:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete food entry",
        variant: "destructive",
      });
    }
  };

  const handleViewFood = (entry: Food) => {
    setSelectedFood(entry);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (entry: Food) => {
    setSelectedFood(entry);
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Food Register</h2>
            <Skeleton className="h-10 w-32" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Food Register</h2>
            <Button onClick={loadData}>Retry</Button>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
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
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
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
                    const property = properties.find(
                      (prop) => prop.id === entry.pg_id,
                    );
                    return (
                      <TableRow key={entry.id}>
                        <TableCell className="font-medium">
                          {entry.date}
                        </TableCell>
                        <TableCell>{property?.name || "Unknown"}</TableCell>
                        <TableCell>{entry.meals_served}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {entry.menu_items?.map((item) => (
                              <Badge key={item} variant="outline">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <ActionsDropdown
                            onView={() => handleViewFood(entry)}
                            onEdit={() => handleEditClick(entry)}
                            onDelete={() => handleDeleteFood(entry.id)}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Meals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.totalMeals ||
                      filteredFood.reduce(
                        (sum, entry) => sum + entry.meals_served,
                        0,
                      )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Meals/Day
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.averageMealsPerDay ||
                      (filteredFood.length > 0
                        ? Math.round(
                            filteredFood.reduce(
                              (sum, entry) => sum + entry.meals_served,
                              0,
                            ) / filteredFood.length,
                          )
                        : 0)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Most Popular Item
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.mostPopularItems?.[0]?.item || "N/A"}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Kitchen Insights Section */}
            {insights && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Kitchen Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {insights.recommendations.map((rec, index) => (
                          <li
                            key={index}
                            className="text-sm text-muted-foreground"
                          >
                            • {rec}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Cost Optimization
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {insights.costOptimization.map((opt, index) => (
                          <li key={index} className="text-sm">
                            <span className="text-muted-foreground">
                              • {opt.suggestion}
                            </span>
                            <span className="text-green-600 font-medium ml-2">
                              Save ₹{opt.potentialSaving}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Food Modal */}
      <FoodForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddFood}
        properties={properties}
      />

      {/* Edit Food Modal */}
      {selectedFood && (
        <FoodForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={selectedFood}
          onSubmit={handleEditFood}
          properties={properties}
        />
      )}

      {/* View Food Modal */}
      {selectedFood && (
        <FoodForm
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          initialData={selectedFood}
          onSubmit={() => setIsViewModalOpen(false)}
          properties={properties}
        />
      )}
    </div>
  );
}
