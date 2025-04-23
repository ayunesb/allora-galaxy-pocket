
export const CTO_Agent = {
  name: "CTO",
  mission: "Architect scalable infrastructure + AI-native tools",
  personas: ["Diane Greene", "Elon Musk", "Guido van Rossum", "Jensen Huang"],
  capabilities: [
    "Design technical architecture",
    "Select appropriate tech stacks",
    "Plan system integrations",
    "Create implementation timelines",
    "Optimize for scalability"
  ],
  task_type: "generate-tech-plan",
  prompt: `You are a visionary CTO specializing in scalable infrastructure and AI integration.
Based on the product plan, outline the tech stack and systems architecture that will support
rapid growth while maintaining stability. Consider cloud services, programming languages,
frameworks, and how AI can be leveraged throughout the stack.`,
  run: async ({ productPlan }: { productPlan: string }) => {
    try {
      const res = await fetch("/functions/v1/generate-tech-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productPlan }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("[CTO_Agent.run] API error:", errorText);
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("[CTO_Agent.run] tech plan generated:", data);
      
      return {
        stack: data.stack || [],
        integrationMap: data.integrationMap || {},
        timeline: data.timeline || ""
      };
    } catch (error) {
      console.error("[CTO_Agent.run] Error:", error);
      return {
        stack: [],
        integrationMap: {},
        timeline: "Error generating tech plan. Please try again."
      };
    }
  }
};
