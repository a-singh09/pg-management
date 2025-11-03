"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dashboardService } from "@/lib/services";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Issue {
  id: string;
  description: string;
  status: string;
  reported_at: string;
}

export function RecentIssues() {
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentIssues = async () => {
      try {
        setLoading(true);
        const issues = await dashboardService.getRecentIssues();
        setRecentIssues(issues);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch recent issues:", err);
        setError("Failed to load recent issues");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentIssues();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Issues</CardTitle>
        <CardDescription>Latest reported maintenance issues</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-600">{error}</p>
          </div>
        ) : recentIssues.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No recent issues</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentIssues.map((issue) => (
              <div key={issue.id} className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {issue.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Reported{" "}
                    {formatDistanceToNow(new Date(issue.reported_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
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
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
