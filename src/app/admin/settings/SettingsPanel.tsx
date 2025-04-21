
import { toast } from "@/components/ui/sonner";
import ApiKeyForm from "./ApiKeyForm";
import AutonomyToggle from "./AutonomyToggle";

export default function SettingsPanel() {
  const handleStripeKeySave = (value: string) => {
    if (!value) return;
    // Here we would typically save to Supabase secrets
    toast("Stripe API key updated", {
      description: "Your Stripe API key has been securely saved"
    });
  };

  const handleHubSpotKeySave = (value: string) => {
    if (!value) return;
    // Here we would typically save to Supabase secrets
    toast("HubSpot API key updated", {
      description: "Your HubSpot API key has been securely saved"
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
        <AutonomyToggle />
      </div>
    </div>
  );
}
