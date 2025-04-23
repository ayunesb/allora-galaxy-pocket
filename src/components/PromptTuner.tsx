
import * as React from "react";
import { CEO_Agent } from "@/lib/agents/CEO_Agent";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function PromptTuner() {
  const [promptInputs, setPromptInputs] = React.useState({
    profile: "",
    market: ""
  });
  const [preview, setPreview] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromptInputs({
      ...promptInputs,
      [e.target.name]: e.target.value
    });
  };

  const handleTest = async () => {
    setLoading(true);
    setPreview("");
    try {
      const result = await CEO_Agent.run({
        founderProfile: promptInputs.profile,
        market: promptInputs.market,
        notifySlack: true, // send Slack webhook
        notifyEmail: !!user?.email, // send email if logged in
        userEmail: user?.email || undefined,
        kpiInsert: true
      });
      setPreview(result.strategy);
      toast({
        title: "Test Complete",
        description: "Strategy generated and notifications sent (if set up)."
      });
    } catch (err: any) {
      setPreview("Error: " + (err?.message || "Unknown error"));
      toast({
        title: "Error",
        description: err?.message || "Failed to run CEO_Agent",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl p-6">
      <h2 className="font-bold text-lg mb-3">Prompt Tuner / CEO_Agent Tester</h2>
      <div className="flex flex-col gap-2">
        <Input
          label="Founder Profile"
          name="profile"
          placeholder="e.g. Ex-Stripe PM building AI CRM"
          value={promptInputs.profile}
          onChange={handleChange}
          className="mb-1"
        />
        <Input
          label="Market"
          name="market"
          placeholder="e.g. B2B SaaS sales teams"
          value={promptInputs.market}
          onChange={handleChange}
          className="mb-2"
        />
        <Button
          onClick={handleTest}
          className="bg-secondary text-white px-3 py-1 rounded"
          disabled={loading || !promptInputs.profile || !promptInputs.market}
        >
          {loading ? "Generating..." : "🧪 Test Prompt"}
        </Button>
      </div>
      {preview && (
        <pre className="bg-muted text-sm mt-4 p-2 rounded whitespace-pre-wrap">
          {preview}
        </pre>
      )}
    </div>
  );
}
