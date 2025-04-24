
import { CategoryFilter } from "./CategoryFilter";

interface DesktopFiltersProps {
  categories: Array<{ id: string; label: string }>;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function DesktopFilters({
  categories,
  activeCategory,
  onCategoryChange
}: DesktopFiltersProps) {
  return (
    <div className="hidden md:block w-48">
      <CategoryFilter 
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={onCategoryChange}
        isMobile={false}
      />
    </div>
  );
}
