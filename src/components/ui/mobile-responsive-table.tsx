
import React, { ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export interface Column {
  header: string;
  accessorKey: string;
  cell?: (value: any) => ReactNode;
}

interface MobileResponsiveTableProps<T> {
  columns: Column[];
  data: T[];
  emptyMessage?: string;
}

export function MobileResponsiveTable<T>({ columns, data, emptyMessage = "No data available" }: MobileResponsiveTableProps<T>) {
  // For mobile devices
  const renderCardView = () => (
    <div className="space-y-4">
      {data.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">{emptyMessage}</div>
      ) : (
        data.map((row, rowIndex) => (
          <div 
            key={rowIndex} 
            className="border rounded-lg p-4 shadow-sm bg-card"
          >
            {columns.map((column, columnIndex) => {
              const value = (row as any)[column.accessorKey];
              return (
                <div key={columnIndex} className="grid grid-cols-2 gap-2 py-2">
                  <div className="text-sm font-medium">{column.header}</div>
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

  // For desktop
  const renderTableView = () => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={index}>
                {column.header}
              </TableHead>
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

  return (
    <>
      {/* Mobile view */}
      <div className="md:hidden">
        {renderCardView()}
      </div>
      
      {/* Desktop view */}
      <div className="hidden md:block">
        {renderTableView()}
      </div>
    </>
  );
}
