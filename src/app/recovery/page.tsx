
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";

type RecoveryStrategy = {
  id: string;
  tenant_id: string;
  alert_id: string;
  strategy_title: string;
  summary: string;
  actions: { step: string; tool: string }[];
  assigned_agent?: string;
  status: string;
  created_at: string;
  executed_at?: string;
  feedback_notes?: string;
  learned?: boolean;
};

export default function RecoveryDashboard() {
  const { tenant } = useTenant();
  const [strategies, setStrategies] = useState<RecoveryStrategy[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tenant?.id) return;
    setLoading(true);
    supabase
      .from("recovery_strategies")
      .select("*")
      .eq("tenant_id", tenant.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) {
          console.error(error);
          setStrategies([]);
        } else {
          setStrategies((data as RecoveryStrategy[]) || []);
        }
        setLoading(false);
      });
  }, [tenant?.id]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">🛠️ AI Recovery Strategies</h1>
      {loading ? (
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      ) : strategies.length === 0 ? (
        <div className="text-muted-foreground py-8 text-center">
          No recovery strategies yet.
        </div>
      ) : (
        strategies.map((s) => (
          <div key={s.id} className="border p-4 rounded mb-4 bg-white shadow">
            <h2 className="font-semibold text-lg">{s.strategy_title}</h2>
            <p className="text-sm text-muted-foreground mb-2">{s.summary}</p>
            <ul className="list-disc ml-5 mb-2">
              {s.actions?.map((a, i) =>
                a ? (
                  <li key={i}>
                    {a.step}{" "}
                    <span className="italic text-xs text-emerald-700">
                      (via {a.tool})
                    </span>
                  </li>
                ) : null
              )}
            </ul>
            <div className="text-sm">
              <span>
                Assigned Agent:
                <span className="ml-2 font-semibold">{s.assigned_agent || "—"}</span>
              </span>
            </div>
            <div className="text-sm mt-1">
              Status:{" "}
              <strong
                className={
                  s.status === "resolved"
                    ? "text-green-600"
                    : s.status === "failed"
                    ? "text-red-600"
                    : "text-yellow-600"
                }
              >
                {s.status}
              </strong>
            </div>
            {typeof s.learned === "boolean" && (
              <div className="text-xs mt-2">
                🧠 Learned: <span className={s.learned ? "text-emerald-700 font-semibold" : ""}>{s.learned ? "Yes" : "No"}</span>
              </div>
            )}
            {s.feedback_notes && (
              <div className="text-xs mt-2 text-gray-500">
                <strong>Feedback:</strong> {s.feedback_notes}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-2">
              Created: {new Date(s.created_at).toLocaleString()}
              {s.executed_at && (
                <>
                  {" | "}Executed: {new Date(s.executed_at).toLocaleString()}
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
