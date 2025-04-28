import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import AdminOnly from '@/guards/AdminOnly';
import { useState } from 'react';

interface TenantAnalytics {
  tenant_id: string;
  tenant_name?: string;
  id: string;
  created_at: string;
  updated_at?: string;
  active_users?: number;
  total_users?: number;
  total_strategies?: number;
  total_campaigns?: number;
  mrr?: number;
  total_credits_used?: number;
  max_users?: number;
  storage_limit?: number;
  analytics_enabled?: boolean;
  auto_approve_campaigns?: boolean;
}

const fetchTenantAnalytics = async (): Promise<TenantAnalytics[]> => {
  const { data, error } = await supabase
    .from('tenant_analytics')
    .select('*');
    
  if (error) throw error;
  
  return (data || []).map(item => ({
    id: item.id,
    tenant_id: item.tenant_id,
    tenant_name: item.tenant_id, // Using tenant_id as a fallback
    active_users: item.active_users || 0,
    total_users: 0, // Default value
    total_strategies: item.total_strategies || 0,
    total_campaigns: 0, // Default value
    total_credits_used: 0, // Default value
    mrr: item.mrr || 0,
    max_users: 10, // Default value
    storage_limit: 5, // Default value in GB
    analytics_enabled: true, // Default value
    auto_approve_campaigns: true, // Default value
    updated_at: item.updated_at,
    created_at: item.created_at
  }));
};

export default function TenantsManagementPage() {
  const { data: tenantAnalytics = [], isLoading } = useQuery<TenantAnalytics[], Error>({
    queryKey: ['tenant-analytics'],
    queryFn: fetchTenantAnalytics
  });

  const columns: ColumnDef<TenantAnalytics>[] = [
    {
      accessorKey: 'tenant_name',
      header: 'Workspace Name',
    },
    {
      accessorKey: 'total_users',
      header: 'Users',
    },
    {
      accessorKey: 'total_strategies',
      header: 'Strategies',
    },
    {
      accessorKey: 'total_campaigns',
      header: 'Campaigns',
    },
    {
      accessorKey: 'total_credits_used',
      header: 'Credits Used',
    },
    {
      id: 'actions',
      cell: () => (
        <div className="flex gap-2">
          <Button variant="outline" size="icon" title="Edit">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="destructive" size="icon" title="Delete">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <AdminOnly>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Workspace Management</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Workspace Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable 
              columns={columns} 
              data={tenantAnalytics || []} 
              searchKey="tenant_name"
            />
          </CardContent>
        </Card>
      </div>
    </AdminOnly>
  );
}
