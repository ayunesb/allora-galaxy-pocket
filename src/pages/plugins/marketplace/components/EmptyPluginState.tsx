
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyPluginStateProps {
  onReset: () => void;
}

export function EmptyPluginState({ onReset }: EmptyPluginStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Package className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No plugins found</h3>
      <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
      <Button variant="outline" className="mt-4" onClick={onReset}>
        Clear filters
      </Button>
    </div>
  );
}
