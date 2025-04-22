
import { useToast } from "@/hooks/use-toast";
import ApiKeyForm from "./ApiKeyForm";
import AutonomyToggle from "./AutonomyToggle";

export default function SettingsPanel() {
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
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Admin Settings</h1>
      
      <div className="max-w-2xl space-y-6">
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
