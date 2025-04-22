
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

interface ActivePluginsCardProps {
  pluginStats: Record<string, number>;
}

export function ActivePluginsCard({ pluginStats }: ActivePluginsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Active Plugins</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{Object.keys(pluginStats).length}</div>
        <p className="text-sm text-muted-foreground">
          {Object.entries(pluginStats).map(([key, value], index, arr) => (
            <span key={key}>{key}{index < arr.length - 1 ? ', ' : ''}</span>
          ))}
        </p>
      </CardContent>
    </Card>
  );
}

