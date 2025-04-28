
import React, { useState } from 'react';
import { usePlugins } from '@/hooks/usePlugins';
import { usePluginManager } from '@/hooks/usePluginManager';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Package, Download, RefreshCw, ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Plugin } from '@/types/plugin';
import { toast } from 'sonner';

// Create a type that matches what the supabase query returns
interface PluginData {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  version?: string;
  author?: string;
  badge?: string;
  category?: string;
  icon_url?: string;
  install_url?: string;
  created_at?: string;
  changelog?: any;
}

export default function PluginMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { activePlugins, isLoading: isLoadingActive } = usePlugins();
  const { installPlugin, uninstallPlugin, isInstalling } = usePluginManager();
  const isMobile = useIsMobile();
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  
  // Fetch all available plugins
  const { data: pluginsData = [], isLoading: isLoadingPlugins } = useQuery({
    queryKey: ['marketplace-plugins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plugins')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data as PluginData[];
    }
  });
  
  // Transform the plugin data to match the Plugin interface
  const plugins: Plugin[] = pluginsData.map(plugin => ({
    ...plugin,
    key: plugin.slug || plugin.id // Use slug as key, fallback to id
  }));
  
  // Get all unique categories
  const categories = [...new Set(plugins.map(plugin => plugin.category).filter(Boolean))];
  
  // Filter plugins based on search and category
  const filteredPlugins = plugins.filter(plugin => {
    const matchesSearch = searchQuery
      ? plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        plugin.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    const matchesCategory = activeCategory
      ? plugin.category === activeCategory
      : true;
      
    return matchesSearch && matchesCategory;
  });
  
  // Group plugins by category for the "All" tab view
  const groupedPlugins = filteredPlugins.reduce((acc, plugin) => {
    const category = plugin.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(plugin);
    return acc;
  }, {} as Record<string, Plugin[]>);
  
  const handlePluginAction = async (plugin: Plugin) => {
    const isActive = activePlugins.includes(plugin.key);
    
    try {
      if (isActive) {
        await uninstallPlugin(plugin.key);
        toast.success(`${plugin.name} has been disabled`);
      } else {
        await installPlugin(plugin.key);
        toast.success(`${plugin.name} has been installed successfully`);
      }
    } catch (err) {
      const errorMessage = isActive 
        ? `Failed to disable ${plugin.name}`
        : `Failed to install ${plugin.name}`;
      toast.error(errorMessage);
    }
  };
  
  const renderPluginCard = (plugin: Plugin) => {
    const isActive = activePlugins.includes(plugin.key);
    
    return (
      <Card key={plugin.id} className="h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{plugin.name}</CardTitle>
            {plugin.badge && (
              <Badge variant="outline" className="bg-blue-50">
                {plugin.badge}
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">{plugin.author || 'Official Plugin'}</div>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-sm">{plugin.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedPlugin(plugin)}
          >
            <ExternalLink className="h-4 w-4 mr-1" /> Details
          </Button>
          <Button 
            variant={isActive ? "destructive" : "default"}
            size="sm"
            onClick={() => handlePluginAction(plugin)}
            disabled={isInstalling}
          >
            {isActive ? (
              <>
                <Package className="h-4 w-4 mr-1" /> Disable
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-1" /> Install
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  const renderSkeletonCard = () => (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/3 mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex justify-between w-full">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      </CardFooter>
    </Card>
  );
  
  const isLoading = isLoadingPlugins || isLoadingActive;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Plugin Marketplace</h1>
          <p className="text-muted-foreground mt-1">
            Extend your workspace with powerful integrations and tools
          </p>
        </div>
        
        <div className="flex gap-2">
          {activePlugins?.length > 0 && (
            <Button variant="outline" onClick={() => setActiveCategory(null)}>
              <RefreshCw className="h-4 w-4 mr-2" /> Reset Filters
            </Button>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search plugins..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Categories</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="all">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  {renderSkeletonCard()}
                </div>
              ))}
            </div>
          ) : filteredPlugins.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-20 mb-4" />
              <h3 className="text-lg font-medium mb-2">No plugins found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedPlugins).map(([category, plugins]) => (
                <div key={category}>
                  <h2 className="text-xl font-semibold mb-4">{category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plugins.map(plugin => (
                      <div key={plugin.id}>
                        {renderPluginCard(plugin)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        {categories.map(category => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i}>
                    {renderSkeletonCard()}
                  </div>
                ))
              ) : (
                filteredPlugins
                  .filter(plugin => plugin.category === category)
                  .map(plugin => (
                    <div key={plugin.id}>
                      {renderPluginCard(plugin)}
                    </div>
                  ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      {selectedPlugin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{selectedPlugin.name}</CardTitle>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedPlugin.author || 'Official Plugin'}
                </span>
                {selectedPlugin.badge && (
                  <Badge variant="outline" className="bg-blue-50">
                    {selectedPlugin.badge}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{selectedPlugin.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Version</span>
                  <span className="text-sm font-medium">{selectedPlugin.version || '1.0.0'}</span>
                </div>
                {selectedPlugin.category && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <span className="text-sm font-medium">{selectedPlugin.category}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={() => setSelectedPlugin(null)}>
                Close
              </Button>
              <Button 
                variant={activePlugins.includes(selectedPlugin.key) ? "destructive" : "default"}
                onClick={() => handlePluginAction(selectedPlugin)}
                disabled={isInstalling}
              >
                {activePlugins.includes(selectedPlugin.key) ? 'Disable' : 'Install'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
