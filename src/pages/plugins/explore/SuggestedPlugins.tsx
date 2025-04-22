
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Plugin } from "../types";

interface SuggestedPluginsProps {
  suggestedPlugins: Plugin[];
}
export function SuggestedPlugins({ suggestedPlugins }: SuggestedPluginsProps) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold mb-4 text-foreground dark:text-gray-200">🧠 AI Suggested Plugins</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {suggestedPlugins.map((plugin) => (
          <Card 
            key={plugin.id} 
            className="flex flex-col bg-card dark:bg-gray-800 border border-border dark:border-gray-700"
          >
            <CardHeader className="flex-row items-center space-x-4">
              {plugin.icon_url && (
                <img 
                  src={plugin.icon_url} 
                  alt={`${plugin.name} icon`} 
                  className="w-12 h-12 rounded-lg" 
                />
              )}
              <div>
                <CardTitle className="text-foreground dark:text-white">{plugin.name}</CardTitle>
                <p className="text-sm text-muted-foreground dark:text-gray-400">{plugin.description}</p>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
