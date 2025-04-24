
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import { InvoiceMonthSelector } from "./InvoiceMonthSelector";
import { InvoiceActions } from "./InvoiceActions";
import { InvoicePreview } from "./InvoicePreview";

export function InvoiceGenerator() {
  const { tenant } = useTenant();
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [invoiceHtml, setInvoiceHtml] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Fetch available billing months from Supabase
  const fetchAvailableMonths = async () => {
    if (!tenant?.id) return;
    try {
      setIsLoading(true);
      // Use credit_usage_log to find months with billing activity
      const { data, error } = await supabase
        .from('credit_usage_log')
        .select('created_at')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        // Extract unique months in YYYY-MM format
        const months = [...new Set(data.map(item => {
          const date = new Date(item.created_at);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }))];
        
        setAvailableMonths(months);
        if (months.length > 0) {
          setSelectedMonth(months[0]);
        }
      } else {
        toast.info("No billing data available");
      }
    } catch (error) {
      console.error("Error fetching billing months:", error);
      toast.error("Failed to fetch billing periods");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate invoice html
  const generateInvoice = async () => {
    if (!tenant?.id || !selectedMonth) {
      toast.error("Please select a billing period");
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: { 
          tenantId: tenant.id, 
          month: selectedMonth 
        }
      });
      
      if (error) throw error;
      
      if (data?.html) {
        setInvoiceHtml(data.html);
      } else {
        throw new Error("No invoice data returned");
      }
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error("Failed to generate invoice");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Download as PDF
  const downloadInvoice = () => {
    if (!invoiceHtml) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Pop-up blocked. Please allow pop-ups and try again.");
      return;
    }
    
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
  
  // View invoice
  const viewInvoice = () => {
    if (!invoiceHtml) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Pop-up blocked. Please allow pop-ups and try again.");
      return;
    }
    
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };
  
  // Fetch months when dialog opens
  useEffect(() => {
    if (dialogOpen) {
      fetchAvailableMonths();
    }
  }, [dialogOpen, tenant?.id]);
  
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="mr-2 h-4 w-4" />
          Generate Invoice
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Invoice Generator</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <InvoiceMonthSelector
              availableMonths={availableMonths}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
              isDisabled={isLoading}
            />
            
            <Button 
              onClick={generateInvoice} 
              disabled={isLoading || !selectedMonth}
            >
              Generate Invoice
            </Button>
          </div>
          
          <InvoicePreview invoiceHtml={invoiceHtml} isGenerating={isLoading} />
          
          <InvoiceActions
            invoiceHtml={invoiceHtml}
            isGenerating={isLoading}
            onDownload={downloadInvoice}
            onPrint={viewInvoice}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
