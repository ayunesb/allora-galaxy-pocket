
import { useState } from "react";
import { useExportCSV } from "./useExportCSV";
import { useExportPDF } from "./useExportPDF";

/**
 * useExportService - combines CSV, PDF, and Email export with shared loading state.
 */
export function useExportService() {
  const [isLoading, setIsLoading] = useState(false);
  const { downloadCSV } = useExportCSV();
  const { downloadPDF, emailReport } = useExportPDF();

  // Proxy download handlers to set loading state for shared UX
  const proxy = (fn: (...args: any[]) => Promise<any>) => async (...args: any[]) => {
    setIsLoading(true);
    try {
      await fn(...args);
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    downloadCSV: proxy(downloadCSV), 
    downloadPDF: proxy(downloadPDF), 
    emailReport: proxy(emailReport),
    isLoading
  };
}
