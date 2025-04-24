
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { usePlugins } from "@/hooks/usePlugins";
import { usePluginManager } from "@/hooks/usePluginManager";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePluginFilters } from "@/hooks/usePluginFilters";
import { availablePlugins, categories } from "./data";
import { Plugin } from "@/types/plugin";
import { EmptyPluginState } from "./components/EmptyPluginState";
import { CategoryFilter } from "./components/CategoryFilter";
import { SortPlugins } from "./components/SortPlugins";
import { MarketplaceHeader } from "./components/MarketplaceHeader";
import { PluginList } from "./components/PluginList";
import { PluginDetails } from "./components/PluginDetails";

export default function PluginMarketplace() {
  const { activePlugins } = usePlugins();
  const { installPlugin, uninstallPlugin, isInstalling } = usePluginManager();
  const isMobile = useIsMobile();
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    sortOrder,
    setSortOrder,
    filteredPlugins,
    resetFilters
  } = usePluginFilters(availablePlugins);

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
      <MarketplaceHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isMobile={isMobile}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

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
            <PluginList
              plugins={filteredPlugins}
              activePlugins={activePlugins}
              isInstalling={isInstalling}
              onInstall={handlePluginAction}
              onShowDetails={setSelectedPlugin}
            />
          )}
        </div>
      </div>
      
      <PluginDetails
        plugin={selectedPlugin}
        isOpen={!!selectedPlugin}
        onClose={() => setSelectedPlugin(null)}
        onAction={handlePluginAction}
        isActive={selectedPlugin ? activePlugins.includes(selectedPlugin.key) : false}
        isInstalling={isInstalling}
      />
    </div>
  );
}
