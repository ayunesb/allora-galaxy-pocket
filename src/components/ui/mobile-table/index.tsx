
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";

interface Column<T = any> {
  header: React.ReactNode;
  accessorKey: keyof T;
  cell?: (value: any, row: T) => React.ReactNode;
}

interface MobileTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export function MobileTable<T>({ columns, data, emptyMessage = "No data available" }: MobileTableProps<T>) {
  const isMobile = useIsMobile();

  if (!data?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  // Mobile card view
  if (isMobile) {
    return (
      <div className="space-y-4">
        {data.map((row, rowIndex) => (
          <Card key={rowIndex}>
            <CardContent className="p-4">
              {columns.map((column, columnIndex) => {
                const value = row[column.accessorKey];
                return (
                  <div key={columnIndex} className="flex justify-between py-2 border-b last:border-0">
                    <span className="font-medium">{column.header}</span>
                    <span className="text-right">
                      {column.cell ? column.cell(value, row) : String(value)}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop table view
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column, index) => (
            <TableHead key={index}>{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, rowIndex) => (
          <TableRow key={rowIndex}>
            {columns.map((column, columnIndex) => {
              const value = row[column.accessorKey];
              return (
                <TableCell key={columnIndex}>
                  {column.cell ? column.cell(value, row) : String(value)}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
