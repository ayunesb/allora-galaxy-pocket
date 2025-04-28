
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import FeedbackChart from "./FeedbackChart";

type FeedbackData = {
  strategy_title: string;
  action: "used" | "dismissed";
  created_at: string;
}

type GroupedFeedback = {
  [key: string]: {
    used: number;
    dismissed: number;
  }
}

export default function InsightsPanel() {
  const [logs, setLogs] = useState<FeedbackData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { tenant } = useTenant();

  useEffect(() => {
    async function fetchFeedback() {
      const { data, error } = await supabase
        .from('strategy_feedback')
        .select('strategy_title, action, created_at')
        .eq('tenant_id', tenant?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching feedback:', error);
        return;
      }

      // Ensure the data matches the FeedbackData type
      const typedData = (data || []).map(item => ({
        ...item,
        action: item.action as "used" | "dismissed"
      })) as FeedbackData[];
      
      setLogs(typedData);
      setIsLoading(false);
    }

    fetchFeedback();
  }, [tenant?.id]);

  const grouped: GroupedFeedback = logs.reduce((acc, curr) => {
    if (!acc[curr.strategy_title]) {
      acc[curr.strategy_title] = { used: 0, dismissed: 0 };
    }
    acc[curr.strategy_title][curr.action as 'used' | 'dismissed']++;
    return acc;
  }, {} as GroupedFeedback);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold">📊 Strategy Feedback Insights</h2>
        <div className="animate-pulse space-y-3">
          <div className="bg-gray-100 h-[400px] rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold">📊 Strategy Feedback Insights</h2>
      {logs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No feedback data available yet
        </div>
      ) : (
        <>
          <FeedbackChart grouped={grouped} />
          <div className="space-y-3">
            {Object.entries(grouped).map(([title, data]) => (
              <div key={title} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <div className="mt-2 flex gap-4">
                  <p className="text-sm text-emerald-600">
                    <span className="inline-block w-5">✅</span> 
                    Used: {data.used}
                  </p>
                  <p className="text-sm text-gray-500">
                    <span className="inline-block w-5">❌</span>
                    Dismissed: {data.dismissed}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
