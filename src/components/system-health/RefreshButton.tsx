
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface RefreshButtonProps {
  isChecking: boolean;
  onRefresh: () => void;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({ isChecking, onRefresh }) => (
  <Button 
    size="sm" 
    variant="outline" 
    onClick={onRefresh} 
    disabled={isChecking}
  >
    <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`} />
    {isChecking ? "Checking..." : "Refresh"}
  </Button>
);
