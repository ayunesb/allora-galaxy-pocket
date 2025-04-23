
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

function useBillingPeriods(initialOpen: boolean = false) {
  const { tenant } = useTenant();
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [invoiceHtml, setInvoiceHtml] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(initialOpen);
  
  // Fetch available billing months from Supabase RPC
  const fetchAvailableMonths = async () => {
    if (!tenant?.id) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase.rpc('get_tenant_billing_months', {
        p_tenant_id: tenant.id
      });
      if (error) throw error;
      if (data && data.length > 0) {
        setAvailableMonths(data);
        setSelectedMonth(data[0]);
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
  
  // Generate invoice html via Supabase Edge Function
  const generateInvoice = async () => {
    if (!tenant?.id || !selectedMonth) {
      toast.error("Please select a billing period");
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-invoice-pdf", {
        body: { tenant_id: tenant.id, month: selectedMonth }
      });
      if (error) throw error;
      if (data.invoiceHtml) {
        setInvoiceHtml(data.invoiceHtml);
        toast.success("Invoice generated successfully");
      } else {
        toast.info("No invoice data for the selected period");
      }
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error("Failed to generate invoice");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Email invoice using Supabase Edge Function
  const emailInvoice = async (userEmail?: string | null) => {
    if (!tenant?.id || !selectedMonth || !userEmail) {
      toast.error("Missing required information");
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke("generate-invoice-pdf", {
        body: {
          tenant_id: tenant.id,
          month: selectedMonth,
          email_to: userEmail
        }
      });
      
      if (error) throw error;
      
      toast.success("Invoice emailed successfully");
    } catch (error) {
      console.error("Error emailing invoice:", error);
      toast.error("Failed to email invoice");
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    availableMonths,
    selectedMonth,
    setSelectedMonth,
    isLoading,
    invoiceHtml,
    dialogOpen,
    setDialogOpen,
    fetchAvailableMonths,
    generateInvoice,
    emailInvoice,
  };
}

export function InvoiceGenerator() {
  const { user } = useAuth();
  const {
    availableMonths,
    selectedMonth,
    setSelectedMonth,
    isLoading,
    invoiceHtml,
    dialogOpen,
    setDialogOpen,
    fetchAvailableMonths,
    generateInvoice,
    emailInvoice,
  } = useBillingPeriods();
  
  // When dialog opens, fetch available months
  useEffect(() => {
    if (dialogOpen) {
      fetchAvailableMonths();
    }
  }, [dialogOpen]);
  
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setDialogOpen(true)}
        >
          <FileText className="h-4 w-4 mr-2" />
          View Invoices
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Credit Usage Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <InvoiceMonthSelector 
              selectedMonth={selectedMonth}
              availableMonths={availableMonths}
              onSelectMonth={setSelectedMonth}
              isLoading={isLoading}
            />

            <InvoiceActions 
              onGenerate={generateInvoice}
              onEmail={() => emailInvoice(user?.email)}
              isLoading={isLoading}
              selectedMonth={selectedMonth}
            />
          </div>

          <InvoicePreview 
            invoiceHtml={invoiceHtml}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
