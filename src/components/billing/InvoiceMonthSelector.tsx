
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

interface InvoiceMonthSelectorProps {
  selectedMonth: string;
  availableMonths: string[];
  onSelectMonth: (month: string) => void;
  isLoading: boolean;
}

export function InvoiceMonthSelector({
  selectedMonth,
  availableMonths,
  onSelectMonth,
  isLoading
}: InvoiceMonthSelectorProps) {
  const formatMonthOption = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMMM yyyy");
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <Select 
      value={selectedMonth} 
      onValueChange={onSelectMonth}
      disabled={isLoading || availableMonths.length === 0}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select period" />
      </SelectTrigger>
      <SelectContent>
        {availableMonths.map((month) => (
          <SelectItem key={month} value={month}>
            {formatMonthOption(month)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
