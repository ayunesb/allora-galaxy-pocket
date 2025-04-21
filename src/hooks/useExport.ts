
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "./useTenant";
import { useAuth } from "./useAuth";
import { useState } from "react";
import { toast } from "@/components/ui/sonner";

export function useExport() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const downloadCSV = async (type: 'strategies' | 'leads' | 'kpis') => {
    setIsLoading(true);
    try {
      // Fetch data from Supabase based on type
      const { data, error } = await supabase
        .from(type === 'strategies' ? 'vault_strategies' : 'kpi_metrics')
        .select('*')
        .eq('tenant_id', tenant?.id);

      if (error) throw error;

      // Convert data to CSV
      const csvContent = data.map(item => 
        Object.values(item).join(',')
      ).join('\n');

      // Trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${type}_export.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`${type} exported successfully`);
    } catch (error) {
      toast.error('Export failed', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const emailExport = async (type: 'strategies' | 'leads' | 'kpis') => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-data', {
        body: JSON.stringify({
          type,
          tenantId: tenant?.id,
          userId: user?.id
        })
      });

      if (error) throw error;

      toast.success('Export email sent');
    } catch (error) {
      toast.error('Export failed', { description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return { downloadCSV, emailExport, isLoading };
}
