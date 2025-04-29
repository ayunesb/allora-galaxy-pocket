
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface ApprovalStatsTableProps {
  strategies?: {
    id: string;
    title: string;
    status: string;
    auto_approved: boolean;
    created_at: string;
    approved_at?: string | null;
  }[];
}

export const ApprovalStatsTable: React.FC<ApprovalStatsTableProps> = ({ strategies = [] }) => {
  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Approval Type</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Approved</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {strategies.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No strategy approvals found
              </TableCell>
            </TableRow>
          ) : (
            strategies.map((strategy) => (
              <TableRow key={strategy.id}>
                <TableCell className="font-medium">{strategy.title || "Untitled"}</TableCell>
                <TableCell>{strategy.status}</TableCell>
                <TableCell>
                  {strategy.auto_approved ? 'AI Approval' : 'Human Approval'}
                </TableCell>
                <TableCell>
                  {new Date(strategy.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {strategy.approved_at 
                    ? new Date(strategy.approved_at).toLocaleDateString() 
                    : '-'}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ApprovalStatsTable;
