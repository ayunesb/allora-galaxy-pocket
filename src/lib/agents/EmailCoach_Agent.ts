
export const EmailCoach_Agent = {
  name: "EmailCoach",
  mission: "Improve email open rates, clarity, CTA hierarchy",
  personas: ["Joanna Wiebe", "Sahil Bloom", "Harry Dry", "Ann Handley"],
  capabilities: [
    "Optimize email subject lines",
    "Improve email body copy",
    "Refine call-to-action hierarchy",
    "Enhance message clarity",
    "Increase open and click-through rates"
  ],
  task_type: "improve-email-copy",
  prompt: `You are an email marketing expert who specializes in high-performing copy.
Here's an email — make it tighter, clearer, and higher performing by improving the subject line,
streamlining the body text, clarifying the value proposition, and strengthening the call-to-action.
Provide reasoning for your changes.`,
  run: async ({ emailSubject, emailBody }: { emailSubject: string, emailBody: string }) => {
    try {
      const res = await fetch("/functions/v1/generate-email-optimization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailSubject, emailBody }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("[EmailCoach_Agent.run] API error:", errorText);
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("[EmailCoach_Agent.run] email optimization generated:", data);
      
      return {
        subject: data.subject || "",
        improvedBody: data.improvedBody || "",
        reasoning: data.reasoning || ""
      };
    } catch (error) {
      console.error("[EmailCoach_Agent.run] Error:", error);
      return {
        subject: "",
        improvedBody: "Error optimizing email. Please try again.",
        reasoning: ""
      };
    }
  }
};
