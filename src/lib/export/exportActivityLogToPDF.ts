
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useSystemLogs } from '@/hooks/useSystemLogs';

interface ExportFilters {
  tenantId: string;
  dateRange?: number; // Days to look back
  actionType?: string;
  userId?: string;
  search?: string;
}

export async function exportActivityLogToPDF({
  tenantId,
  dateRange = 7,
  actionType,
  userId,
  search
}: ExportFilters): Promise<void> {
  try {
    // Calculate start date based on dateRange
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);
    
    // Build query
    let query = supabase
      .from("system_logs")
      .select(`
        id,
        user_id,
        event_type,
        message,
        meta,
        created_at
      `)
      .eq("tenant_id", tenantId)
      .gte("created_at", startDate.toISOString())
      .order("created_at", { ascending: false });
    
    // Apply filters
    if (actionType && actionType !== "all") {
      query = query.eq("event_type", actionType);
    }
    
    if (userId && userId !== "all") {
      query = query.eq("user_id", userId);
    }
    
    if (search) {
      query = query.ilike("message", `%${search}%`);
    }
    
    // Fetch logs
    const { data: logs, error } = await query;
    
    if (error) {
      console.error("Error fetching logs for PDF export:", error);
      throw error;
    }
    
    // Create PDF document
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(16);
    pdf.text('Team Activity Report', 14, 20);
    
    // Add export info
    pdf.setFontSize(10);
    const exportDate = format(new Date(), "MMMM d, yyyy 'at' h:mm a");
    pdf.text(`Generated on: ${exportDate}`, 14, 28);
    pdf.text(`Date Range: Last ${dateRange} days`, 14, 34);
    if (actionType && actionType !== "all") {
      pdf.text(`Action Type: ${actionType}`, 14, 40);
    }
    
    // Format data for table
    const tableData = logs?.map(log => [
      log.event_type,
      log.message?.substring(0, 40) + (log.message?.length > 40 ? '...' : '') || '',
      log.user_id || '',
      format(new Date(log.created_at), "MMM d, yyyy h:mm a"),
      log.meta ? JSON.stringify(log.meta).substring(0, 30) + '...' : ''
    ]) || [];
    
    // Add table
    autoTable(pdf, {
      startY: (actionType && actionType !== "all") ? 45 : 40,
      head: [['Event Type', 'Message', 'User', 'Timestamp', 'Details']],
      body: tableData,
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 60 },
        2: { cellWidth: 30 },
        3: { cellWidth: 35 },
        4: { cellWidth: 35 }
      }
    });
    
    // Add footer
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128);
      pdf.text(
        `Allora OS - Team Activity Report - Page ${i} of ${pageCount}`,
        pdf.internal.pageSize.getWidth() / 2,
        pdf.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Download PDF
    const fileName = `team-activity-report-${format(new Date(), "yyyy-MM-dd")}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Failed to generate PDF report:', error);
    throw error;
  }
}
