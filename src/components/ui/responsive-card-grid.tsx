
import { cn } from "@/lib/utils";

interface ResponsiveCardGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
}

export function ResponsiveCardGrid({
  children,
  className,
  columns = { default: 1, sm: 2, lg: 3 }
}: ResponsiveCardGridProps) {
  const gridCols = `grid grid-cols-${columns.default} sm:grid-cols-${columns.sm || columns.default} md:grid-cols-${columns.md || columns.sm || columns.default} lg:grid-cols-${columns.lg || columns.md || columns.sm || columns.default}`;
  
  return (
    <div className={cn(gridCols, "gap-4", className)}>
      {children}
    </div>
  );
}
