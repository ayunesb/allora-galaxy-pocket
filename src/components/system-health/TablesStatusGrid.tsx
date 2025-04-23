
import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  tables: Record<string, boolean>;
}

const TablesStatusGrid: React.FC<Props> = ({ tables }) => (
  <div className="pt-3 border-t">
    <h4 className="text-sm font-medium mb-3">Required Tables</h4>
    <div className="grid grid-cols-2 gap-3">
      {Object.entries(tables).map(([table, exists]) => (
        <div key={table} className="flex items-center justify-between">
          <span className="text-sm">{table}</span>
          {exists ? (
            <Badge variant="success" className="bg-green-500 text-xs">
              <CheckCircle className="h-3 w-3 mr-1" /> Exists
            </Badge>
          ) : (
            <Badge variant="destructive" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" /> Missing
            </Badge>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default TablesStatusGrid;
