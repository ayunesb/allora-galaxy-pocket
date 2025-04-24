
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { useIsMobile } from "@/hooks/use-mobile"
import { TableToolbar } from "./TableToolbar"
import { DataTableContent } from "./DataTableContent"
import { TablePagination } from "./TablePagination"
import type { DataTableProps } from "./types"

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  showColumnFilters = true,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const isMobile = useIsMobile();

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  React.useEffect(() => {
    if (isMobile && columns.length > 3) {
      const visibleColumns: Record<string, boolean> = {};
      columns.slice(0, 3).forEach((column) => {
        if (typeof column.id === 'string') {
          visibleColumns[column.id] = true;
        }
      });
      setColumnVisibility(visibleColumns);
    }
  }, [isMobile, columns]);

  return (
    <div className="space-y-4">
      <TableToolbar 
        table={table} 
        searchKey={searchKey} 
        showColumnFilters={showColumnFilters}
      />
      <DataTableContent table={table} />
      <TablePagination table={table} />
    </div>
  );
}

export type { DataTableProps }
