
import { Button } from "@/components/ui/button";
import { Download, Eye, Loader2 } from "lucide-react";

interface InvoiceActionsProps {
  invoiceHtml: string;
  isGenerating: boolean;
  onDownload: () => void;
  onPrint: () => void;
}

export function InvoiceActions({ 
  invoiceHtml, 
  isGenerating, 
  onDownload, 
  onPrint 
}: InvoiceActionsProps) {
  
  return (
    <div className="flex justify-end space-x-2 mt-4">
      <Button 
        variant="outline" 
        size="sm"
        onClick={onPrint}
        disabled={isGenerating || !invoiceHtml}
      >
        <Eye className="mr-2 h-4 w-4" />
        View
      </Button>
      
      <Button 
        onClick={onDownload}
        disabled={isGenerating || !invoiceHtml}
      >
        {isGenerating ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Download
      </Button>
    </div>
  );
}
