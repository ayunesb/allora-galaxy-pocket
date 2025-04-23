
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Mail } from "lucide-react";

interface InvoiceActionsProps {
  onGenerate: () => void;
  onEmail: () => void;
  isLoading: boolean;
  selectedMonth: string;
}

export function InvoiceActions({ onGenerate, onEmail, isLoading, selectedMonth }: InvoiceActionsProps) {
  return (
    <>
      <Button 
        onClick={onGenerate} 
        disabled={isLoading || !selectedMonth}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
        Generate Invoice
      </Button>
      
      <Button 
        variant="outline" 
        onClick={onEmail} 
        disabled={isLoading || !selectedMonth}
      >
        <Mail className="h-4 w-4 mr-2" />
        Email Invoice
      </Button>
    </>
  );
}
