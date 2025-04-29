
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SystemLog } from "@/types/systemLog";
import { ToastService } from "@/services/ToastService";
import { Check, Download } from "lucide-react";

interface LogExportOptionsProps {
  logs: SystemLog[];
  onClose: () => void;
}

export function LogExportOptions({ logs, onClose }: LogExportOptionsProps) {
  const [exporting, setExporting] = useState(false);
  const [format, setFormat] = useState<"json" | "csv">("csv");

  const handleExport = async () => {
    setExporting(true);
    
    try {
      let content: string;
      let filename: string;
      let mimeType: string;
      
      if (format === "json") {
        content = JSON.stringify(logs, null, 2);
        filename = `system-logs-${new Date().toISOString().slice(0, 10)}.json`;
        mimeType = "application/json";
      } else {
        // CSV format
        const headers = "ID,Event Type,Message,Created At,User ID,Tenant ID\n";
        const rows = logs.map(log => {
          return `"${log.id}","${log.event_type}","${log.message.replace(/"/g, '""')}","${log.created_at}","${log.user_id || ''}","${log.tenant_id || ''}"`;
        }).join("\n");
        content = headers + rows;
        filename = `system-logs-${new Date().toISOString().slice(0, 10)}.csv`;
        mimeType = "text/csv";
      }
      
      // Create blob and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      ToastService.success({
        title: "Export complete",
        description: `${logs.length} logs exported to ${format.toUpperCase()}`
      });
      
      onClose();
    } catch (error) {
      console.error("Export error:", error);
      ToastService.error({
        title: "Export failed",
        description: "Could not export logs. Please try again."
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => !exporting && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Logs</DialogTitle>
          <DialogDescription>
            Export {logs.length} system logs to your preferred format.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex justify-center gap-4">
            <Button 
              variant={format === "csv" ? "default" : "outline"} 
              className="w-32"
              onClick={() => setFormat("csv")}
            >
              {format === "csv" && <Check className="mr-2 h-4 w-4" />}
              CSV
            </Button>
            <Button 
              variant={format === "json" ? "default" : "outline"} 
              className="w-32"
              onClick={() => setFormat("json")}
            >
              {format === "json" && <Check className="mr-2 h-4 w-4" />}
              JSON
            </Button>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={exporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Exporting...
              </span>
            ) : (
              <span className="flex items-center">
                <Download className="mr-2 h-4 w-4" />
                Export
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
