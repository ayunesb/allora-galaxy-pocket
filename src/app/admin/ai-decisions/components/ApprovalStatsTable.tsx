
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ApprovalStat {
  tenant_id: string;
  total_approved: number;
  ai_approved: number;
  human_approved: number;
  ai_percent: number;
}

export function ApprovalStatsTable() {
  const { data: approvalStats, isLoading } = useQuery({
    queryKey: ['approval-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategy_approval_stats')
        .select('*');
      
      if (error) throw error;
      return data as ApprovalStat[];
    }
  });

  if (isLoading) {
    return <div>Loading approval statistics...</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Strategy Approval Statistics</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tenant ID</TableHead>
            <TableHead>AI %</TableHead>
            <TableHead>AI-Approved</TableHead>
            <TableHead>Human-Approved</TableHead>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {approvalStats?.map((stat) => (
            <TableRow key={stat.tenant_id}>
              <TableCell>{stat.tenant_id}</TableCell>
              <TableCell>{stat.ai_percent}%</TableCell>
              <TableCell>{stat.ai_approved}</TableCell>
              <TableCell>{stat.human_approved}</TableCell>
              <TableCell>{stat.total_approved}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
