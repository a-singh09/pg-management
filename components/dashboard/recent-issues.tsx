import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { issues } from "@/lib/data"
import { formatDistanceToNow } from "date-fns"

export function RecentIssues() {
  // Get only the most recent 5 issues
  const recentIssues = [...issues]
    .sort((a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime())
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Issues</CardTitle>
        <CardDescription>Latest reported maintenance issues</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentIssues.map((issue) => (
            <div key={issue.id} className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">{issue.description}</p>
                <p className="text-xs text-muted-foreground">
                  Reported {formatDistanceToNow(new Date(issue.reported_at), { addSuffix: true })}
                </p>
              </div>
              <Badge
                variant={
                  issue.status === "resolved" ? "outline" : issue.status === "in-progress" ? "secondary" : "default"
                }
              >
                {issue.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
