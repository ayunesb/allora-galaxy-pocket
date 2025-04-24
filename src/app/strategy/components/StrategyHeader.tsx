
import { Link } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import type { Strategy } from "@/types/strategy";

interface StrategyHeaderProps {
  strategy: Strategy;
  onNavigate: (path: string) => void;
}

export function StrategyHeader({ strategy, onNavigate }: StrategyHeaderProps) {
  return (
    <>
      <Breadcrumb className="mb-4">
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => onNavigate('/dashboard')}>Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => onNavigate('/vault')}>Strategies</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem isCurrentPage>
          {strategy.title}
        </BreadcrumbItem>
      </Breadcrumb>
      
      <CardHeader>
        <CardTitle className="text-2xl">{strategy.title}</CardTitle>
        <div className="text-sm text-muted-foreground">
          Created: {strategy.created_at && format(new Date(strategy.created_at), 'PPP')}
          {strategy.industry && ` • Industry: ${strategy.industry}`}
        </div>
      </CardHeader>
    </>
  );
}
