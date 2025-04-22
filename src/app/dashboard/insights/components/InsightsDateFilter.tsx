
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface InsightsDateFilterProps {
  dateRange: string;
  setDateRange: (v: string) => void;
  children?: React.ReactNode;
}
export function InsightsDateFilter({ dateRange, setDateRange, children }: InsightsDateFilterProps) {
  return (
    <div className="flex gap-2">
      <Select value={dateRange} onValueChange={setDateRange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Time Period" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7">Last 7 days</SelectItem>
          <SelectItem value="30">Last 30 days</SelectItem>
          <SelectItem value="90">Last 90 days</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="icon">
        <Filter className="h-4 w-4" />
      </Button>
      {children}
    </div>
  );
}
export default InsightsDateFilter;
