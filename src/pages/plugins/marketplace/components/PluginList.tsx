
import { Plugin } from "@/types/plugin";
import { PluginCard } from "../PluginCard";

interface PluginListProps {
  plugins: Plugin[];
  activePlugins: string[];
  isInstalling: boolean;
  onInstall: (plugin: Plugin) => Promise<void>;
  onShowDetails: (plugin: Plugin) => void;
  processingPluginKey?: string | null;
}

export function PluginList({ 
  plugins, 
  activePlugins, 
  isInstalling, 
  onInstall, 
  onShowDetails,
  processingPluginKey 
}: PluginListProps) {
  if (plugins.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {plugins.map(plugin => (
        <PluginCard
          key={plugin.key}
          plugin={plugin}
          isActive={activePlugins.includes(plugin.key)}
          onAction={() => onInstall(plugin)}
          isLoading={isInstalling || processingPluginKey === plugin.key}
          showDetails={() => onShowDetails(plugin)}
        />
      ))}
    </div>
  );
}
