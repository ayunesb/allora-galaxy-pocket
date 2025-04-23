import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { useState } from "react";
import { PromptPerformanceStats } from "../components/PromptPerformanceStats";

interface AgentSummaryCardProps {
  agent: string;
  agentData: { xp: number; success: number; failed: number }[];
  adjustAgentXP: (agent: string, delta: number) => void;
  rateAgentTask: (agent: string, rating: number) => void;
  submitPromptFeedback: (agent: string, feedback: string) => void;
}

export function AgentSummaryCard({
  agent,
  agentData,
  adjustAgentXP,
  rateAgentTask,
  submitPromptFeedback,
}: AgentSummaryCardProps) {
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

  const [textarea, setTextarea] = useState("");

  return (
    <div className="border p-4 rounded-xl bg-background shadow space-y-2">
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

      <div className="mt-4">
        <PromptPerformanceStats agentName={agent} />
      </div>

      <Textarea
        placeholder={`Feedback to improve ${agent}'s prompt`}
        className="mt-2"
        value={textarea}
        onChange={e => setTextarea(e.target.value)}
        onBlur={() => {
          submitPromptFeedback(agent, textarea);
          setTextarea("");
        }}
      />
    </div>
  );
}
