
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/hooks/useTenant";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

export default function ExportPanel() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(false);

  const downloadCSV = async (type: 'strategies' | 'leads' | 'kpis') => {
    if (!tenant?.id || !user?.id) {
      toast.error("Please log in to export data");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-data', {
        body: {
          type,
          tenantId: tenant.id,
          userId: user.id
        }
      });

      if (error) throw error;

      // Create blob and trigger download
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`${type} exported successfully`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const emailExport = async (type: 'strategies' | 'leads' | 'kpis') => {
    if (!tenant?.id || !user?.id) {
      toast.error("Please log in to export data");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-data', {
        body: {
          type,
          tenantId: tenant.id,
          userId: user.id,
          delivery: 'email'
        }
      });

      if (error) throw error;
      toast.success('Export email sent');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Data Export Center</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(['strategies', 'kpis'] as const).map((type) => (
              <div 
                key={type}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <span className="capitalize font-medium">{type}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadCSV(type)}
                    disabled={isLoading}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download CSV
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => emailExport(type)}
                    disabled={isLoading}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Export
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
