'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTenant } from "@/hooks/useTenant";
import { useSystemLogs } from "@/hooks/useSystemLogs";

export default function KpiAddPage() {
  const [kpiName, setKpiName] = useState('');
  const [value, setValue] = useState('');
  const { toast } = useToast();
  const { tenant } = useTenant();
  const { logActivity } = useSystemLogs();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenant?.id) {
      toast({
        title: "Error",
        description: "No active workspace selected",
        variant: "destructive"
      });
      return;
    }

    if (!kpiName || !value) {
      toast({
        title: "Error",
        description: "KPI Name and Value are required",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate KPI creation
      console.log("Creating KPI:", { kpiName, value });

      // Log the activity
      if (tenant?.id) {
        await logActivity(
          'KPI_CREATED',
          'New KPI metric created',
          { metric: kpiName, value }
        );
      }

      toast({
        title: "Success",
        description: `KPI ${kpiName} created with value ${value}`,
      });

      // Clear the form
      setKpiName('');
      setValue('');

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create KPI",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New KPI</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="kpi-name">KPI Name</Label>
              <Input
                id="kpi-name"
                placeholder="Enter KPI name"
                value={kpiName}
                onChange={(e) => setKpiName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="kpi-value">Value</Label>
              <Input
                id="kpi-value"
                placeholder="Enter value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <Button type="submit">Create KPI</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
