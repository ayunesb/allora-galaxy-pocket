
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldX, ShieldAlert } from "lucide-react";

interface SecurityScores {
  high: number;
  medium: number;
  low: number;
}

interface TablesAnalyzedCardProps {
  totalTables: number;
  securityScores: SecurityScores;
}

export function TablesAnalyzedCard({ totalTables, securityScores }: TablesAnalyzedCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Tables Analyzed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold mb-4 text-center">{totalTables}</div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 mb-1">
              <ShieldCheck className="h-4 w-4 text-green-600" />
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-800 border-green-100">
              {securityScores.high} Secure
            </Badge>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 mb-1">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
            </div>
            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-100">
              {securityScores.medium} At Risk
            </Badge>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 mb-1">
              <ShieldX className="h-4 w-4 text-red-600" />
            </div>
            <Badge variant="outline" className="bg-red-50 text-red-800 border-red-100">
              {securityScores.low} Critical
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
