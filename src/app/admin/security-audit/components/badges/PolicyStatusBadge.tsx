
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ShieldAlert } from "lucide-react";

interface PolicyStatusBadgeProps {
  hasAuthReference: boolean;
}

export function PolicyStatusBadge({ hasAuthReference }: PolicyStatusBadgeProps) {
  if (!hasAuthReference) {
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <ShieldAlert className="h-3 w-3" />
        Insecure
      </Badge>
    );
  }
  
  return (
    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
      <CheckCircle className="h-3 w-3" />
      Secured
    </Badge>
  );
}
