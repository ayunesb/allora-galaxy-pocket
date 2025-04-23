import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AgentStat } from "./hooks/useAgentStats";

interface AgentPerformanceChartProps {
  stats: AgentStat[];
}

export function AgentPerformanceChart({ stats }: AgentPerformanceChartProps) {
  // Compute win rate data by prompt_version if stats are present
  const winRateData = stats.map((stat) => ({
    version: stat.prompt_version,
    total: stat.total,
    success: stat.success,
    success_rate: stat.total > 0 ? stat.success / stat.total : 0
  })).filter((row) => row.version !== undefined);

  return (
    <div className="mb-6">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={winRateData}>
          <XAxis dataKey="version" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="success_rate" stroke="#3b82f6" name="Win Rate" dot={false} />
          <Line type="monotone" dataKey="total" stroke="#999" name="Runs" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
