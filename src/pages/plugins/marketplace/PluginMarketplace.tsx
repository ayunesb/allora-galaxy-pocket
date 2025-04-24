
import { useState } from "react";
import { usePlugins } from "@/hooks/usePlugins";
import { usePluginManager } from "@/hooks/usePluginManager";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePluginFilters } from "@/hooks/usePluginFilters";
import { availablePlugins, categories } from "./data";
import { Plugin } from "@/types/plugin";
import { LoadingState } from "./components/LoadingState";
import { ErrorState } from "./components/ErrorState";
import { FilterSection } from "./components/FilterSection";
import { DesktopFilters } from "./components/DesktopFilters";
import { MarketplaceHeader } from "./components/MarketplaceHeader";
import { PluginList } from "./components/PluginList";
import { PluginDetails } from "./components/PluginDetails";
import { SortPlugins } from "./components/SortPlugins";
import { toast } from "sonner";

export default function PluginMarketplace() {
  const { activePlugins } = usePlugins();
  const { installPlugin, uninstallPlugin, isInstalling } = usePluginManager();
  const isMobile = useIsMobile();
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    setIsProcessing(plugin.key);
    setError(null);
    
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
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(null);
    }
  };

  if (error) {
    return <ErrorState message={error} />;
  }

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
          <FilterSection
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            sortOrder={sortOrder}
            onSortChange={setSortOrder}
            isMobile={isMobile}
          />
        )}

        <DesktopFilters
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        
        <div className="flex-1">
          <div className="hidden md:flex justify-between items-center mb-4">
            <div>
              <span className="text-sm text-muted-foreground">
                {filteredPlugins.length} plugin{filteredPlugins.length !== 1 ? 's' : ''} found
              </span>
            </div>
            <SortPlugins value={sortOrder} onChange={setSortOrder} />
          </div>

          <PluginList
            plugins={filteredPlugins}
            activePlugins={activePlugins}
            isInstalling={isInstalling}
            onInstall={handlePluginAction}
            onShowDetails={setSelectedPlugin}
            processingPluginKey={isProcessing}
          />
        </div>
      </div>
      
      <PluginDetails
        plugin={selectedPlugin}
        isOpen={!!selectedPlugin}
        onClose={() => setSelectedPlugin(null)}
        onAction={handlePluginAction}
        isActive={selectedPlugin ? activePlugins.includes(selectedPlugin.key) : false}
        isInstalling={isInstalling || (selectedPlugin ? isProcessing === selectedPlugin.key : false)}
      />
    </div>
  );
}
