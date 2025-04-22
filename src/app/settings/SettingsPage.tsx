
import { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import ThemeCustomizer from "@/components/settings/ThemeCustomizer";
import ApiKeyForm from "@/app/admin/settings/ApiKeyForm";
import AutonomyToggle from "@/app/admin/settings/AutonomyToggle";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account");
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

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="max-w-4xl"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-lg font-semibold">Account Settings</h2>
              <p className="text-sm text-muted-foreground">
                Manage your account settings and preferences
              </p>
              
              {/* Account settings would go here */}
              <div className="text-sm text-muted-foreground">
                This section will contain account management options, profile information, and subscription details.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ThemeCustomizer />
          </div>
        </TabsContent>
        
        <TabsContent value="integrations">
          <div className="space-y-6">
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
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Connected Services</h2>
                <p className="text-sm text-muted-foreground">
                  Manage connections to third-party services and APIs
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="advanced">
          <div className="space-y-6">
            <AutonomyToggle />
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Data Management</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Export or delete your account data
                </p>
                <div className="flex gap-4">
                  <button className="text-sm underline text-primary">Export Data</button>
                  <button className="text-sm underline text-destructive">Delete Account</button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
