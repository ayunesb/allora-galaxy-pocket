
export const Closer_Agent = {
  name: "Closer_Agent",
  mission: "Generate outbound messages and CTAs that convert",
  personas: ["Alex Hormozi", "Steli Efti", "Grant Cardone", "Andy Raskin"],
  capabilities: [
    "Craft compelling sales messages",
    "Design high-converting CTAs",
    "Create irresistible offers",
    "Write persuasive subject lines",
    "Develop outreach sequences"
  ],
  task_type: "generate-outreach",
  prompt: `You are an elite sales closer. Write outbound messages and CTAs that convert.`,
  run: async ({ offer, lead }: { offer: string, lead: string }) => {
    const res = await fetch("/functions/v1/generate-outreach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ offer, lead }),
    });
    const data = await res.json();
    // Log result
    console.log("[Closer_Agent.run] subject:", data.subject);
    return {
      subject: data.subject,
      body: data.body,
    };
  }
};
