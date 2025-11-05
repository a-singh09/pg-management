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
import { formatDistanceToNow } from "date-fns";
import { IssueForm } from "@/components/forms/issue-form";
import { useToast } from "@/components/ui/use-toast";
import { ActionsDropdown } from "@/components/ui/actions-dropdown";
import { issueService, propertyService, tenantService } from "@/lib/services";
import { Issue, CreateIssueData, UpdateIssueData } from "@/lib/transformers";
import { Property } from "@/lib/transformers/property-transformer";
import { Tenant } from "@/lib/transformers/tenant-transformer";
import { ApiError, ApiErrorType } from "@/lib/api-client";

export default function IssuesPage() {
  // State for UI
  const [searchTerm, setSearchTerm] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // State for data
  const [issues, setIssues] = useState<Issue[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load all data in parallel
      const [issuesData, propertiesData, tenantsData] = await Promise.all([
        issueService.getIssues(propertyFilter || undefined),
        propertyService.getProperties(),
        tenantService.getTenants(),
      ]);

      setIssues(issuesData);
      setProperties(propertiesData);
      setTenants(tenantsData);
    } catch (err) {
      console.error("Failed to load data:", err);
      const apiError = err as ApiError;

      if (apiError.type === ApiErrorType.AUTHENTICATION_ERROR) {
        setError("Authentication failed. Please log in again.");
      } else if (apiError.type === ApiErrorType.NETWORK_ERROR) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(
          apiError.message || "Failed to load issues. Please try again.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Reload issues when property filter changes
  useEffect(() => {
    if (!isLoading) {
      loadIssues();
    }
  }, [propertyFilter]);

  const loadIssues = async () => {
    try {
      const issuesData = await issueService.getIssues(
        propertyFilter || undefined,
      );
      setIssues(issuesData);
    } catch (err) {
      console.error("Failed to load issues:", err);
      const apiError = err as ApiError;
      toast({
        title: "Error",
        description: apiError.message || "Failed to load issues",
        variant: "destructive",
      });
    }
  };

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || issue.status === statusFilter;
    const matchesType = typeFilter === "" || issue.category === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleAddIssue = async (data: CreateIssueData) => {
    try {
      await issueService.createIssue(data);
      toast({
        title: "Issue Reported",
        description: "The issue has been reported successfully.",
      });
      setIsAddModalOpen(false);
      // Reload issues to show the new one
      await loadIssues();
    } catch (err) {
      console.error("Failed to create issue:", err);
      const apiError = err as ApiError;
      toast({
        title: "Error",
        description: apiError.message || "Failed to report issue",
        variant: "destructive",
      });
    }
  };

  const handleEditIssue = async (data: UpdateIssueData) => {
    if (!selectedIssue) return;

    try {
      await issueService.updateIssue(selectedIssue.id, data);
      toast({
        title: "Issue Updated",
        description: "The issue has been updated successfully.",
      });
      setIsEditModalOpen(false);
      setSelectedIssue(null);
      // Reload issues to show the updated data
      await loadIssues();
    } catch (err) {
      console.error("Failed to update issue:", err);
      const apiError = err as ApiError;
      toast({
        title: "Error",
        description: apiError.message || "Failed to update issue",
        variant: "destructive",
      });
    }
  };

  const handleViewIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setIsEditModalOpen(true);
  };

  const handleStartWork = async (issue: Issue) => {
    try {
      await issueService.updateIssue(issue.id, { status: "in_progress" });
      toast({
        title: "Issue Status Updated",
        description: "Issue status changed to in progress.",
      });
      // Reload issues to show the updated status
      await loadIssues();
    } catch (err) {
      console.error("Failed to update issue status:", err);
      const apiError = err as ApiError;
      toast({
        title: "Error",
        description: apiError.message || "Failed to update issue status",
        variant: "destructive",
      });
    }
  };

  const handleMarkResolved = async (issue: Issue) => {
    try {
      await issueService.updateIssue(issue.id, {
        status: "resolved",
        resolved_at: new Date().toISOString(),
      });
      toast({
        title: "Issue Resolved",
        description: "Issue has been marked as resolved.",
      });
      // Reload issues to show the updated status
      await loadIssues();
    } catch (err) {
      console.error("Failed to resolve issue:", err);
      const apiError = err as ApiError;
      toast({
        title: "Error",
        description: apiError.message || "Failed to resolve issue",
        variant: "destructive",
      });
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
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
  );

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">Issues</h2>
          </div>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button
                variant="outline"
                size="sm"
                className="ml-4"
                onClick={loadData}
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Issues</h2>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Report Issue
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Issue Management</CardTitle>
            <CardDescription>
              Track and resolve maintenance issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search issues..."
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
              <select
                className="border rounded-md h-10 px-3 py-2 w-full md:w-auto"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <select
                className="border rounded-md h-10 px-3 py-2 w-full md:w-auto"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="maintenance">Maintenance</option>
                <option value="cleaning">Cleaning</option>
                <option value="security">Security</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIssues.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No issues found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredIssues.map((issue) => {
                      const property = properties.find(
                        (p) => p.id === issue.pg_id,
                      );
                      return (
                        <TableRow key={issue.id}>
                          <TableCell className="font-medium">
                            {issue.title}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{issue.category}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                issue.priority === "urgent"
                                  ? "destructive"
                                  : issue.priority === "high"
                                    ? "default"
                                    : issue.priority === "medium"
                                      ? "secondary"
                                      : "outline"
                              }
                            >
                              {issue.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>{property?.name || "Unknown"}</TableCell>
                          <TableCell>{issue.reported_by}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                issue.status === "resolved"
                                  ? "outline"
                                  : issue.status === "in_progress"
                                    ? "secondary"
                                    : "default"
                              }
                            >
                              {issue.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <ActionsDropdown
                              onView={() => handleViewIssue(issue)}
                              onEdit={() => handleEditClick(issue)}
                              showDelete={false}
                              customActions={[
                                ...(issue.status === "pending"
                                  ? [
                                      {
                                        label: "Start Work",
                                        onClick: () => handleStartWork(issue),
                                      },
                                    ]
                                  : []),
                                ...(issue.status === "in_progress"
                                  ? [
                                      {
                                        label: "Mark Resolved",
                                        onClick: () =>
                                          handleMarkResolved(issue),
                                      },
                                    ]
                                  : []),
                              ]}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      issues.filter((issue) => issue.status === "pending")
                        .length
                    }
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    In Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      issues.filter((issue) => issue.status === "in_progress")
                        .length
                    }
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Resolved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      issues.filter((issue) => issue.status === "resolved")
                        .length
                    }
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Issue Modal */}
      <IssueForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddIssue}
        properties={properties}
        tenants={tenants}
      />

      {/* Edit Issue Modal */}
      {selectedIssue && (
        <IssueForm
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedIssue(null);
          }}
          initialData={selectedIssue}
          onSubmit={handleEditIssue}
          properties={properties}
          tenants={tenants}
        />
      )}

      {/* View Issue Modal */}
      {selectedIssue && (
        <IssueForm
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedIssue(null);
          }}
          initialData={selectedIssue}
          onSubmit={() => setIsViewModalOpen(false)}
          properties={properties}
          tenants={tenants}
          readOnly
        />
      )}
    </div>
  );
}
