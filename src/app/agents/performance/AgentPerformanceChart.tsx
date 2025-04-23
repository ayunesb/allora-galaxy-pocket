
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import type { AgentStat } from "./hooks/useAgentStats";

interface AgentPerformanceChartProps {
  stats: AgentStat[];
}

export function AgentPerformanceChart({ stats }: AgentPerformanceChartProps) {
  return (
    <div className="mb-6">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={stats}>
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="xp" stroke="#3b82f6" name="Tasks Run" />
          <Line type="monotone" dataKey="success" stroke="#10b981" name="Successes" />
          <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Failures" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
