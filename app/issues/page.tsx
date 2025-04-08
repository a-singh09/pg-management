"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { issues, pgs, tenants } from "@/lib/data"
import { Plus, Search } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { IssueForm } from "@/components/forms/issue-form"
import { useToast } from "@/components/ui/use-toast"

export default function IssuesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [propertyFilter, setPropertyFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<any>(null)
  const { toast } = useToast()

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch = issue.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProperty = propertyFilter === "" || issue.pg_id === propertyFilter
    const matchesStatus = statusFilter === "" || issue.status === statusFilter
    const matchesType = typeFilter === "" || issue.issue_type === typeFilter
    return matchesSearch && matchesProperty && matchesStatus && matchesType
  })

  const handleAddIssue = (data: any) => {
    // In a real app, you would call an API to add the issue
    console.log("Adding issue:", data)
    toast({
      title: "Issue Reported",
      description: "The issue has been reported successfully.",
    })
    setIsAddModalOpen(false)
  }

  const handleEditIssue = (data: any) => {
    // In a real app, you would call an API to update the issue
    console.log("Editing issue:", data)
    toast({
      title: "Issue Updated",
      description: "The issue has been updated successfully.",
    })
    setIsEditModalOpen(false)
  }

  const handleViewIssue = (issue: any) => {
    setSelectedIssue(issue)
    setIsViewModalOpen(true)
  }

  const handleEditClick = (issue: any) => {
    setSelectedIssue(issue)
    setIsEditModalOpen(true)
  }

  const handleStartWork = (issue: any) => {
    setSelectedIssue({
      ...issue,
      status: "in-progress",
    })
    setIsEditModalOpen(true)
  }

  const handleMarkResolved = (issue: any) => {
    setSelectedIssue({
      ...issue,
      status: "resolved",
      resolved_at: new Date().toISOString(),
    })
    setIsEditModalOpen(true)
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
            <CardDescription>Track and resolve maintenance issues</CardDescription>
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
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <select
                className="border rounded-md h-10 px-3 py-2 w-full md:w-auto"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Furniture">Furniture</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Issue</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Reported By</TableHead>
                    <TableHead>Reported On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIssues.map((issue) => {
                    const property = pgs.find((pg) => pg.id === issue.pg_id)
                    const tenant = tenants.find((t) => t.id === issue.tenant_id)
                    return (
                      <TableRow key={issue.id}>
                        <TableCell className="font-medium">{issue.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{issue.issue_type}</Badge>
                        </TableCell>
                        <TableCell>{property?.name || "Unknown"}</TableCell>
                        <TableCell>{tenant?.name || "Unknown"}</TableCell>
                        <TableCell>{formatDistanceToNow(new Date(issue.reported_at), { addSuffix: true })}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              issue.status === "resolved"
                                ? "outline"
                                : issue.status === "in-progress"
                                  ? "secondary"
                                  : "default"
                            }
                          >
                            {issue.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {issue.status === "pending" && (
                            <Button variant="default" size="sm" onClick={() => handleStartWork(issue)}>
                              Start Work
                            </Button>
                          )}
                          {issue.status === "in-progress" && (
                            <Button variant="default" size="sm" onClick={() => handleMarkResolved(issue)}>
                              Mark Resolved
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleViewIssue(issue)}>
                            Details
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
                  <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {issues.filter((issue) => issue.status === "pending").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {issues.filter((issue) => issue.status === "in-progress").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {issues.filter((issue) => issue.status === "resolved").length}
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Issue Modal */}
      <IssueForm isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddIssue} />

      {/* Edit Issue Modal */}
      {selectedIssue && (
        <IssueForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={selectedIssue}
          onSubmit={handleEditIssue}
        />
      )}

      {/* View Issue Modal */}
      {selectedIssue && (
        <IssueForm
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          initialData={selectedIssue}
          onSubmit={() => setIsViewModalOpen(false)}
        />
      )}
    </div>
  )
}
