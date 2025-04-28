
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";

export interface AuditAnalyticsProps {
  aiApproved: number;
  humanApproved: number;
}

export function AuditAnalytics({ aiApproved, humanApproved }: AuditAnalyticsProps) {
  const approvalData = [
    { name: "AI Approved", value: aiApproved, color: "#3b82f6" },
    { name: "Human Approved", value: humanApproved, color: "#10b981" }
  ];
  
  const totalApprovals = aiApproved + humanApproved;
  const aiPercentage = totalApprovals > 0 ? Math.round((aiApproved / totalApprovals) * 100) : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Approval Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={approvalData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {approvalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Automation Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <div>
              <h4 className="text-sm font-medium">AI Approval Rate</h4>
              <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${aiPercentage}%` }}
                ></div>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{aiPercentage}% of approvals are automated</div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-medium">Total AI Approvals</span>
                  <p className="text-2xl font-bold">{aiApproved}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Total Human Approvals</span>
                  <p className="text-2xl font-bold">{humanApproved}</p>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground mt-4">
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span>AI Approved: {aiApproved}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Human Approved: {humanApproved}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
