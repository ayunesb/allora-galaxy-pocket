
import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";
import { useSystemLogs } from "@/hooks/useSystemLogs";

export default function WorkspaceEnvironmentPage() {
  const { tenant, updateTenantProfile } = useTenant();
  const { logActivity } = useSystemLogs();
  const [isLoading, setIsLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(tenant?.slack_webhook_url || "");
  const [autoApprove, setAutoApprove] = useState(tenant?.enable_auto_approve || false);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await updateTenantProfile({
        slack_webhook_url: webhookUrl,
        enable_auto_approve: autoApprove
      });

      await logActivity(
        "WORKSPACE_UPDATED",
        "Environment settings updated",
        {
          has_slack: !!webhookUrl,
          auto_approve: autoApprove
        },
        "info"
      );
      
      toast.success("Environment settings saved");
    } catch (error) {
      console.error("Error saving environment settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Environment Settings</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Integration Webhooks</CardTitle>
          <CardDescription>
            Connect your workspace to external services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
            <Input
              id="slack-webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://hooks.slack.com/services/..."
            />
            <p className="text-sm text-muted-foreground">
              Receive notifications in your Slack workspace
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>AI Automation</CardTitle>
          <CardDescription>
            Configure how AI works in your workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-approve">Auto-Approve Strategies</Label>
              <p className="text-sm text-muted-foreground">
                Allow AI to automatically approve strategies that meet quality thresholds
              </p>
            </div>
            <Switch
              id="auto-approve"
              checked={autoApprove}
              onCheckedChange={setAutoApprove}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Environment Settings"}
        </Button>
      </div>
    </div>
  );
}
