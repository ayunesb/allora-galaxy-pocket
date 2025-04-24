import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { usePlugins } from "@/hooks/usePlugins";
import { usePluginManager } from "@/hooks/usePluginManager";
import { Plugin } from "@/types/plugin";
import { useIsMobile } from "@/hooks/use-mobile";
import { PluginCard } from "./PluginCard";
import { SearchBar } from "./components/SearchBar";
import { CategoryFilter } from "./components/CategoryFilter";
import { SortPlugins } from "./components/SortPlugins";
import { EmptyPluginState } from "./components/EmptyPluginState";
import { availablePlugins, categories } from "./data";

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

  const resetFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
  };

  useEffect(() => {
    let results = availablePlugins;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(plugin => 
        plugin.name.toLowerCase().includes(query) || 
        plugin.description.toLowerCase().includes(query) ||
        plugin.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    if (activeCategory !== "all") {
      results = results.filter(plugin => plugin.category === activeCategory);
    }
    
    switch (sortOrder) {
      case "newest":
        results = [...results].sort(() => Math.random() - 0.5);
        break;
      case "name":
        results = [...results].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "popular":
      default:
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
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
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
        {isMobile && showFilters && (
          <Card className="p-4 w-full md:hidden space-y-4">
            <CategoryFilter 
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              isMobile={true}
            />
            <div>
              <h3 className="text-sm font-medium mb-2">Sort By</h3>
              <SortPlugins value={sortOrder} onChange={setSortOrder} />
            </div>
          </Card>
        )}

        <div className="hidden md:block w-48">
          <CategoryFilter 
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            isMobile={false}
          />
        </div>
        
        <div className="flex-1">
          <div className="hidden md:flex justify-between items-center mb-4">
            <div>
              <span className="text-sm text-muted-foreground">
                {filteredPlugins.length} plugin{filteredPlugins.length !== 1 ? 's' : ''} found
              </span>
            </div>
            <SortPlugins value={sortOrder} onChange={setSortOrder} />
          </div>

          {filteredPlugins.length === 0 ? (
            <EmptyPluginState onReset={resetFilters} />
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
