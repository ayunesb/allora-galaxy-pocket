
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";

export default function RevenueShareApply() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [form, setForm] = useState({ 
    plugin_id: "", 
    stripe_connect_id: "", 
    payout_percentage: 70 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!user || !tenant) {
      toast.error("User authentication required", {
        description: "Please log in to apply for revenue sharing."
      });
      return;
    }

    if (!form.plugin_id || !form.stripe_connect_id) {
      toast.error("Missing required fields", {
        description: "Please fill out all required fields."
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const { error } = await supabase.from("plugin_creators").insert({
        plugin_id: form.plugin_id,
        user_id: user.id,
        stripe_connect_id: form.stripe_connect_id,
        payout_percentage: form.payout_percentage
      });

      if (error) throw error;

      toast.success("Application submitted", {
        description: "Your revenue sharing application has been submitted successfully!"
      });
      
      // Reset form
      setForm({ 
        plugin_id: "", 
        stripe_connect_id: "", 
        payout_percentage: 70 
      });
    } catch (error) {
      toast.error("Failed to submit application", {
        description: error instanceof Error ? error.message : "An unknown error occurred"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>💸</span>
            <span>Apply for Plugin Revenue Share</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Plugin ID</label>
              <Input
                placeholder="Enter your plugin ID"
                value={form.plugin_id}
                onChange={(e) => setForm(f => ({ ...f, plugin_id: e.target.value }))}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Stripe Connect ID</label>
              <Input
                placeholder="Enter your Stripe Connect ID"
                value={form.stripe_connect_id}
                onChange={(e) => setForm(f => ({ ...f, stripe_connect_id: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                You'll need a Stripe Connect account to receive payments
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Payout Percentage</label>
              <Input
                type="number"
                min={10}
                max={90}
                value={form.payout_percentage}
                onChange={(e) => setForm(f => ({ ...f, payout_percentage: Number(e.target.value) }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Standard rate is 70% to developers, 30% to platform
              </p>
            </div>

            <Button 
              onClick={submit} 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Submitting..." : "Apply for Revenue Sharing"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
