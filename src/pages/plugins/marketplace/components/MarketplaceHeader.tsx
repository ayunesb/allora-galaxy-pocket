
import { SearchBar } from "./SearchBar";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MarketplaceHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  isMobile: boolean;
  onToggleFilters: () => void;
}

export function MarketplaceHeader({
  searchQuery,
  onSearchChange,
  isMobile,
  onToggleFilters
}: MarketplaceHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">Plugin Marketplace</h1>
        <p className="text-muted-foreground">Discover and install plugins to enhance your workspace</p>
      </div>
      
      <div className="flex items-center gap-2 w-full md:w-auto">
        <SearchBar value={searchQuery} onChange={onSearchChange} />
        {isMobile && (
          <Button 
            variant="outline" 
            size="icon"
            onClick={onToggleFilters}
            className="md:hidden"
          >
            <Filter className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
