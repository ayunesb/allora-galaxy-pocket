
import { useState } from "react";
import { useTenant } from "@/hooks/useTenant";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Plugin } from "@/types/plugin";

const allPlugins: Plugin[] = [
  { key: "stripe", label: "Stripe", description: "Billing, plans, usage" },
  { key: "hubspot", label: "HubSpot", description: "CRM & contacts sync" },
  { key: "shopify", label: "Shopify", description: "Product + order sync" },
  { key: "ga4", label: "Google Analytics", description: "Traffic & funnel data" },
  { key: "twilio", label: "Twilio", description: "SMS & voice actions" }
];

export default function PluginsDashboard() {
  const { tenant } = useTenant();
  const [enabled, setEnabled] = useState<Plugin['key'][]>(["stripe", "ga4"]);

  const toggle = (key: Plugin['key']) => {
    setEnabled((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">
        🧩 Plugins for {tenant?.name || 'Loading...'}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allPlugins.map((plugin) => (
          <Card key={plugin.key}>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center text-lg">
                <span>{plugin.label}</span>
                <Switch
                  checked={enabled.includes(plugin.key)}
                  onCheckedChange={() => toggle(plugin.key)}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{plugin.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
