
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";
import { useTenant } from "@/hooks/useTenant";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/export/exportCSV";

export function CreditExportButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { tenant } = useTenant();

  const downloadCreditLog = async () => {
    if (!tenant?.id) {
      toast.error("No tenant ID available");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('credit_usage_log')
        .select('*')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast.info("No credit usage data found");
        return;
      }

      exportToCSV(data, `allora-credits-${tenant.id}-${new Date().toISOString().split('T')[0]}`);
      toast.success("Credit usage log downloaded successfully");
    } catch (error) {
      console.error("Error downloading credit log:", error);
      toast.error("Failed to download credit usage log");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={downloadCreditLog} 
      disabled={isLoading}
    >
      {isLoading ? "Exporting..." : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Export Credits CSV
        </>
      )}
    </Button>
  );
}
