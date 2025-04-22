
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function PluginEarningsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="bg-card dark:bg-gray-800 shadow-lg border border-border">
        <CardHeader>
          <CardTitle className="text-2xl">Plugin Earnings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground dark:text-gray-300">
              Track revenue from your plugins and marketplace contributions.
            </p>
            
            <div className="flex items-center gap-4">
              <Select defaultValue="last30days">
                <SelectTrigger className="w-[180px] bg-background dark:bg-gray-700">
                  <SelectValue placeholder="Time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">Last 7 days</SelectItem>
                  <SelectItem value="last30days">Last 30 days</SelectItem>
                  <SelectItem value="last90days">Last 90 days</SelectItem>
                  <SelectItem value="lastyear">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="plugins">Plugins</TabsTrigger>
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-background dark:bg-gray-700 p-4 rounded-md">
                  <div className="text-sm text-muted-foreground">Total Earnings</div>
                  <div className="text-2xl font-bold">$0.00</div>
                </div>
                
                <div className="bg-background dark:bg-gray-700 p-4 rounded-md">
                  <div className="text-sm text-muted-foreground">This Month</div>
                  <div className="text-2xl font-bold">$0.00</div>
                </div>
                
                <div className="bg-background dark:bg-gray-700 p-4 rounded-md">
                  <div className="text-sm text-muted-foreground">Unpaid Balance</div>
                  <div className="text-2xl font-bold">$0.00</div>
                </div>
              </div>
              
              <div className="bg-background dark:bg-gray-700 p-4 rounded-md h-64 flex items-center justify-center text-muted-foreground">
                Earnings chart will be displayed here
              </div>
            </TabsContent>
            
            <TabsContent value="plugins">
              <div className="bg-background dark:bg-gray-700 p-4 rounded-md">
                <p className="text-muted-foreground dark:text-gray-300 text-center py-8">
                  No plugin earnings data available yet.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="payouts">
              <div className="bg-background dark:bg-gray-700 p-4 rounded-md">
                <p className="text-muted-foreground dark:text-gray-300 text-center py-8">
                  No payout history available yet.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics">
              <div className="bg-background dark:bg-gray-700 p-4 rounded-md">
                <p className="text-muted-foreground dark:text-gray-300 text-center py-8">
                  User analytics will be displayed here.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
