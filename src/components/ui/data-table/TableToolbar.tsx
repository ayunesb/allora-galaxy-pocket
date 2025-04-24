
import React from "react";
import { Input } from "@/components/ui/input";
import { TableColumnVisibility } from "./TableColumnVisibility";
import type { TableToolbarProps } from "./types";

export function TableToolbar<TData>({ 
  table, 
  searchKey, 
  showColumnFilters 
}: TableToolbarProps<TData>) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      {searchKey && (
        <div className="flex items-center py-2">
          <Input
            placeholder="Filter..."
            value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(searchKey)?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
      )}
      {showColumnFilters && <TableColumnVisibility table={table} />}
    </div>
  );
}
