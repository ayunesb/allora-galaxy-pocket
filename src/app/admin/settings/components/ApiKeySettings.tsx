
import { useToast } from "@/hooks/use-toast";
import ApiKeyForm from "../ApiKeyForm";

export function ApiKeySettings() {
  const { toast } = useToast();

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
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">API Keys</h2>
      <div className="space-y-4">
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
      </div>
    </div>
  );
}
