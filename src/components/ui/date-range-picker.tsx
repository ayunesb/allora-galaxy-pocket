
import * as React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./select";

interface DateRangePickerProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
  }>;
}

export function DateRangePicker({ value, onValueChange, options }: DateRangePickerProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select date range" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
