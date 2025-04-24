
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Package, Filter, Star } from "lucide-react";
import { usePlugins } from "@/hooks/usePlugins";
import { usePluginManager } from "@/hooks/usePluginManager";
import { Plugin } from "@/types/plugin";
import { useIsMobile } from "@/hooks/use-mobile";
import { PluginCard } from "./PluginCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { pluginList } from "@/lib/plugins/pluginList";

// Additional plugins for marketplace demo
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
  },
  { 
    id: "6",
    key: "openai", 
    name: "OpenAI", 
    description: "Advanced AI capabilities with GPT models",
    category: "ai",
    tags: ["ai", "gpt", "machine-learning"],
    version: "2.1.0",
    icon: "🤖"
  },
  { 
    id: "7",
    key: "slack", 
    name: "Slack", 
    description: "Team communication and notifications",
    category: "communications",
    tags: ["team", "chat", "notifications"],
    version: "1.2.0",
    icon: "💬"
  },
  { 
    id: "8",
    key: "zapier", 
    name: "Zapier", 
    description: "Connect with thousands of apps and automate workflows",
    category: "automation",
    tags: ["automation", "integration", "workflow"],
    version: "1.0.0",
    icon: "⚡"
  }
];

export default function PluginMarketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPlugins, setFilteredPlugins] = useState<Plugin[]>(availablePlugins);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState<"popular" | "newest" | "name">("popular");
  const { activePlugins } = usePlugins();
  const { installPlugin, uninstallPlugin, isInstalling } = usePluginManager();
  const isMobile = useIsMobile();
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { id: "all", label: "All" },
    { id: "billing", label: "Billing" },
    { id: "crm", label: "CRM" },
    { id: "ecommerce", label: "E-commerce" },
    { id: "analytics", label: "Analytics" },
    { id: "communications", label: "Communications" },
    { id: "ai", label: "AI" },
    { id: "automation", label: "Automation" }
  ];

  useEffect(() => {
    let results = availablePlugins;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(plugin => 
        plugin.name.toLowerCase().includes(query) || 
        plugin.description.toLowerCase().includes(query) ||
        plugin.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Filter by category
    if (activeCategory !== "all") {
      results = results.filter(plugin => plugin.category === activeCategory);
    }
    
    // Sort results
    switch (sortOrder) {
      case "newest":
        // Simulating sorting by newest with random ordering since we don't have actual timestamps
        results = [...results].sort(() => Math.random() - 0.5);
        break;
      case "name":
        results = [...results].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "popular":
      default:
        // This could be based on installations or ratings in a real app
        // For now, we'll just use the original order as "popularity"
        break;
    }
    
    setFilteredPlugins(results);
  }, [searchQuery, activeCategory, sortOrder]);

  const handlePluginAction = async (plugin: Plugin) => {
    const isActive = activePlugins.includes(plugin.key);
    
    if (isActive) {
      await uninstallPlugin(plugin.key);
    } else {
      await installPlugin(plugin.key);
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 lg:px-8 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Plugin Marketplace</h1>
          <p className="text-muted-foreground">Discover and install plugins to enhance your workspace</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search plugins..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {isMobile && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <Filter className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Mobile Filters */}
        {isMobile && showFilters && (
          <Card className="p-4 w-full md:hidden space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Badge 
                    key={category.id} 
                    variant={activeCategory === category.id ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setActiveCategory(category.id)}
                  >
                    {category.label}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Sort By</h3>
              <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        )}

        {/* Desktop Categories Tabs */}
        <div className={`hidden md:block ${isMobile ? 'w-full' : 'w-auto'}`}>
          <Tabs 
            orientation={isMobile ? "horizontal" : "vertical"} 
            defaultValue="all" 
            value={activeCategory} 
            onValueChange={setActiveCategory}
            className="w-full md:w-48"
          >
            <TabsList className="md:flex md:flex-col h-auto md:h-auto md:justify-start md:mb-0 mb-4">
              {categories.map(category => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="md:justify-start md:w-full"
                >
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex-1">
          {/* Desktop Sort Controls */}
          <div className="hidden md:flex justify-between items-center mb-4">
            <div>
              <span className="text-sm text-muted-foreground">
                {filteredPlugins.length} plugin{filteredPlugins.length !== 1 ? 's' : ''} found
              </span>
            </div>
            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    <span>Most Popular</span>
                  </div>
                </SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Plugin Cards Grid */}
          {filteredPlugins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No plugins found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
              <Button variant="outline" className="mt-4" onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlugins.map(plugin => (
                <PluginCard
                  key={plugin.key}
                  plugin={plugin}
                  isActive={activePlugins.includes(plugin.key)}
                  onAction={handlePluginAction}
                  isLoading={isInstalling}
                  showDetails={() => setSelectedPlugin(plugin)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Plugin Details Dialog */}
      <Dialog open={!!selectedPlugin} onOpenChange={(open) => !open && setSelectedPlugin(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedPlugin && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-xl">{selectedPlugin.icon || '🔌'}</span>
                  {selectedPlugin.name}
                </DialogTitle>
                <DialogDescription>{selectedPlugin.description}</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {selectedPlugin.tags?.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Version</p>
                    <p>{selectedPlugin.version || "1.0.0"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="capitalize">{selectedPlugin.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Author</p>
                    <p>{selectedPlugin.author || "Allora Team"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                      <span className="ml-1">4.8 (24 reviews)</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Usage</h3>
                  <p className="text-sm text-muted-foreground">
                    Once installed, this plugin will be available in your workspace. You can configure 
                    it through the Plugin Settings page.
                  </p>
                </div>
                
                <div className="pt-4 border-t flex justify-end">
                  <Button
                    onClick={() => {
                      handlePluginAction(selectedPlugin);
                      setSelectedPlugin(null);
                    }}
                    disabled={isInstalling}
                  >
                    {activePlugins.includes(selectedPlugin.key) ? "Disable Plugin" : "Install Plugin"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
