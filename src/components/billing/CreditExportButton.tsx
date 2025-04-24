
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/useTenant";
import { toast } from "sonner";

export function CreditExportButton() {
  const { tenant } = useTenant();
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async () => {
    if (!tenant?.id || isExporting) return;
    
    setIsExporting(true);
    try {
      const { data, error } = await supabase
        .from('credit_usage_log')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Convert to CSV
      const headers = ['Date', 'Agent', 'Module', 'Credits Used'];
      const csvData = data.map(row => [
        new Date(row.created_at).toLocaleDateString(),
        row.agent_name,
        row.module,
        row.credits_used
      ]);
      
      // Add headers
      csvData.unshift(headers);
      
      // Convert to CSV string
      const csvString = csvData.map(row => row.join(',')).join('\n');
      
      // Create download
      const blob = new Blob([csvString], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `credit-usage-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Credit usage exported successfully");
    } catch (err) {
      console.error("Error exporting credits:", err);
      toast.error("Failed to export credit usage");
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Export Usage
    </Button>
  );
}
