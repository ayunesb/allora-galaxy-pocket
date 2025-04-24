
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parse } from "date-fns";

interface InvoiceMonthSelectorProps {
  availableMonths: string[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
  isDisabled: boolean;
}

export function InvoiceMonthSelector({
  availableMonths,
  selectedMonth,
  onSelectMonth,
  isDisabled
}: InvoiceMonthSelectorProps) {
  
  const formatMonthLabel = (month: string) => {
    try {
      // Parse the YYYY-MM format and format into a nice display
      const date = parse(month, "yyyy-MM", new Date());
      return format(date, "MMMM yyyy");
    } catch (e) {
      return month;
    }
  };

  return (
    <Select 
      value={selectedMonth} 
      onValueChange={onSelectMonth}
      disabled={isDisabled}
    >
      <SelectTrigger className="w-full md:w-[200px]">
        <SelectValue placeholder="Select billing month" />
      </SelectTrigger>
      <SelectContent>
        {availableMonths.map(month => (
          <SelectItem key={month} value={month}>
            {formatMonthLabel(month)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
