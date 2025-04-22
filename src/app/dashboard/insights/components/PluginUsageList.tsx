
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

type PluginUsageListProps = {
  pluginStats: Record<string, number>;
};

export function PluginUsageList({ pluginStats }: PluginUsageListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Plugin Usage</CardTitle>
      </CardHeader>
      <CardContent>
        {Object.keys(pluginStats).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(pluginStats).map(([plugin, count]) => (
              <div key={plugin} className="flex justify-between items-center border-b pb-2">
                <div className="capitalize">{String(plugin).replace('_', ' ')}</div>
                <div className="font-medium">{String(count)} uses</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center py-4 text-muted-foreground">
            No plugin usage data available for the selected period.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
