
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Tables Analyzed</CardTitle>
        <Database className="h-5 w-5 text-blue-500" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{totalTables}</div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-green-500 mr-1"></div>
            <span className="text-sm">High: {securityScores.high}</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-yellow-500 mr-1"></div>
            <span className="text-sm">Medium: {securityScores.medium}</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-red-500 mr-1"></div>
            <span className="text-sm">Low: {securityScores.low}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
