
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from './useTenant';
import { useToast } from './use-toast';

export function useExportCSV() {
  const [isExporting, setIsExporting] = useState(false);
  const { tenant } = useTenant();
  const { toast } = useToast();

  const exportTable = async (
    tableName: string,
    filters: Record<string, any> = {}
  ): Promise<string | null> => {
    if (!tenant?.id) {
      toast({
        title: 'Export Failed',
        description: 'No active workspace found',
        variant: 'destructive',
      });
      return null;
    }

    setIsExporting(true);

    try {
      // Use custom RPC function to check if the table exists
      const { data: tableExists, error: tableError } = await supabase
        .rpc('check_table_exists', { table_name: tableName });

      if (tableError) {
        console.error('Error checking table:', tableError);
        throw new Error(`Could not verify table access: ${tableError.message}`);
      }

      if (!tableExists) {
        throw new Error(`Table ${tableName} doesn't exist or you don't have access`);
      }

      // Use a custom RPC function for export to avoid type errors
      const { data, error } = await supabase
        .rpc('export_table_data', { 
          p_table_name: tableName,
          p_tenant_id: tenant.id,
          p_filters: filters
        });

      if (error) {
        console.error('Export error:', error);
        throw error;
      }

      if (!data || !Array.isArray(data) || data.length === 0) {
        toast({
          title: 'Export Notice',
          description: 'No data available to export',
        });
        return null;
      }

      // Convert data to CSV
      const csvContent = convertToCSV(data);
      
      // Create a Blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // Log the export
      await supabase
        .from('export_logs')
        .insert({
          export_type: tableName,
          delivery_method: 'download',
          status: 'completed',
          tenant_id: tenant.id,
          user_id: (await supabase.auth.getUser()).data.user?.id || '',
        });

      return url;
    } catch (err: any) {
      console.error('Export error:', err);
      toast({
        title: 'Export Failed',
        description: err.message || 'Failed to export data',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsExporting(false);
    }
  };

  // Helper function to convert data to CSV format
  const convertToCSV = (data: any[]): string => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle special cases (commas, quotes, nulls)
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value).replace(/"/g, '""');
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');
    
    return csv;
  };

  return {
    exportTable,
    isExporting,
  };
}
