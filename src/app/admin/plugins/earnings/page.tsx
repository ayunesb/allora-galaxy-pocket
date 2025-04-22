
"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type PluginEarnings = {
  plugin_id: string;
  plugin_name: string;
  total_earned: number;
  sales_count: number;
};

export default function PluginEarningsPage() {
  const [earnings, setEarnings] = useState<PluginEarnings[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEarnings() {
      const { data, error } = await supabase.rpc('get_plugin_earnings');
      
      if (error) {
        console.error('Error fetching earnings:', error);
        return;
      }
      
      setEarnings(data || []);
      setIsLoading(false);
    }

    fetchEarnings();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">💰 Plugin Earnings Dashboard</h1>
      
      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Earnings Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${earnings.reduce((sum, e) => sum + Number(e.total_earned), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Earnings by Plugin</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plugin</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">Total Earned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earnings.map((e) => (
                <TableRow key={e.plugin_id}>
                  <TableCell className="font-medium">{e.plugin_name}</TableCell>
                  <TableCell className="text-right">{e.sales_count}</TableCell>
                  <TableCell className="text-right">${Number(e.total_earned).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
