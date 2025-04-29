
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/hooks/useTenant';

export function useExportCSV() {
  const [isExporting, setIsExporting] = useState(false);
  const { tenant } = useTenant();

  // Check if table exists without using custom DB functions
  const checkTableExists = async (tableName: string): Promise<boolean> => {
    try {
      // Use a direct select with count to check if the table exists
      const query = supabase
        .from(tableName as any)
        .select('*', { count: 'exact', head: true });
      
      const { error } = await query;
      
      // If there's no error, the table exists
      return !error;
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
      
      // Use type assertion to avoid TypeScript errors
      let query = supabase.from(tableName as any).select('*');
      
      // Add tenant filter if applicable
      if (tenant?.id && tableName !== 'subscription_tiers') {
        query = query.eq('tenant_id', tenant.id);
      }
      
      // Apply additional filters if provided
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }
      
      // Use a type assertion to avoid TypeScript errors with the query
      const { data, error } = await query;
      
      if (error) throw error;

      // Convert the returned data to CSV
      if (!data || data.length === 0) {
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
