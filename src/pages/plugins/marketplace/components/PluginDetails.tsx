
import { Star } from "lucide-react";
import { Plugin } from "@/types/plugin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface PluginDetailsProps {
  plugin: Plugin | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (plugin: Plugin) => Promise<void>;
  isActive: boolean;
  isInstalling: boolean;
}

export function PluginDetails({ 
  plugin, 
  isOpen, 
  onClose, 
  onAction, 
  isActive,
  isInstalling 
}: PluginDetailsProps) {
  if (!plugin) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-xl">{plugin.icon || '🔌'}</span>
            {plugin.name}
          </DialogTitle>
          <DialogDescription>{plugin.description}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {plugin.tags?.map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Version</p>
              <p>{plugin.version || "1.0.0"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Category</p>
              <p className="capitalize">{plugin.category}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Author</p>
              <p>{plugin.author || "Allora Team"}</p>
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
                onAction(plugin);
                onClose();
              }}
              disabled={isInstalling}
            >
              {isActive ? "Disable Plugin" : "Install Plugin"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
