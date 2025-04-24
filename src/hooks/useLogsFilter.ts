
import { useState } from "react";
import { SystemLogFilter } from "@/types/systemLog";

export const useLogsFilter = () => {
  const [filters, setFilters] = useState<SystemLogFilter>({
    dateRange: 7,
    eventType: "all",
    userId: "all",
    search: "",
    severity: undefined,
    status: undefined
  });

  const updateFilter = (key: keyof SystemLogFilter, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return {
    filters,
    updateFilter,
  };
};
