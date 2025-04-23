
// AUTO-GENERATED AGENT: EmailCoach
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
  run: async (payload) => {
    return {
      subject: "",
      improvedBody: "",
      reasoning: ""
    };
  }
};
