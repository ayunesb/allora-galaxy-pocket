
export const InvestorPitchAgent = {
  name: "InvestorPitch",
  mission: "Generates compelling investor pitches and deck content",
  personas: ["Paul Graham", "Marc Andreessen", "Arlan Hamilton", "Kevin O'Leary"],
  capabilities: [
    "Craft memorable pitch hooks",
    "Structure investor presentations",
    "Identify key metrics for investors",
    "Create persuasive funding asks",
    "Anticipate investor questions"
  ],
  task_type: "generate-investor-pitch",
  prompt: `You are an experienced pitch coach who specializes in helping startups secure funding.
Based on the provided product description, traction metrics, and team background,
create a compelling investor pitch outline. Include a strong hook, clear problem statement,
unique solution positioning, and convincing market opportunity. Structure your response
to highlight the team's strengths and outline a reasonable funding ask with use of funds.`,
  run: async ({ product, traction, team }: { product: string, traction: string, team: string }) => {
    try {
      const res = await fetch("/functions/v1/generate-investor-pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, traction, team }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("[InvestorPitchAgent.run] API error:", errorText);
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("[InvestorPitchAgent.run] pitch generated:", data);
      
      return {
        pitch: data.pitch || "",
        slides: data.slides || [],
        keyMetrics: data.keyMetrics || []
      };
    } catch (error) {
      console.error("[InvestorPitchAgent.run] Error:", error);
      return {
        pitch: "Error generating investor pitch. Please try again.",
        slides: [],
        keyMetrics: []
      };
    }
  }
};
