
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
}

export default function TenantsManagementPage() {
  const { data: tenants, isLoading } = useQuery<TenantAnalytics[]>({
    queryKey: ['tenant-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenant_analytics')
        .select('*');
      
      if (error) throw error;
      return data || [];
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
