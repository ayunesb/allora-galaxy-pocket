
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ApprovalStats } from "@/types/decisions";

async function fetchApprovalStats(): Promise<ApprovalStats> {
  const { data, error } = await supabase.rpc('count_strategy_approvals');
  if (error) throw error;
  return data as ApprovalStats;
}

export function ApprovalMetricsCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['approval-stats'],
    queryFn: fetchApprovalStats
  });

  if (isLoading) {
    return <Card className="min-h-[300px] flex items-center justify-center">Loading...</Card>;
  }

  if (!data) {
    return null;
  }

  const aiPercentage = Math.round((data.ai_approved / data.total_approved) * 100) || 0;
  const humanPercentage = 100 - aiPercentage;

  const chartData = [
    { name: 'AI-Approved', value: aiPercentage },
    { name: 'Human-Approved', value: humanPercentage },
  ];

  const COLORS = ['#10b981', '#3b82f6'];

  return (
    <Card>
      <CardHeader>
        <h4 className="text-md font-semibold">🧠 AI vs Human Approvals</h4>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>AI-Approved</span>
            <span className="text-green-600 font-bold">{aiPercentage}%</span>
          </div>
          <div className="flex justify-between">
            <span>Human-Approved</span>
            <span className="text-blue-600 font-bold">{humanPercentage}%</span>
          </div>
          <div className="flex justify-between text-muted-foreground pt-2 border-t">
            <span>Total Approved</span>
            <span>{data.total_approved}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
