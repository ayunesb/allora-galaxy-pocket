
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface DisabledRlsRowProps {
  tableName: string;
}

export function DisabledRlsRow({ tableName }: DisabledRlsRowProps) {
  return (
    <tr className="bg-red-50">
      <td className="p-3 border">{tableName}</td>
      <td className="p-3 border text-center">
        <Badge variant="destructive">
          Disabled
        </Badge>
      </td>
      <td className="p-3 border text-red-700" colSpan={4}>
        <div className="flex items-center gap-1">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-semibold">Security risk: Row Level Security is not enabled</span>
        </div>
      </td>
    </tr>
  );
}
