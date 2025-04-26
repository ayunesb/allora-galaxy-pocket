
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SystemLog } from '@/types/systemLog';

/**
 * Export logs to CSV or PDF format
 */
export async function exportLogs(logs: SystemLog[], exportFormat: 'csv' | 'pdf'): Promise<void> {
  if (!logs || logs.length === 0) {
    throw new Error('No logs to export');
  }

  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  const filename = `system_logs_${timestamp}`;

  if (exportFormat === 'csv') {
    return exportLogsToCSV(logs, filename);
  } else {
    return exportLogsToPDF(logs, filename);
  }
}

/**
 * Export logs to CSV format
 */
function exportLogsToCSV(logs: SystemLog[], filename: string): void {
  // Generate CSV header row
  const header = ['Timestamp', 'Event Type', 'Severity', 'Service', 'Message'];
  
  // Generate CSV data rows
  const rows = logs.map(log => [
    format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
    log.event_type || '',
    log.severity || log.meta?.severity || 'info',
    log.service || 'system',
    log.message || ''
  ]);

  // Combine header and rows
  const csvContent = [
    header.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  // Create a Blob and download the file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, `${filename}.csv`);
}

/**
 * Export logs to PDF format
 */
function exportLogsToPDF(logs: SystemLog[], filename: string): void {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text('System Logs Report', 14, 15);
  
  // Add generation timestamp
  doc.setFontSize(10);
  doc.text(`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 14, 22);
  
  // Prepare table data
  const tableData = logs.map(log => [
    format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
    log.event_type || '',
    log.severity || log.meta?.severity || 'info',
    log.service || 'system',
    log.message || ''
  ]);
  
  // Generate table
  autoTable(doc, {
    head: [['Timestamp', 'Event Type', 'Severity', 'Service', 'Message']],
    body: tableData,
    startY: 25,
    styles: { fontSize: 8, cellPadding: 1 },
    headStyles: { fillColor: [66, 66, 66] },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 30 },
      2: { cellWidth: 20 },
      3: { cellWidth: 20 },
      4: { cellWidth: 'auto' }
    }
  });
  
  // Save the PDF
  doc.save(`${filename}.pdf`);
}
