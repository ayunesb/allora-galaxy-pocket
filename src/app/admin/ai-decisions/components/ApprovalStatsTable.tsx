
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Strategy } from "@/types/strategy";

export interface ApprovalStatsTableProps {
  strategies: Strategy[];
}

export function ApprovalStatsTable({ strategies }: ApprovalStatsTableProps) {
  const approvalStats = {
    totalApproved: strategies.filter(s => s.status === 'approved').length,
    aiApproved: strategies.filter(s => s.status === 'approved' && s.auto_approved).length,
    humanApproved: strategies.filter(s => s.status === 'approved' && !s.auto_approved).length,
    pendingApproval: strategies.filter(s => s.status === 'pending').length,
    rejectedStrategies: strategies.filter(s => s.status === 'rejected').length
  };
  
  const agentBreakdown = strategies.reduce((acc: Record<string, number>, curr) => {
    const agent = curr.generated_by || 'Unknown';
    acc[agent] = (acc[agent] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Metric</TableHead>
            <TableHead className="text-right">Count</TableHead>
            <TableHead className="text-right">Percentage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Total Strategies</TableCell>
            <TableCell className="text-right">{strategies.length}</TableCell>
            <TableCell className="text-right">100%</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>AI Approved</TableCell>
            <TableCell className="text-right">{approvalStats.aiApproved}</TableCell>
            <TableCell className="text-right">
              {strategies.length > 0 ? Math.round((approvalStats.aiApproved / strategies.length) * 100) : 0}%
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Human Approved</TableCell>
            <TableCell className="text-right">{approvalStats.humanApproved}</TableCell>
            <TableCell className="text-right">
              {strategies.length > 0 ? Math.round((approvalStats.humanApproved / strategies.length) * 100) : 0}%
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Pending Approval</TableCell>
            <TableCell className="text-right">{approvalStats.pendingApproval}</TableCell>
            <TableCell className="text-right">
              {strategies.length > 0 ? Math.round((approvalStats.pendingApproval / strategies.length) * 100) : 0}%
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Rejected</TableCell>
            <TableCell className="text-right">{approvalStats.rejectedStrategies}</TableCell>
            <TableCell className="text-right">
              {strategies.length > 0 ? Math.round((approvalStats.rejectedStrategies / strategies.length) * 100) : 0}%
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      
      <h3 className="text-lg font-medium mt-8 mb-4">Strategy Breakdown by Agent</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(agentBreakdown).map(([agent, count]) => (
          <div key={agent} className="bg-muted/30 p-4 rounded-md">
            <Badge variant="secondary" className="mb-2">
              {agent}
            </Badge>
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-xs text-muted-foreground">
              {strategies.length > 0 ? Math.round((count / strategies.length) * 100) : 0}% of total
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
