
import { ColumnDef, ColumnFiltersState, SortingState, VisibilityState } from "@tanstack/react-table";

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  showColumnFilters?: boolean
}

export interface TableToolbarProps<TData> {
  table: any
  searchKey?: string
  showColumnFilters?: boolean
}

export interface TableColumnVisibilityProps {
  table: any
}

