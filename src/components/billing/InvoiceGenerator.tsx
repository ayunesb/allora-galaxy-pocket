
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useTenant } from "@/hooks/useTenant";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, FileText, Mail } from "lucide-react";
import { format } from "date-fns";

export function InvoiceGenerator() {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [invoiceHtml, setInvoiceHtml] = useState<string>("");
  const { tenant } = useTenant();
  const { user } = useAuth();
  
  // Fetch available billing months when dialog opens
  const fetchAvailableMonths = async () => {
    if (!tenant?.id) return;
    
    try {
      const { data, error } = await supabase.rpc('get_tenant_billing_months', {
        p_tenant_id: tenant.id
      });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        setAvailableMonths(data);
        // Default to most recent month
        setSelectedMonth(data[0]);
      } else {
        toast.info("No billing data available");
      }
    } catch (error) {
      console.error("Error fetching billing months:", error);
      toast.error("Failed to fetch billing periods");
    }
  };
  
  // Generate and view invoice
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
  
  // Email invoice
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
  
  // Format date strings for display
  const formatMonthOption = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMMM yyyy");
    } catch (e) {
      return dateStr;
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
            <Select 
              value={selectedMonth} 
              onValueChange={setSelectedMonth}
              disabled={isLoading || availableMonths.length === 0}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {formatMonthOption(month)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              onClick={generateInvoice} 
              disabled={isLoading || !selectedMonth}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
              Generate Invoice
            </Button>
            
            <Button 
              variant="outline" 
              onClick={emailInvoice} 
              disabled={isLoading || !selectedMonth}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Invoice
            </Button>
          </div>
          
          {invoiceHtml && (
            <div className="border rounded-md p-4 mt-4 max-h-[500px] overflow-auto">
              <div dangerouslySetInnerHTML={{ __html: invoiceHtml }} />
            </div>
          )}
          
          {!invoiceHtml && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              Select a billing period and generate an invoice to view it here
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
