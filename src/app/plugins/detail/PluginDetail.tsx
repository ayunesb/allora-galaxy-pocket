
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlugins } from "@/hooks/usePlugins";
import { toast } from "sonner";
import PluginConfigEditor from "@/app/admin/plugins/PluginConfigEditor";
import { Plugin } from "@/types/plugin";
import { usePluginLogger } from "@/lib/plugins/logPluginUsage";
import { useEffect } from "react";

const pluginDocs = {
  stripe: {
    label: "Stripe",
    description: "Integrate payments and subscription billing",
    fields: {
      apiKey: "",
      webhookSecret: ""
    },
    setup: [
      "Create a Stripe account",
      "Get your API keys from the Stripe Dashboard",
      "Configure webhook endpoints"
    ]
  },
  hubspot: {
    label: "HubSpot",
    description: "Sync contacts and manage leads",
    fields: {
      apiKey: ""
    },
    setup: [
      "Get your HubSpot API key",
      "Configure contact properties",
      "Set up deal pipelines"
    ]
  },
  shopify: {
    label: "Shopify",
    description: "Sync products and orders",
    fields: {
      shopDomain: "",
      accessToken: ""
    },
    setup: [
      "Create a Shopify partner account",
      "Create a custom app",
      "Configure app scopes"
    ]
  },
  ga4: {
    label: "Google Analytics",
    description: "Track user behavior and conversions",
    fields: {
      measurementId: "",
      apiSecret: ""
    },
    setup: [
      "Set up a GA4 property",
      "Create a data stream",
      "Get your measurement ID"
    ]
  },
  twilio: {
    label: "Twilio",
    description: "Send SMS and make voice calls",
    fields: {
      accountSid: "",
      authToken: ""
    },
    setup: [
      "Create a Twilio account",
      "Get your account credentials",
      "Set up a phone number"
    ]
  }
};

export default function PluginDetail() {
  const { pluginKey } = useParams();
  const { activePlugins } = usePlugins();
  const { logUsage } = usePluginLogger();
  
  // Ensure pluginKey is a valid key for our plugin system
  const isValidPluginKey = (key: string | undefined): key is Plugin['key'] => {
    return !!key && ['stripe', 'hubspot', 'shopify', 'ga4', 'twilio'].includes(key);
  };

  // Log page view when component mounts
  useEffect(() => {
    if (isValidPluginKey(pluginKey)) {
      logUsage(pluginKey, 'viewed_details', 'plugin_detail');
    }
  }, [pluginKey]);

  if (!isValidPluginKey(pluginKey)) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-muted-foreground">Invalid or unsupported plugin</p>
      </div>
    );
  }
  
  const plugin = pluginDocs[pluginKey];
  
  if (!plugin) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-muted-foreground">Plugin not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">{plugin.label}</h1>
        <p className="text-muted-foreground">{plugin.description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-4 space-y-2">
            {plugin.setup.map((step, index) => (
              <li key={index} className="text-muted-foreground">{step}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {activePlugins.includes(pluginKey) && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <PluginConfigEditor
              pluginKey={pluginKey}
              currentConfig={plugin.fields}
              onSave={async (key, config) => {
                try {
                  // Use type guard to ensure key is a valid Plugin['key']
                  if (isValidPluginKey(key)) {
                    await logUsage(key, 'configured', 'plugin_detail');
                    toast.success("Plugin configuration saved");
                  }
                } catch (error) {
                  toast.error("Failed to save configuration");
                }
              }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
