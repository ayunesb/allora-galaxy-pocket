
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CategoryFilterProps {
  categories: Array<{ id: string; label: string }>;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  isMobile: boolean;
}

export function CategoryFilter({ categories, activeCategory, onCategoryChange, isMobile }: CategoryFilterProps) {
  if (isMobile) {
    return (
      <div>
        <h3 className="text-sm font-medium mb-2">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Badge 
              key={category.id} 
              variant={activeCategory === category.id ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => onCategoryChange(category.id)}
            >
              {category.label}
            </Badge>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Select value={activeCategory} onValueChange={onCategoryChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent>
        {categories.map(category => (
          <SelectItem key={category.id} value={category.id}>
            {category.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
