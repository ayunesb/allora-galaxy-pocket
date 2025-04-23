
interface InvoicePreviewProps {
  invoiceHtml: string;
  isLoading: boolean;
}

export function InvoicePreview({ invoiceHtml, isLoading }: InvoicePreviewProps) {
  if (!invoiceHtml && !isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Select a billing period and generate an invoice to view it here
      </div>
    );
  }

  if (!invoiceHtml) return null;

  return (
    <div className="border rounded-md p-4 mt-4 max-h-[500px] overflow-auto">
      <div dangerouslySetInnerHTML={{ __html: invoiceHtml }} />
    </div>
  );
}
