
import React, { useState, useEffect, useRef } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { supabase } from "@/integrations/supabase/client";

// XP badge helper
const getBadge = (xp: number) => {
  if (xp >= 100) return { level: "🧠 Master", animate: true, color: "text-indigo-600" };
  if (xp >= 50) return { level: "🔥 Pro", animate: true, color: "text-orange-500" };
  if (xp >= 20) return { level: "⭐ Skilled", animate: false, color: "text-yellow-500" };
  return { level: "🟢 Rookie", animate: false, color: "text-green-500" };
};

// CSV export utility
const exportToCSV = (data: any[], agentNames: string[], filename = "agent_xp.csv") => {
  const csv = ["Agent,Date,XP,Cumulative"];
  agentNames.forEach(agent => {
    data
      .filter((row) => row.agent === agent)
      .forEach(row => {
        csv.push(`${row.agent},${row.date},${row.xp},${row.cumulative}`);
      });
  });
  const blob = new Blob([csv.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
};

const agentColors = ["#3b82f6", "#10b981", "#8b5cf6", "#ef4444", "#f59e42", "#6ee7b7", "#eab308"]; // Extend as needed

export default function AgentHealthMonitor({
  agentNames,
}: {
  agentNames: string[];
}) {
  const [filter, setFilter] = useState<"7d" | "30d" | "all">("7d");
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [xpByAgent, setXpByAgent] = useState<Record<string, number>>({});
  const [badgeByAgent, setBadgeByAgent] = useState<Record<string, any>>({});
  const previousBadgeLevels = useRef<Record<string, string>>({});

  // For XP milestone animation effect (per agent)
  const [animateAgents, setAnimateAgents] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const results = await Promise.all(
        agentNames.map(async (agent) => {
          const { data, error } = await supabase
            .from("agent_tasks")
            .select("status, executed_at")
            .eq("agent", agent);

          // Defensive empty array fallback
          return { agent, data: data || [] };
        })
      );

      let globalHistory: any[] = [];
      let xpObj: Record<string, number> = {};
      let badgeObj: Record<string, { level: string, animate: boolean, color?: string }> = {};
      let detectAnimate: Record<string, boolean> = {};

      for (const { agent, data } of results) {
        // Filter by date range
        const now = new Date();
        const daysAgo = (n: number) => {
          const d = new Date();
          d.setHours(0, 0, 0, 0);
          d.setDate(d.getDate() - n);
          return d;
        };

        const filtered = data.filter((t) => {
          if (!t.executed_at) return false;
          const executed = new Date(t.executed_at);
          executed.setHours(0, 0, 0, 0);
          if (filter === "7d") return executed >= daysAgo(7);
          if (filter === "30d") return executed >= daysAgo(30);
          return true;
        });

        // Grouped daily XP and cumulative XP
        const grouped = filtered.reduce((acc, task) => {
          const day = new Date(task.executed_at).toLocaleDateString();
          acc[day] = (acc[day] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const dates = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
        let cumulative = 0;
        dates.forEach((date) => {
          cumulative += grouped[date];
          globalHistory.push({
            date,
            agent,
            xp: grouped[date],
            cumulative,
          });
        });

        // Store total xp for this agent (within filter window)
        xpObj[agent] = filtered.length;

        // Badge logic + animation effect trigger
        const badge = getBadge(filtered.length);
        badgeObj[agent] = badge;
        const prev = previousBadgeLevels.current[agent];
        detectAnimate[agent] = badge.animate && (!prev || prev !== badge.level);
        previousBadgeLevels.current[agent] = badge.level;
      }

      setHistoryData(globalHistory);
      setXpByAgent(xpObj);
      setBadgeByAgent(badgeObj);
      setAnimateAgents(detectAnimate);
      setLoading(false);
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentNames, filter]);

  return (
    <div className="border rounded p-4 bg-background shadow space-y-2">
      <h2 className="text-lg font-semibold mb-2">🩺 Agents Health Summary</h2>
      {loading ? (
        <div className="text-muted-foreground text-center py-4">Loading agent metrics...</div>
      ) : agentNames.length === 0 ? (
        <div className="text-muted-foreground text-center py-4">
          No agents available for health monitoring.
        </div>
      ) : (
        <div className="mb-3">
          {/* Agent details */}
          {agentNames.map((agent, i) => {
            const xp = xpByAgent[agent] || 0;
            const badge = badgeByAgent[agent] || getBadge(0);
            return (
              <div key={agent} className="mb-1 flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full mr-2"
                  style={{ backgroundColor: agentColors[i % agentColors.length] }}
                  aria-label={agent}
                />
                <span className="font-semibold">{agent}</span>

                <span className="text-xs text-muted-foreground mx-1">XP: {xp}</span>
                <span className={`ml-1 text-xs font-bold ${badge.color || ""}`}>{badge.level}</span>

                {animateAgents[agent] && badge.animate && (
                  <span className="ml-2 animate-bounce text-green-500 text-xs font-bold">
                    🎉 {agent} just reached {badge.level}!
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Filter buttons */}
      <div className="flex gap-2 mb-4">
        {["7d", "30d", "all"].map((range) => (
          <button
            key={range}
            onClick={() => setFilter(range as "7d" | "30d" | "all")}
            className={`px-2 py-1 rounded text-sm transition-colors ${
              filter === range ? "bg-primary text-white" : "bg-muted text-muted-foreground"
            }`}
            type="button"
          >
            {range.toUpperCase()}
          </button>
        ))}
      </div>

      <h3 className="text-sm font-semibold mt-4 mb-2">📈 XP Over Time</h3>
      <div className="w-full" style={{ minHeight: 300 }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart>
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            {agentNames.map((agent, index) => (
              <Line
                key={agent}
                type="monotone"
                dataKey="cumulative"
                name={agent}
                data={historyData.filter((d) => d.agent === agent)}
                stroke={agentColors[index % agentColors.length]}
                dot={false}
                isAnimationActive={true}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <button
        onClick={() => exportToCSV(historyData, agentNames)}
        className="mt-4 px-4 py-1 bg-secondary text-white rounded hover-scale"
      >
        📤 Export XP to CSV
      </button>
    </div>
  );
}
