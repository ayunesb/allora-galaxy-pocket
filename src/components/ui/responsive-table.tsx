
import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "./card";
import { Skeleton } from "./skeleton";

interface Column {
  header: string;
  accessorKey: string;
  cell?: (value: any, row?: any) => React.ReactNode;
}

interface ResponsiveTableProps<T extends Record<string, any>> {
  columns: Column[];
  data: T[];
  emptyMessage?: string;
  isLoading?: boolean;
  skeletonRows?: number;
}

export function ResponsiveTable<T extends Record<string, any>>({
  columns,
  data,
  emptyMessage = "No data available",
  isLoading = false,
  skeletonRows = 5
}: ResponsiveTableProps<T>) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: skeletonRows }).map((_, idx) => (
          <Card key={idx} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data.length) {
    return <p className="text-center py-8 text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <>
      {/* Desktop view (table) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {columns.map((column) => (
                <th key={column.accessorKey} className="text-left p-3 font-medium">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b hover:bg-muted/50">
                {columns.map((column) => (
                  <td key={`${rowIndex}-${column.accessorKey}`} className="p-3">
                    {column.cell 
                      ? column.cell(row[column.accessorKey], row)
                      : row[column.accessorKey]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view (cards) */}
      <div className="md:hidden space-y-4">
        {data.map((row, rowIndex) => (
          <Card key={rowIndex} className="overflow-hidden">
            <CardContent className="p-4">
              {columns.map((column) => (
                <div key={`${rowIndex}-${column.accessorKey}`} className="py-2 border-b last:border-b-0">
                  <div className="font-medium text-sm">{column.header}</div>
                  <div className="mt-1">
                    {column.cell 
                      ? column.cell(row[column.accessorKey], row)
                      : row[column.accessorKey]
                    }
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

export type { Column };
