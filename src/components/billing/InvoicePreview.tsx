
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface InvoicePreviewProps {
  invoiceHtml: string;
  isGenerating: boolean;
}

export function InvoicePreview({ invoiceHtml, isGenerating }: InvoicePreviewProps) {
  const [iframeHeight, setIframeHeight] = useState(600);
  
  // When the invoice HTML changes, adjust iframe height
  useEffect(() => {
    const adjustHeight = () => {
      const iframe = document.getElementById('invoice-preview') as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        try {
          const height = iframe.contentWindow.document.body.scrollHeight;
          if (height > 200) {
            setIframeHeight(height + 20);
          }
        } catch (e) {
          console.error("Error adjusting iframe height:", e);
        }
      }
    };
    
    if (invoiceHtml) {
      // Allow time for the iframe to render
      setTimeout(adjustHeight, 500);
    }
  }, [invoiceHtml]);

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-sm text-muted-foreground">Generating invoice...</p>
      </div>
    );
  }

  if (!invoiceHtml) {
    return (
      <div className="flex flex-col items-center justify-center py-16 border rounded-lg">
        <p className="text-sm text-muted-foreground">Select a month and generate an invoice</p>
      </div>
    );
  }

  return (
    <iframe
      id="invoice-preview"
      srcDoc={invoiceHtml}
      className="w-full border rounded-lg"
      style={{ height: `${iframeHeight}px` }}
      title="Invoice Preview"
    />
  );
}
