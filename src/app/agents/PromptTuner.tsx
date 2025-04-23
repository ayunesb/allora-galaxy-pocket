
import React, { useState } from "react";
import { CEO_Agent } from "@/lib/agents/CEO_Agent";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export default function PromptTuner() {
  const [preview, setPreview] = useState("");
  const [inputs, setInputs] = useState({ profile: "", market: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  return (
    <div className="max-w-xl p-6">
      <h2 className="font-bold text-lg mb-3">Prompt Tuner Test Mode</h2>
      <div className="flex flex-col gap-2">
        <div className="space-y-1">
          <Label htmlFor="profile">Founder Profile</Label>
          <Input
            id="profile"
            placeholder="Founder profile"
            value={inputs.profile}
            className="w-full mb-1"
            onChange={(e) => setInputs({ ...inputs, profile: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="market">Target Market</Label>
          <Input
            id="market"
            placeholder="Target market"
            value={inputs.market}
            className="w-full mb-2"
            onChange={(e) => setInputs({ ...inputs, market: e.target.value })}
          />
        </div>
        <Button
          onClick={async () => {
            setLoading(true);
            setPreview("");
            try {
              const res = await CEO_Agent.run({
                founderProfile: inputs.profile,
                market: inputs.market,
                notifySlack: true,
                notifyEmail: !!user?.email,
                userEmail: user?.email || undefined,
                kpiInsert: true,
              });
              setPreview(res.strategy);
            } catch (err: any) {
              setPreview("Error: " + (err?.message || "Unknown error"));
              toast({
                title: "Error",
                description: err?.message || "Failed to run CEO_Agent",
                variant: "destructive"
              });
            }
            setLoading(false);
          }}
          className="bg-primary text-white px-3 py-1 rounded text-sm"
          disabled={loading || !inputs.profile || !inputs.market}
        >
          {loading ? "Generating..." : "🧪 Test CEO Agent"}
        </Button>
        {preview && (
          <pre className="text-xs mt-2 bg-muted p-2 rounded whitespace-pre-wrap">
            {preview}
          </pre>
        )}
      </div>
    </div>
  );
}
