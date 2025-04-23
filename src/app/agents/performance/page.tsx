
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { PromptPerformanceStats } from "../components/PromptPerformanceStats";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export default function AgentPerformancePage() {
  const [stats, setStats] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const { tenant } = useTenant();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<any[]>([]);

  const adjustAgentXP = async (agent: string, delta: number) => {
    if (!tenant?.id) return;

    const { error } = await supabase.from("agent_memory").insert({
      agent_name: agent,
      type: "feedback",
      context: `Manual XP adjustment: ${delta}`,
      xp_delta: delta,
      tenant_id: tenant.id
    });

    if (error) {
      toast({
        title: "XP Adjustment Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "XP Adjusted",
        description: `${agent} received ${delta} XP`
      });
    }
  };

  const rateAgentTask = async (agent: string, rating: number) => {
    if (!tenant?.id) return;

    const { error } = await supabase.from("agent_feedback").insert({
      agent,
      rating,
      type: "task_rating",
      tenant_id: tenant.id
    });

    if (error) {
      toast({
        title: "Rating Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Task Rated",
        description: `${agent} rated ${rating}/5 stars`
      });
    }
  };

  const submitPromptFeedback = async (agent: string, feedback: string) => {
    if (!tenant?.id || !feedback.trim()) return;

    const { error } = await supabase.from("agent_feedback").insert({
      agent,
      type: "prompt_feedback",
      feedback,
      tenant_id: tenant.id
    });

    if (error) {
      toast({
        title: "Prompt Feedback Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Prompt Feedback Submitted",
        description: `Feedback for ${agent} sent successfully`
      });
    }
  };

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

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!tenant?.id) return;
      
      const { data } = await supabase
        .from("agent_alerts")
        .select("*")
        .eq("tenant_id", tenant.id)
        .eq("alert_type", "prompt-switch-recommendation")
        .order("triggered_at", { ascending: false });
        
      if (data) {
        setAlerts(data);
      }
    };
    
    fetchAlerts();
  }, [tenant?.id]);

  const uniqueAgents = [...new Set(stats.map((s) => s.agent))];
  
  // When we have stats but no selected agent, default to the first one
  useEffect(() => {
    if (uniqueAgents.length > 0 && !selectedAgent) {
      setSelectedAgent(uniqueAgents[0]);
    }
  }, [uniqueAgents, selectedAgent]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        <span role="img" aria-label="Performance">📈</span> Agent Performance Dashboard
      </h1>

      {alerts.length > 0 && (
        <div className="mb-6">
          <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
            <AlertTitle>Prompt Version Recommendations</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 space-y-1">
                {alerts.map((alert) => (
                  <li key={alert.id} className="flex items-center justify-between">
                    <span>{alert.message}</span>
                    <a 
                      href={`/agents/versions/compare/${alert.agent}`}
                      className="text-primary hover:underline text-sm"
                    >
                      🔍 Compare Versions
                    </a>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        </div>
      )}

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

      {uniqueAgents.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Agent:</label>
          <select 
            className="w-full max-w-xs border rounded p-2"
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
          >
            {uniqueAgents.map((agent) => (
              <option key={agent} value={agent}>{agent}</option>
            ))}
          </select>
        </div>
      )}

      {selectedAgent && (
        <div className="mb-6">
          <PromptPerformanceStats agentName={selectedAgent} />
        </div>
      )}

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
              className="border p-4 rounded-xl bg-background shadow space-y-2"
            >
              <h2 className="text-xl font-semibold">{agent}</h2>
              <p className="text-sm text-muted-foreground">
                Tasks: {total} • ✅ {success} • ❌ {failed}
              </p>
              <p className="text-sm">
                🏅 {badge} • Health Score: {score}%
              </p>

              <div className="flex gap-2 mt-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => adjustAgentXP(agent, +10)}
                >
                  +10 XP
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => adjustAgentXP(agent, -5)}
                >
                  -5 XP
                </Button>
              </div>

              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs mr-2">Rate Tasks:</span>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant="ghost"
                    size="sm"
                    className="p-0 hover:bg-transparent"
                    onClick={() => rateAgentTask(agent, rating)}
                  >
                    <span className="text-xl">⭐</span>
                  </Button>
                ))}
              </div>

              <Textarea
                placeholder={`Feedback to improve ${agent}'s prompt`}
                className="mt-2"
                onBlur={(e) => submitPromptFeedback(agent, e.target.value)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
