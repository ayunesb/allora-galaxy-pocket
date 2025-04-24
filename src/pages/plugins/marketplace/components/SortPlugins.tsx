
import { Star } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SortPluginsProps {
  value: "popular" | "newest" | "name";
  onChange: (value: "popular" | "newest" | "name") => void;
}

export function SortPlugins({ value, onChange }: SortPluginsProps) {
  return (
    <Select value={value} onValueChange={(value) => onChange(value as any)}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="popular">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            <span>Most Popular</span>
          </div>
        </SelectItem>
        <SelectItem value="newest">Newest</SelectItem>
        <SelectItem value="name">Name (A-Z)</SelectItem>
      </SelectContent>
    </Select>
  );
}
