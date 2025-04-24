
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePlugins } from "@/hooks/usePlugins";
import { Plugin } from "@/types/plugin";

// Define plugins with proper typing
const plugins: Array<{
  key: Plugin['key'];
  label: string;
  description: string;
  tags: string[];
}> = [
  { 
    key: "stripe", 
    label: "Stripe", 
    description: "Billing, plans, and usage tracking", 
    tags: ["billing", "analytics"] 
  },
  { 
    key: "hubspot", 
    label: "HubSpot", 
    description: "CRM sync and lead management", 
    tags: ["crm", "leads"] 
  },
  { 
    key: "shopify", 
    label: "Shopify", 
    description: "Product and order synchronization", 
    tags: ["ecommerce"] 
  },
  { 
    key: "ga4", 
    label: "Google Analytics", 
    description: "Traffic and conversion tracking", 
    tags: ["analytics"] 
  },
  { 
    key: "twilio", 
    label: "Twilio", 
    description: "SMS and voice automation", 
    tags: ["communication"] 
  }
];

export default function PluginGallery() {
  const navigate = useNavigate();
  const { activePlugins } = usePlugins();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">🧩 Plugin Marketplace</h2>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {plugins.map((plugin) => (
          <Card key={plugin.key}>
            <CardHeader>
              <CardTitle className="text-lg">{plugin.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {plugin.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {plugin.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex justify-end">
                <Button 
                  variant="secondary"
                  onClick={() => navigate(`/admin/plugins/${plugin.key}`)}
                >
                  {activePlugins.includes(plugin.key) ? 'Configure' : 'Learn More'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
