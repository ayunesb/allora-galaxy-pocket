
import { useState } from "react";
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
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [invoiceHtml, setInvoiceHtml] = useState<string>("");
  const { tenant } = useTenant();
  const { user } = useAuth();
  
  const fetchAvailableMonths = async () => {
    if (!tenant?.id) return;
    
    try {
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
    }
  };
  
  const generateInvoice = async () => {
    if (!tenant?.id || !selectedMonth) {
      toast.error("Please select a billing period");
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-invoice-pdf", {
        body: {
          tenant_id: tenant.id,
          month: selectedMonth
        }
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
  
  const emailInvoice = async () => {
    if (!tenant?.id || !selectedMonth || !user?.email) {
      toast.error("Missing required information");
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-invoice-pdf", {
        body: {
          tenant_id: tenant.id,
          month: selectedMonth,
          email_to: user.email
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

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            fetchAvailableMonths();
            setDialogOpen(true);
          }}
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
              onEmail={emailInvoice}
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
