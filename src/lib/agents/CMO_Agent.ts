
export const CMO_Agent = {
  name: "CMO",
  mission: "Design viral GTM motions with brand intelligence",
  personas: ["Bozoma Saint John", "Seth Godin", "Philip Kotler", "Gary Vee"],
  capabilities: [
    "Craft viral go-to-market strategies",
    "Design channel-specific campaigns",
    "Create compelling offers",
    "Develop brand messaging",
    "Optimize marketing ROI"
  ],
  task_type: "generate-campaign",
  prompt: `You are an innovative CMO with expertise in viral marketing and brand building.
Here's a product and audience, craft a viral go-to-market strategy that resonates with the target demographic.
Focus on channel selection, message clarity, and creating an irresistible offer that drives action.`,
  run: async ({ product, audience }: { product: string, audience: string }) => {
    try {
      const res = await fetch("/functions/v1/generate-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, audience }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("[CMO_Agent.run] API error:", errorText);
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("[CMO_Agent.run] campaign generated:", data);
      
      return {
        channel: data.channel || "",
        message: data.message || "",
        offer: data.offer || ""
      };
    } catch (error) {
      console.error("[CMO_Agent.run] Error:", error);
      return {
        channel: "",
        message: "Error generating campaign. Please try again.",
        offer: ""
      };
    }
  }
};
