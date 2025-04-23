
import { Badge } from "@/components/ui/badge";

interface DisabledRlsRowProps {
  tableName: string;
}

export function DisabledRlsRow({ tableName }: DisabledRlsRowProps) {
  return (
    <tr className="bg-gray-50">
      <td className="p-3 border">{tableName}</td>
      <td className="p-3 border text-center">
        <Badge variant="secondary" className="bg-gray-50 text-gray-500">
          Disabled
        </Badge>
      </td>
      <td className="p-3 border" colSpan={3}>No RLS protection</td>
      <td className="p-3 border text-center">N/A</td>
    </tr>
  );
}
