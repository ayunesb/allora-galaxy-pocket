
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays, Download, BarChart, LineChart, PieChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBillingProfile } from "@/hooks/useBillingProfile";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";

// Mock data for usage history
const mockUsageData = {
  current: {
    total: 78,
    breakdown: [
      { category: "Strategy Creation", usage: 42, percentage: 53.8 },
      { category: "Campaign Generation", usage: 28, percentage: 35.9 },
      { category: "AI Analysis", usage: 15, percentage: 19.2 },
      { category: "Other Operations", usage: 5, percentage: 6.4 }
    ]
  },
  history: [
    { date: subDays(new Date(), 30), usage: 120 },
    { date: subDays(new Date(), 25), usage: 105 },
    { date: subDays(new Date(), 20), usage: 90 },
    { date: subDays(new Date(), 15), usage: 75 },
    { date: subDays(new Date(), 10), usage: 60 },
    { date: subDays(new Date(), 5), usage: 45 },
    { date: new Date(), usage: 30 }
  ],
  logs: [
    { id: 1, date: subDays(new Date(), 1), feature: "Strategy Creation", credits: 10, agent: "CEO_Agent" },
    { id: 2, date: subDays(new Date(), 1), feature: "Campaign Generation", credits: 8, agent: "CampaignAgent" },
    { id: 3, date: subDays(new Date(), 2), feature: "AI Analysis", credits: 5, agent: "AIInsightAgent" },
    { id: 4, date: subDays(new Date(), 3), feature: "Strategy Creation", credits: 10, agent: "CEO_Agent" },
    { id: 5, date: subDays(new Date(), 4), feature: "Other Operations", credits: 2, agent: "System" }
  ]
};

interface UsageLog {
  id: number;
  date: Date;
  feature: string;
  credits: number;
  agent: string;
}

export default function UsageDetails() {
  const { profile, isLoading } = useBillingProfile();
  const [timeframe, setTimeframe] = useState<string>("month");
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // In a real implementation, fetch usage logs from Supabase
    const fetchUsageLogs = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setUsageLogs(mockUsageData.logs);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching usage logs:", error);
        setLoading(false);
      }
    };
    
    fetchUsageLogs();
  }, []);
  
  const getTimeframeData = () => {
    const now = new Date();
    
    switch (timeframe) {
      case "week":
        return {
          label: "This Week",
          start: format(startOfWeek(now), "MMM d"),
          end: format(endOfWeek(now), "MMM d, yyyy")
        };
      case "month":
        return {
          label: "This Month",
          start: format(startOfMonth(now), "MMM d"),
          end: format(endOfMonth(now), "MMM d, yyyy")
        };
      case "quarter":
        return {
          label: "This Quarter",
          start: format(subDays(now, 90), "MMM d"),
          end: format(now, "MMM d, yyyy")
        };
      default:
        return {
          label: "This Month",
          start: format(startOfMonth(now), "MMM d"),
          end: format(endOfMonth(now), "MMM d, yyyy")
        };
    }
  };
  
  const timeframeData = getTimeframeData();
  
  const getMaxCredits = () => {
    switch (profile?.plan) {
      case "standard": return 100;
      case "growth": return 500;
      case "pro": return 1000;
      default: return 100;
    }
  };
  
  const usagePercentage = (mockUsageData.current.total / getMaxCredits()) * 100;
  
  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Credit Usage Details</h1>
          <p className="text-muted-foreground">Monitor and analyze your credit consumption</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Credits Used</CardTitle>
            <CardDescription>{timeframeData.label}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {mockUsageData.current.total} / {getMaxCredits()}
            </div>
            <div className="flex justify-between mb-1 text-sm">
              <span className="text-muted-foreground">
                {timeframeData.start} - {timeframeData.end}
              </span>
              <span className="font-medium">{usagePercentage.toFixed(1)}%</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Remaining Credits</CardTitle>
            <CardDescription>{timeframeData.label}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {getMaxCredits() - mockUsageData.current.total}
            </div>
            <div className="flex justify-between mb-1 text-sm">
              <span className="text-muted-foreground">
                Resets on the 1st of each month
              </span>
              <span className="font-medium">
                {(100 - usagePercentage).toFixed(1)}%
              </span>
            </div>
            <Progress value={100 - usagePercentage} className="h-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Usage Trend</CardTitle>
            <CardDescription>Credit consumption over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6 text-muted-foreground">
              <LineChart className="h-12 w-12 mx-auto mb-2" />
              <p>Detailed charts will be available soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-4 mb-6">
        <Card className="md:col-span-3">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Usage Breakdown</CardTitle>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <BarChart className="h-12 w-12 mx-auto mb-2" />
                <p>Detailed usage breakdown will be available soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Features</CardTitle>
            <CardDescription>By credit usage</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {mockUsageData.current.breakdown.map((item, index) => (
                <li key={index}>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>{item.category}</span>
                    <span className="font-medium">{item.usage}</span>
                  </div>
                  <Progress value={item.percentage} className="h-1.5" />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Usage Logs</CardTitle>
          <CardDescription>
            Detailed record of credit usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Feature</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead className="text-right">Credits</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      Loading usage logs...
                    </TableCell>
                  </TableRow>
                ) : usageLogs.length > 0 ? (
                  usageLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{format(log.date, "MMM d, yyyy")}</TableCell>
                      <TableCell>{log.feature}</TableCell>
                      <TableCell>{log.agent}</TableCell>
                      <TableCell className="text-right">{log.credits}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No usage logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-center mt-6">
            <Button variant="outline">View All Logs</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
