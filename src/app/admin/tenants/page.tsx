
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import AdminOnly from '@/guards/AdminOnly';

interface TenantAnalytics {
  tenant_id: string;
  tenant_name: string;
  created_at: string;
  total_users: number;
  total_strategies: number;
  total_campaigns: number;
  total_credits_used: number;
  max_users: number;
  storage_limit: number;
  analytics_enabled: boolean;
  auto_approve_campaigns: boolean;
  // Add these fields to match what comes from DB
  id: string;
  active_users?: number;
  mrr?: number;
  updated_at?: string;
}

export default function TenantsManagementPage() {
  const { data: tenants, isLoading } = useQuery({
    queryKey: ['tenant-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenant_analytics')
        .select('*');
      
      if (error) throw error;
      
      // Transform the data to match our TenantAnalytics interface
      return (data || []).map(item => ({
        tenant_id: item.tenant_id,
        tenant_name: item.tenant_name || 'Unnamed Tenant',
        id: item.id,
        created_at: item.created_at || '',
        updated_at: item.updated_at,
        active_users: item.active_users || 0,
        total_users: item.total_users || 0,
        total_strategies: item.total_strategies || 0,
        total_campaigns: item.total_campaigns || 0,
        mrr: item.mrr || 0,
        total_credits_used: item.total_credits_used || 0,
        max_users: item.max_users || 5,
        storage_limit: item.storage_limit || 1,
        analytics_enabled: item.analytics_enabled || false,
        auto_approve_campaigns: item.auto_approve_campaigns || false
      })) as TenantAnalytics[];
    }
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
              data={tenants || []} 
              searchKey="tenant_name"
            />
          </CardContent>
        </Card>
      </div>
    </AdminOnly>
  );
}
