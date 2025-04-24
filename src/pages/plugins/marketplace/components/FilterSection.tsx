
import { Card } from "@/components/ui/card";
import { CategoryFilter } from "./CategoryFilter";
import { SortPlugins } from "./SortPlugins";

interface FilterSectionProps {
  categories: Array<{ id: string; label: string }>;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  sortOrder: "popular" | "newest" | "name";
  onSortChange: (value: "popular" | "newest" | "name") => void;
  isMobile: boolean;
}

export function FilterSection({
  categories,
  activeCategory,
  onCategoryChange,
  sortOrder,
  onSortChange,
  isMobile
}: FilterSectionProps) {
  return (
    <Card className="p-4 w-full md:hidden space-y-4">
      <CategoryFilter 
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
        isMobile={true}
      />
      <div>
        <h3 className="text-sm font-medium mb-2">Sort By</h3>
        <SortPlugins value={sortOrder} onChange={onSortChange} />
      </div>
    </Card>
  );
}
