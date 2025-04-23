
import { supabase } from "@/integrations/supabase/client";
// Slack and Email notification logic is included in the run method (as options)

export const CEO_Agent = {
  /**
   * Runs the CEO agent with the specified founder profile and market.
   * Accepts options to notify via Slack or email, and pass in user info for email.
   */
  run: async (
    {
      founderProfile,
      market,
      notifySlack,
      notifyEmail,
      userEmail,
      kpiInsert,
    }: {
      founderProfile: string;
      market: string;
      notifySlack?: boolean;
      notifyEmail?: boolean;
      userEmail?: string;
      kpiInsert?: boolean;
    }
  ) => {
    // Call Supabase Edge Function to run OpenAI prompt
    const res = await fetch("/functions/v1/ceo-strategy", {
      method: "POST",
      body: JSON.stringify({ founderProfile, market })
    });

    if (!res.ok) throw new Error("Failed to run CEO_Agent");
    const data = await res.json();
    const strategy: string = data.strategy;

    // Slack notification (optional)
    if (notifySlack && typeof strategy === "string") {
      try {
        // Use the built-in webhook alert hook/edge function
        await supabase.functions.invoke("send-webhook-alert", {
          body: {
            message:
              `📦 New Strategy Created by CEO_Agent\n\n${strategy.slice(0, 400)}...`,
            channel: "slack"
          }
        });
      } catch (err) {
        console.warn("Slack notification failed", err);
      }
    }

    // Email notification (optional)
    if (notifyEmail && userEmail && typeof strategy === "string") {
      try {
        await supabase.functions.invoke("send-email", {
          body: {
            to: userEmail,
            subject: "Your AI Strategy is Ready",
            html: `<pre>${strategy}</pre>`
          }
        });
      } catch (err) {
        console.warn("Email notification failed", err);
      }
    }

    // KPI INSERT (optional, uses "Execution Plan Depth")
    if (kpiInsert && typeof strategy === "string") {
      try {
        await supabase.from("kpi_metrics").insert({
          metric: "Execution Plan Depth",
          value: (strategy.match(/Phase/gi) || []).length,
          period: "generated"
        });
      } catch (err) {
        console.warn("KPI metric insert failed", err);
      }
    }

    return { strategy };
  }
};

