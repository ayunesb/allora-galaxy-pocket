
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Package, Settings } from "lucide-react";
import { usePlugins } from "@/hooks/usePlugins";
import { usePluginManager } from "@/hooks/usePluginManager";
import { Plugin } from "@/types/plugin";

// Plugin metadata for rendering
const pluginMetadata: Record<Plugin['key'], { icon: string; description: string }> = {
  'stripe': { 
    icon: '💳',
    description: 'Payment processing, billing and subscription management'
  },
  'hubspot': { 
    icon: '📊',
    description: 'CRM integration for contact and lead management'
  },
  'shopify': { 
    icon: '🛍️',
    description: 'E-commerce platform integration for product and order management'
  },
  'ga4': { 
    icon: '📈',
    description: 'Web analytics and reporting integration'
  },
  'twilio': { 
    icon: '📱',
    description: 'SMS and voice communication integration'
  },
  'openai': {
    icon: '🤖',
    description: 'Advanced AI capabilities with GPT models'
  },
  'slack': {
    icon: '💬',
    description: 'Team communication and notifications'
  },
  'zapier': {
    icon: '⚡',
    description: 'Connect with thousands of apps and automate workflows'
  }
};

export default function MyPluginsPage() {
  const navigate = useNavigate();
  const { activePlugins, isLoading } = usePlugins();
  const { installPlugin, uninstallPlugin } = usePluginManager();

  const togglePlugin = async (pluginKey: Plugin['key'], isEnabled: boolean) => {
    if (isEnabled) {
      await uninstallPlugin(pluginKey);
    } else {
      await installPlugin(pluginKey);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Plugins</h1>
          <p className="text-muted-foreground">Manage your installed plugins</p>
        </div>
        <Button onClick={() => navigate("/plugins/marketplace")}>
          <Package className="mr-2 h-4 w-4" />
          Browse Marketplace
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : activePlugins.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No plugins installed</h3>
            <p className="text-muted-foreground mb-4">Get started by installing plugins from the marketplace</p>
            <Button onClick={() => navigate("/plugins/marketplace")}>
              Browse Marketplace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activePlugins.map(pluginKey => {
            const metadata = pluginMetadata[pluginKey as Plugin['key']] || { 
              icon: '🔌', 
              description: 'Plugin functionality' 
            };
            
            return (
              <Card key={pluginKey} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{metadata.icon}</span>
                      <CardTitle>{pluginKey}</CardTitle>
                    </div>
                    <Switch 
                      checked={true} 
                      onCheckedChange={checked => togglePlugin(pluginKey as Plugin['key'], checked)}
                    />
                  </div>
                  <CardDescription className="mt-2">
                    {metadata.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-end">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/plugins/config/${pluginKey}`)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Configure
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
