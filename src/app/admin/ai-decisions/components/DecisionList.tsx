
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { FilterState } from "./DecisionFilters";

export interface DecisionListProps {
  decisions: any[];
  filters: FilterState;
}

export function DecisionList({ decisions, filters }: DecisionListProps) {
  // Apply filters
  const filteredDecisions = decisions.filter((decision) => {
    // Filter by agent if specified
    if (filters.agentFilter !== "all" && decision.generated_by !== filters.agentFilter) {
      return false;
    }
    
    // Filter by approval type
    if (filters.approvalType === "ai" && (!decision.auto_approved || decision.status !== "approved")) {
      return false;
    } else if (filters.approvalType === "human" && (decision.auto_approved || decision.status !== "approved")) {
      return false;
    } else if (filters.approvalType === "pending" && decision.status !== "pending") {
      return false;
    }
    
    // Filter by date range if not "all"
    if (filters.dateRange !== "all") {
      const daysAgo = parseInt(filters.dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      
      return new Date(decision.created_at) >= cutoffDate;
    }
    
    return true;
  });

  if (filteredDecisions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No decisions match your filter criteria.
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Strategy</TableHead>
            <TableHead>Agent</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Approved By</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDecisions.map((decision) => (
            <TableRow key={decision.id}>
              <TableCell className="font-medium">{decision.title || "Untitled Strategy"}</TableCell>
              <TableCell>{decision.generated_by || "Unknown"}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    decision.status === "approved" ? "success" : 
                    decision.status === "pending" ? "outline" : 
                    "destructive"
                  }
                >
                  {decision.status}
                </Badge>
              </TableCell>
              <TableCell>
                {decision.created_at ? 
                  formatDistanceToNow(new Date(decision.created_at), { addSuffix: true }) : 
                  "Unknown"
                }
              </TableCell>
              <TableCell>
                {decision.status === "approved" ? 
                  (decision.auto_approved ? "AI" : "Human") : 
                  "-"
                }
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm">View Details</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
