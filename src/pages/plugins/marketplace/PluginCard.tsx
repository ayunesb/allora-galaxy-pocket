import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Check, Star, Info, Loader } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Plugin } from "@/types/plugin";
import { useIsMobile } from "@/hooks/use-mobile";

interface PluginCardProps {
  plugin: Plugin;
  isActive: boolean;
  onAction: (plugin: Plugin) => Promise<void>;
  isLoading: boolean;
  showDetails?: () => void;
}

export function PluginCard({ plugin, isActive, onAction, isLoading, showDetails }: PluginCardProps) {
  const isMobile = useIsMobile();
  
  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-md">
      <CardHeader className="pb-2 space-y-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{plugin.icon || '🔌'}</span>
            <h3 className="text-lg font-medium line-clamp-1">{plugin.name}</h3>
          </div>
          <Badge 
            variant={isActive ? "default" : "outline"} 
            className={isActive ? "bg-green-600" : ""}
          >
            {isActive ? "Active" : "Available"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {plugin.description}
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {plugin.tags?.slice(0, isMobile ? 2 : 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
          {plugin.tags && plugin.tags.length > (isMobile ? 2 : 3) && (
            <Badge variant="secondary" className="text-xs">+{plugin.tags.length - (isMobile ? 2 : 3)}</Badge>
          )}
        </div>
        <div className="flex items-center gap-1 text-amber-500">
          <Star className="w-4 h-4 fill-amber-500" />
          <span className="text-sm font-medium">4.8</span>
          <span className="text-xs text-muted-foreground">(24)</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t pt-3 bg-muted/30">
        <span className="text-sm text-muted-foreground">v{plugin.version || '1.0.0'}</span>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={showDetails} 
                  className="h-8 w-8"
                  disabled={isLoading}
                >
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Details</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>View details</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button 
            size="sm" 
            variant={isActive ? "outline" : "default"}
            onClick={() => onAction(plugin)}
            disabled={isLoading}
            className="min-w-[80px] relative"
          >
            {isLoading ? (
              <div className="flex items-center">
                <Loader className="animate-spin mr-2 h-4 w-4" />
                {isMobile ? '' : 'Processing...'}
              </div>
            ) : isActive ? (
              <>
                <Check className="mr-1 h-4 w-4" />
                {isMobile ? '' : 'Enabled'}
              </>
            ) : (
              <>
                <Download className="mr-1 h-4 w-4" />
                {isMobile ? '' : 'Install'}
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
