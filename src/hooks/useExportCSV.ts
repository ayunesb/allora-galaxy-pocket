
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';

export function useExportCSV() {
  const [isExporting, setIsExporting] = useState(false);
  const { tenant } = useTenant();

  // Check if table exists first (in a type-safe way)
  const checkTableExists = async (tableName: string): Promise<boolean> => {
    try {
      // Query pg_tables using a custom stored procedure
      const { data, error } = await supabase.rpc('check_table_exists', {
        table_name: tableName
      });
      
      if (error) throw error;
      return !!data;
    } catch (err) {
      console.error(`Error checking if table ${tableName} exists:`, err);
      return false;
    }
  };

  const exportTable = async (tableName: string, filters?: Record<string, any>): Promise<string> => {
    setIsExporting(true);
    try {
      // Check if tenant is required and available
      if (!tenant?.id && tableName !== 'subscription_tiers') {
        throw new Error('No active tenant');
      }
      
      // For safety, first ensure the table exists
      const tableExists = await checkTableExists(tableName);
      
      if (!tableExists) {
        throw new Error(`Table "${tableName}" does not exist`);
      }
      
      // Use the export_table_data RPC function
      const { data, error } = await supabase.rpc('export_table_data', {
        p_table_name: tableName,
        p_tenant_id: tenant?.id || null
      });
      
      if (error) throw error;

      // Convert the returned data to CSV
      if (!data || !Array.isArray(data) || data.length === 0) {
        return 'No data found';
      }
      
      // Get headers from the first object
      const headers = Object.keys(data[0]);
      
      // Create CSV content
      let csvContent = headers.join(',') + '\n';
      
      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header];
          // Handle different value types
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return '"' + JSON.stringify(value).replace(/"/g, '""') + '"';
          return '"' + String(value).replace(/"/g, '""') + '"';
        });
        csvContent += values.join(',') + '\n';
      });
      
      return csvContent;
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    } finally {
      setIsExporting(false);
    }
  };

  return { exportTable, isExporting };
}
