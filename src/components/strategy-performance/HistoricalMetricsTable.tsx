
import { Loader2 } from "lucide-react";

interface HistoricalMetricsTableProps {
  isLoading: boolean;
  chartData: Array<Record<string, any>>;
  allMetricTypes: Set<string>;
}

export function HistoricalMetricsTable({ 
  isLoading, 
  chartData, 
  allMetricTypes 
}: HistoricalMetricsTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <p className="text-center py-6 text-muted-foreground">
        No historical data available
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Date</th>
            {Array.from(allMetricTypes).map(metric => (
              <th key={metric} className="text-left p-2">{metric}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {chartData.map((entry, index) => (
            <tr key={index} className="border-b">
              <td className="p-2">{entry.date}</td>
              {Array.from(allMetricTypes).map(metric => (
                <td key={metric} className="p-2">
                  {entry[metric] !== undefined ? entry[metric] : '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
