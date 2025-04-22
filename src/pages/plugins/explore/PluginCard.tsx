
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Plugin } from "../explore";

interface PluginCardProps {
  plugin: Plugin;
  avgRating?: number;
  reviewCount?: number;
  onInstall: (id: string) => void;
  onReview: () => void;
}
export function PluginCard({ plugin, avgRating, reviewCount, onInstall, onReview }: PluginCardProps) {
  return (
    <Card 
      key={plugin.id} 
      className="flex flex-col bg-card dark:bg-gray-800 border border-border dark:border-gray-700"
    >
      <CardHeader className="flex-row items-center justify-between space-y-0 space-x-4">
        <div className="flex items-center space-x-4">
          {plugin.icon_url && (
            <img 
              src={plugin.icon_url} 
              alt={`${plugin.name} icon`} 
              className="w-12 h-12 rounded-lg" 
            />
          )}
          <div>
            <CardTitle className="text-foreground dark:text-white">{plugin.name}</CardTitle>
            <p className="text-sm text-muted-foreground dark:text-gray-400">{plugin.version}</p>
          </div>
        </div>
        {plugin.category && (
          <span 
            className={`text-xs px-2 py-1 rounded-full text-white ${
              plugin.category === 'Marketing' ? 'bg-blue-600' :
              plugin.category === 'Sales' ? 'bg-green-600' :
              plugin.category === 'Automation' ? 'bg-purple-600' :
              'bg-gray-600'
            }`}
          >
            {plugin.category}
          </span>
        )}
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between">
        <p className="text-sm text-muted-foreground dark:text-gray-400 mb-4">
          {plugin.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-4 h-4 ${
                  i < Math.floor(avgRating || 0)
                    ? "text-yellow-500"
                    : "text-gray-300 dark:text-gray-600"
                }`} 
              />
            ))}
            <span className="text-sm text-muted-foreground dark:text-gray-400">
              {avgRating || 'No'} 
              {` (${reviewCount || 0} reviews)`}
            </span>
          </div>
          <Button 
            variant="default" 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => onInstall(plugin.id)}
          >
            Install
          </Button>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2 w-full text-foreground dark:text-white border-border dark:border-gray-700 hover:bg-accent dark:hover:bg-gray-700"
          onClick={onReview}
        >
          Write a Review
        </Button>
      </CardContent>
    </Card>
  );
}
