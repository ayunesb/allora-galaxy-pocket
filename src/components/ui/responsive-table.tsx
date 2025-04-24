
import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export interface Column<T = any> {
  header: React.ReactNode;
  accessorKey: keyof T | string;
  cell?: (value: any, row?: T) => React.ReactNode;
}

interface ResponsiveTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function ResponsiveTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "No data available"
}: ResponsiveTableProps<T>) {
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  // Desktop view (standard table)
  const renderDesktopTable = () => (
    <div className="hidden md:block overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, i) => (
              <TableHead key={i}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i}>
              {columns.map((column, j) => {
                const value = typeof column.accessorKey === 'string' 
                  ? getNestedValue(row, column.accessorKey)
                  : row[column.accessorKey];
                  
                return (
                  <TableCell key={j}>
                    {column.cell ? column.cell(value, row) : value}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // Mobile view (cards)
  const renderMobileCards = () => (
    <div className="md:hidden space-y-4">
      {data.map((row, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <dl className="space-y-2">
              {columns.map((column, j) => {
                const value = typeof column.accessorKey === 'string' 
                  ? getNestedValue(row, column.accessorKey)
                  : row[column.accessorKey];
                  
                return (
                  <div key={j} className="grid grid-cols-3 gap-1">
                    <dt className="font-semibold text-sm col-span-1">
                      {column.header}:
                    </dt>
                    <dd className="text-sm col-span-2">
                      {column.cell ? column.cell(value, row) : value}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      {renderDesktopTable()}
      {renderMobileCards()}
    </>
  );
}
