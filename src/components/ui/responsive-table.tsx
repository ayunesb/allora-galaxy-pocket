
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell
} from "@/components/ui/table";
import * as React from "react";

export interface Column {
  header: string;
  accessorKey: string;
  cell?: (value: any) => React.ReactNode;
}

interface ResponsiveTableProps<T> {
  columns: Column[];
  data: T[];
  emptyMessage?: string;
}

export function ResponsiveTable<T>({ columns, data, emptyMessage = "No data available" }: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();
  
  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-4">
        {data.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">{emptyMessage}</div>
        ) : (
          data.map((row, rowIndex) => (
            <div 
              key={rowIndex} 
              className="border rounded-lg p-4 shadow-sm bg-card space-y-3"
            >
              {columns.map((column, columnIndex) => {
                const value = (row as any)[column.accessorKey];
                return (
                  <div key={columnIndex} className="grid grid-cols-[1fr,2fr] gap-3">
                    <div className="font-medium text-sm text-muted-foreground">{column.header}</div>
                    <div className="text-sm">
                      {column.cell ? column.cell(value) : value}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    );
  }

  // Desktop table view
  return (
    <div className="border rounded-md w-full overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-6">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, columnIndex) => {
                  const value = (row as any)[column.accessorKey];
                  return (
                    <TableCell key={columnIndex}>
                      {column.cell ? column.cell(value) : value}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
