
import React from 'react';
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Strategy } from "@/types/strategy";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Share2, MoreHorizontal, Download } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export interface StrategyHeaderProps {
  strategy: Strategy;
  onShare?: () => void;
  onExport?: () => void;
  onDelete?: () => void;
}

export function StrategyHeader({ 
  strategy, 
  onShare, 
  onExport, 
  onDelete 
}: StrategyHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-6">
      <Breadcrumb className="mb-2 overflow-x-auto">
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/strategy">Strategies</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink>{strategy?.title || "Strategy Details"}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold truncate">{strategy?.title}</h1>
            <Badge variant={strategy?.status === "published" ? "default" : "outline"} className="whitespace-nowrap">
              {strategy?.status || "Draft"}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 line-clamp-2">{strategy?.description}</p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={onShare}
            className="w-full sm:w-auto"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={onExport}
            className="w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDelete}>Delete</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
