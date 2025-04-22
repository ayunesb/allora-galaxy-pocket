
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface KpiErrorStateProps {
  error: Error | null | unknown;
}

export default function KpiErrorState({ error }: KpiErrorStateProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="border-red-300 bg-red-50">
        <CardContent className="py-6">
          <div className="flex items-center">
            <AlertCircle className="text-red-500 h-6 w-6 mr-2" />
            <p className="text-red-500 font-medium">
              Error loading KPI data: {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
          <p className="mt-2 text-sm text-red-400">
            Please try refreshing the page or contact support if the problem persists.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
