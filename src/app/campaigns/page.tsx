"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Campaign } from "@/types/campaign";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Link } from 'react-router-dom';
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTenant } from "@/hooks/useTenant";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResponsiveTable } from "@/components/ui/responsive-table";

export default function CampaignsPage() {
  const { tenant } = useTenant();
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ['campaigns', tenant?.id, search, selectedStatus],
    queryFn: async () => {
      if (!tenant?.id) return [];

      let query = supabase
        .from('campaigns')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.ilike('name', `%${search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching campaigns:", error);
        throw error;
      }

      return data as Campaign[];
    },
  });

  const statusFilter = (campaign: Campaign) => {
    if (!selectedStatus) return true;
    return campaign.status === selectedStatus;
  };

  const filteredCampaigns = campaigns?.filter(statusFilter) || [];

  const columns = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (value: string, row: Campaign) => (
        <Link to={`/campaigns/${row.id}`} className="hover:underline">
          {value}
        </Link>
      )
    },
    {
      header: "Status",
      accessorKey: "status"
    },
    {
      header: "Created At",
      accessorKey: "created_at"
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (value: any, row: Campaign) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Button asChild>
          <Link to="/campaigns/create">Create Campaign</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 mb-4">
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            type="search"
            id="search"
            placeholder="Search campaigns..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <Label>Status</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={selectedStatus || ''}
            onChange={(e) => setSelectedStatus(e.target.value === '' ? null : e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <Label>Date Range</Label>
          <DateRangePicker />
        </div>

        <div>
          <Label>Sort By</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            <option>Created Date</option>
            <option>Name</option>
          </select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign List</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveTable
            columns={columns}
            data={filteredCampaigns}
            isLoading={isLoading}
            emptyMessage="No campaigns found."
          />
        </CardContent>
      </Card>
    </div>
  );
}
