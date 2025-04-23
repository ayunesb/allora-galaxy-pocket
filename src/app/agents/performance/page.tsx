
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AgentPerformancePage() {
  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from("agent_tasks")
        .select("agent, status, executed_at");

      if (!data) {
        setStats([]);
        return;
      }

      const grouped = data.reduce((acc: Record<string, any>, task: any) => {
        const date = new Date(task.executed_at).toLocaleDateString();
        const key = `${task.agent}-${date}`;
        if (!acc[key]) {
          acc[key] = { agent: task.agent, date, xp: 0, success: 0, failed: 0 };
        }
        acc[key].xp += 1;
        if (task.status === "success") acc[key].success += 1;
        if (task.status === "failed") acc[key].failed += 1;
        return acc;
      }, {});
      setStats(Object.values(grouped));
    };

    fetchStats();
  }, []);

  const uniqueAgents = [...new Set(stats.map((s) => s.agent))];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        <span role="img" aria-label="Performance">📈</span> Agent Performance Dashboard
      </h1>

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {uniqueAgents.map((agent) => {
          const agentData = stats.filter((d) => d.agent === agent);
          const total = agentData.reduce((acc, s) => acc + s.xp, 0);
          const success = agentData.reduce((acc, s) => acc + s.success, 0);
          const failed = agentData.reduce((acc, s) => acc + s.failed, 0);
          const score = total > 0 ? Math.round((success / total) * 100) : 0;
          const badge =
            total > 100
              ? "🔥 Pro"
              : total > 50
              ? "⭐ Skilled"
              : "🟢 Rookie";

          return (
            <div
              key={agent}
              className="border p-4 rounded-xl bg-background shadow"
            >
              <h2 className="text-xl font-semibold">{agent}</h2>
              <p className="text-sm text-muted-foreground">
                Tasks: {total} • ✅ {success} • ❌ {failed}
              </p>
              <p className="text-sm">
                🏅 {badge} • Health Score: {score}%
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
