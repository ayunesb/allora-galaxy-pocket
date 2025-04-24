
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { supabase } from "@/integrations/supabase/client";

interface ApprovalStat {
  tenant_id: string;
  total_approved: number;
  ai_approved: number;
  human_approved: number;
  ai_percent: number;
}

export function ApprovalStatsTable() {
  const isMobile = useIsMobile();
  
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

  const columns = [
    {
      header: "Tenant ID",
      accessorKey: "tenant_id"
    },
    {
      header: "AI %",
      accessorKey: "ai_percent",
      cell: (value: number) => `${value}%`
    },
    {
      header: "AI-Approved",
      accessorKey: "ai_approved"
    },
    {
      header: "Human-Approved",
      accessorKey: "human_approved"
    },
    {
      header: "Total",
      accessorKey: "total_approved"
    }
  ];

  if (isLoading) {
    return <div>Loading approval statistics...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Strategy Approval Statistics</h2>
      <ResponsiveTable
        columns={columns}
        data={approvalStats || []}
        emptyMessage="No approval statistics available"
      />
    </div>
  );
}
