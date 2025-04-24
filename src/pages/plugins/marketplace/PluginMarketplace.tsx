import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Search, Download, Activity } from "lucide-react";
import { usePlugins } from "@/hooks/usePlugins";
import { usePluginManager } from "@/hooks/usePluginManager";
import { Plugin } from "@/types/plugin";

// Define available plugins
const availablePlugins: Plugin[] = [
  { 
    id: "1",
    key: "stripe", 
    name: "Stripe", 
    description: "Payment processing, billing and subscription management",
    category: "billing",
    tags: ["payments", "subscriptions", "billing"],
    version: "1.0.0",
    icon: "💳"
  },
  { 
    id: "2",
    key: "hubspot", 
    name: "HubSpot", 
    description: "CRM integration for contact and lead management",
    category: "crm",
    tags: ["crm", "marketing", "contacts"],
    version: "1.0.0",
    icon: "📊"
  },
  { 
    id: "3",
    key: "shopify", 
    name: "Shopify", 
    description: "E-commerce platform integration for product and order management",
    category: "ecommerce",
    tags: ["ecommerce", "products", "orders"],
    version: "1.0.0",
    icon: "🛍️"
  },
  { 
    id: "4",
    key: "ga4", 
    name: "Google Analytics", 
    description: "Web analytics and reporting integration",
    category: "analytics",
    tags: ["analytics", "tracking", "reporting"],
    version: "1.0.0",
    icon: "📈"
  },
  { 
    id: "5",
    key: "twilio", 
    name: "Twilio", 
    description: "SMS and voice communication integration",
    category: "communications",
    tags: ["sms", "notifications", "messaging"],
    version: "1.0.0",
    icon: "📱"
  }
];

export default function PluginMarketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPlugins, setFilteredPlugins] = useState(availablePlugins);
  const [activeCategory, setActiveCategory] = useState("all");
  const { activePlugins } = usePlugins();
  const { installPlugin, uninstallPlugin, isInstalling } = usePluginManager();

  const categories = [
    { id: "all", label: "All" },
    { id: "billing", label: "Billing" },
    { id: "crm", label: "CRM" },
    { id: "ecommerce", label: "E-commerce" },
    { id: "analytics", label: "Analytics" },
    { id: "communications", label: "Communications" },
  ];

  useEffect(() => {
    let results = availablePlugins;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(plugin => 
        plugin.label.toLowerCase().includes(query) || 
        plugin.description.toLowerCase().includes(query) ||
        plugin.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filter by category
    if (activeCategory !== "all") {
      results = results.filter(plugin => plugin.category === activeCategory);
    }
    
    setFilteredPlugins(results);
  }, [searchQuery, activeCategory]);

  const handlePluginAction = async (plugin: Plugin) => {
    const isActive = activePlugins.includes(plugin.key);
    
    if (isActive) {
      await uninstallPlugin(plugin.key);
    } else {
      await installPlugin(plugin.key);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Plugin Marketplace</h1>
          <p className="text-muted-foreground">Discover and install plugins to enhance your workspace</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plugins..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="mb-8">
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-0">
          {filteredPlugins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No plugins found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPlugins.map(plugin => {
                const isActive = activePlugins.includes(plugin.key);
                
                return (
                  <Card key={plugin.key} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{plugin.icon}</span>
                          <CardTitle>{plugin.name}</CardTitle>
                        </div>
                        <Badge variant={isActive ? "default" : "outline"}>
                          {isActive ? "Active" : "Available"}
                        </Badge>
                      </div>
                      <CardDescription className="mt-2">{plugin.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {plugin.tags?.map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">v{plugin.version}</span>
                        <Button 
                          size="sm" 
                          variant={isActive ? "outline" : "default"}
                          onClick={() => handlePluginAction(plugin)}
                          disabled={isInstalling}
                        >
                          {isActive ? (
                            <>Disable</>
                          ) : (
                            <>
                              <Download className="mr-2 h-4 w-4" />
                              Install
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
