import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTenant } from "@/hooks/useTenant";
import { useAutoApproval } from "@/hooks/useAutoApproval";
import ApiKeyForm from "./ApiKeyForm";
import AutonomyToggle from "./AutonomyToggle";

export default function SettingsPanel() {
  const { toast } = useToast();
  const { tenant } = useTenant();
  const { toggleAutoApproval } = useAutoApproval();

  const handleStripeKeySave = (value: string) => {
    if (!value) return;
    toast({
      title: "Stripe API Updated",
      description: "Your Stripe API key has been securely saved"
    });
  };

  const handleHubSpotKeySave = (value: string) => {
    if (!value) return;
    toast({
      title: "HubSpot API Updated",
      description: "Your HubSpot API key has been securely saved"
    });
  };

  const handleZoomKeySave = (value: string) => {
    if (!value) return;
    toast({
      title: "Zoom API Updated",
      description: "Your Zoom API key has been securely saved"
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Admin Settings</h1>
      
      <div className="max-w-2xl space-y-6">
        <div className="flex flex-col space-y-2 border p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-approve" className="text-sm font-medium">Auto-Approve Strategies</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Allow AI to automatically approve strategies that meet performance thresholds
              </p>
            </div>
            <Switch 
              id="auto-approve"
              checked={tenant?.enable_auto_approve ?? true}
              onCheckedChange={(checked) => {
                if (tenant?.id) {
                  toggleAutoApproval(checked);
                }
              }}
            />
          </div>
        </div>

        <ApiKeyForm
          label="Stripe API Key"
          placeholder="sk_test_..."
          onSave={handleStripeKeySave}
        />
        <ApiKeyForm
          label="HubSpot API Key"
          placeholder="pat_eu1_..."
          onSave={handleHubSpotKeySave}
        />
        <ApiKeyForm
          label="Zoom API Key"
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ..."
          onSave={handleZoomKeySave}
        />
        <AutonomyToggle />
      </div>
    </div>
  );
}
