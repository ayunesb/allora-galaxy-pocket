import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { useSystemLogs } from '@/hooks/useSystemLogs';

// Type definitions for export functionality
export interface ExportFilters {
  tenantId: string;
  dateRange?: number;
  type?: 'strategy' | 'campaign' | 'kpi' | 'system';
  userId?: string;
  search?: string;
  groupBy?: 'strategy' | 'channel' | 'date';
}

export interface ExportOptions {
  includeMetadata?: boolean;
  includeCharts?: boolean;
  emailTo?: string[];
  attachCoverPage?: boolean;
}

/**
 * Main export function that handles different types of exports
 */
export async function exportToPDF(
  filters: ExportFilters,
  options: ExportOptions = {}
): Promise<{ url: string; fileName: string }> {
  try {
    // Generate unique file name
    const fileName = `allora-report-${filters.tenantId}-${format(new Date(), "yyyy-MM-dd")}.pdf`;
    
    // Create PDF document
    const pdf = new jsPDF();
    
    // Add cover page if requested
    if (options.attachCoverPage) {
      await addCoverPage(pdf, filters);
    }
    
    // Fetch data based on export type
    switch (filters.type) {
      case 'strategy':
        const strategyData = await fetchStrategyData(filters);
        await addStrategyReport(pdf, strategyData, filters);
        break;
        
      case 'campaign':
        const campaignData = await fetchCampaignData(filters);
        await addCampaignReport(pdf, campaignData, filters);
        break;
        
      case 'kpi':
        const kpiData = await fetchKpiData(filters);
        await addKpiReport(pdf, kpiData, filters);
        break;
        
      case 'system':
        const systemLogsData = await fetchSystemLogsData(filters);
        await addSystemLogsReport(pdf, systemLogsData, filters);
        break;
        
      default:
        // Default to system logs if no type specified
        const defaultData = await fetchSystemLogsData(filters);
        await addSystemLogsReport(pdf, defaultData, filters);
    }
    
    // Add footer with page numbers
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128);
      pdf.text(
        `Allora OS - ${getReportTypeName(filters.type)} - Page ${i} of ${pageCount}`,
        pdf.internal.pageSize.getWidth() / 2,
        pdf.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save PDF to file storage or return as blob
    const pdfBlob = pdf.output('blob');
    
    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('export-reports')
      .upload(`reports/${fileName}`, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true
      });
      
    if (uploadError) {
      console.error('Error uploading PDF:', uploadError);
      throw uploadError;
    }
    
    // Get the file URL
    const { data: urlData } = await supabase
      .storage
      .from('export-reports')
      .createSignedUrl(`reports/${fileName}`, 60 * 60 * 24); // 24 hours expiry
      
    // Log the export event
    await logExportEvent(filters, fileName);
    
    // If email delivery is requested
    if (options.emailTo && options.emailTo.length > 0) {
      await emailReport(urlData?.signedUrl, fileName, options.emailTo, filters);
    }
    
    // Save export record in export_logs table
    await saveExportLog(filters, fileName, urlData?.signedUrl);
    
    return {
      url: urlData?.signedUrl || '',
      fileName
    };
  } catch (error) {
    console.error('Failed to generate PDF report:', error);
    throw error;
  }
}

/**
 * Add cover page to the PDF
 */
async function addCoverPage(pdf: jsPDF, filters: ExportFilters): Promise<void> {
  // Fetch tenant info
  const { data: tenantData } = await supabase
    .from('tenant_profiles')
    .select('name')
    .eq('id', filters.tenantId)
    .single();
    
  // Add title
  pdf.setFontSize(22);
  pdf.setTextColor(41, 128, 185);
  pdf.text('Allora OS Report', 20, 40);
  
  pdf.setFontSize(16);
  pdf.setTextColor(0);
  pdf.text(tenantData?.name || 'Tenant Report', 20, 55);
  
  // Add report info
  pdf.setFontSize(12);
  pdf.text(`Report Type: ${getReportTypeName(filters.type)}`, 20, 75);
  pdf.text(`Generated on: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`, 20, 85);
  pdf.text(`Date Range: Last ${filters.dateRange || 7} days`, 20, 95);
  
  if (filters.userId) {
    pdf.text(`Filtered by User: ${filters.userId}`, 20, 105);
  }
  
  // Add decorative element
  pdf.setDrawColor(41, 128, 185);
  pdf.setLineWidth(0.5);
  pdf.line(20, 115, 190, 115);
  
  // Add new page for data
  pdf.addPage();
}

/**
 * Fetch strategy data from vault_strategies
 */
async function fetchStrategyData(filters: ExportFilters): Promise<any[]> {
  // Calculate start date based on dateRange
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (filters.dateRange || 7));
  
  // Build query for strategies
  let query = supabase
    .from('vault_strategies')
    .select(`
      id,
      title,
      description,
      industry,
      goal,
      confidence,
      status,
      created_at,
      updated_at
    `)
    .eq('tenant_id', filters.tenantId)
    .gte('created_at', startDate.toISOString());
  
  // Apply additional filters
  if (filters.userId) {
    // This would require a join if strategies have user_id
    // For now we'll skip this filter for strategies
  }
  
  if (filters.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching strategy data:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Add strategy report to PDF
 */
async function addStrategyReport(pdf: jsPDF, data: any[], filters: ExportFilters): Promise<void> {
  // Add title
  pdf.setFontSize(16);
  pdf.text('Strategy Report', 14, 20);
  
  // Add export info
  pdf.setFontSize(10);
  pdf.text(`Date Range: Last ${filters.dateRange || 7} days`, 14, 28);
  pdf.text(`Total Strategies: ${data.length}`, 14, 34);
  
  // Format data for table
  const tableData = data.map(item => [
    item.title,
    item.industry || 'N/A',
    item.goal || 'N/A',
    item.status,
    item.confidence || 'N/A',
    format(new Date(item.created_at), "MMM d, yyyy")
  ]);
  
  // Add table
  autoTable(pdf, {
    startY: 40,
    head: [['Strategy Title', 'Industry', 'Goal', 'Status', 'Confidence', 'Created Date']],
    body: tableData,
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8,
      cellPadding: 3
    }
  });
}

/**
 * Fetch campaign data
 */
async function fetchCampaignData(filters: ExportFilters): Promise<any[]> {
  // Calculate start date based on dateRange
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (filters.dateRange || 7));
  
  // Build query for campaigns
  let query = supabase
    .from('campaigns')
    .select(`
      id,
      name,
      description,
      status,
      scripts,
      created_at,
      updated_at
    `)
    .eq('tenant_id', filters.tenantId)
    .gte('created_at', startDate.toISOString());
  
  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching campaign data:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Add campaign report to PDF
 */
async function addCampaignReport(pdf: jsPDF, data: any[], filters: ExportFilters): Promise<void> {
  // Add title
  pdf.setFontSize(16);
  pdf.text('Campaign Report', 14, 20);
  
  // Add export info
  pdf.setFontSize(10);
  pdf.text(`Date Range: Last ${filters.dateRange || 7} days`, 14, 28);
  pdf.text(`Total Campaigns: ${data.length}`, 14, 34);
  
  // Format data for table
  const tableData = data.map(item => [
    item.name,
    item.description ? (item.description.substring(0, 30) + '...') : 'N/A',
    item.status,
    format(new Date(item.created_at), "MMM d, yyyy")
  ]);
  
  // Add table
  autoTable(pdf, {
    startY: 40,
    head: [['Campaign Name', 'Description', 'Status', 'Created Date']],
    body: tableData,
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8,
      cellPadding: 3
    }
  });
}

/**
 * Update type definitions for KPI data
 */
interface KpiData {
  current: {
    metric: string;
    value: number;
    recorded_at: string;
  }[];
  history: {
    metric: string;
    value: number;
    recorded_at: string;
  }[];
}

/**
 * Fetch KPI data
 */
async function fetchKpiData(filters: ExportFilters): Promise<KpiData> {
  // Calculate start date based on dateRange
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (filters.dateRange || 7));
  
  // Build query for KPI metrics
  let query = supabase
    .from('kpi_metrics')
    .select('*')
    .eq('tenant_id', filters.tenantId)
    .gte('created_at', startDate.toISOString());
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching KPI data:', error);
    throw error;
  }
  
  // Also fetch historical data for trends
  const { data: historyData, error: historyError } = await supabase
    .from('kpi_metrics_history')
    .select('*')
    .eq('tenant_id', filters.tenantId)
    .gte('recorded_at', startDate.toISOString())
    .order('recorded_at', { ascending: false });
    
  if (historyError) {
    console.error('Error fetching KPI history data:', historyError);
  }
  
  // Combine current data with history
  return {
    current: data || [],
    history: historyData || []
  };
}

/**
 * Add KPI report to PDF
 */
async function addKpiReport(pdf: jsPDF, data: KpiData, filters: ExportFilters): Promise<void> {
  const current = data.current;
  const history = data.history;
  
  // Add title
  pdf.setFontSize(16);
  pdf.text('KPI Metrics Report', 14, 20);
  
  // Add export info
  pdf.setFontSize(10);
  pdf.text(`Date Range: Last ${filters.dateRange || 7} days`, 14, 28);
  pdf.text(`Total Metrics: ${current.length}`, 14, 34);
  
  // Format current KPI data for table
  const tableData = current.map(item => [
    item.metric,
    item.value.toString(),
    format(new Date(item.recorded_at), "MMM d, yyyy")
  ]);
  
  // Add table
  autoTable(pdf, {
    startY: 40,
    head: [['Metric', 'Value', 'Recorded Date']],
    body: tableData,
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 8,
      cellPadding: 3
    }
  });

  // Add history section
  if (history.length > 0) {
    pdf.addPage();
    pdf.setFontSize(16);
    pdf.text('KPI Historical Trends', 14, 20);
    
    const metricGroups = history.reduce((acc: any, item: any) => {
      if (!acc[item.metric]) acc[item.metric] = [];
      acc[item.metric].push(item);
      return acc;
    }, {});
    
    let yOffset = 30;
    Object.entries(metricGroups).forEach(([metric, items]: [string, any]) => {
      pdf.setFontSize(12);
      pdf.text(`Metric: ${metric}`, 14, yOffset);
      yOffset += 10;
      
      const historyData = items.map((item: any) => [
        format(new Date(item.recorded_at), "MMM d, yyyy"),
        item.value.toString()
      ]);
      
      autoTable(pdf, {
        startY: yOffset,
        head: [['Date', 'Value']],
        body: historyData,
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold'
        },
        styles: {
          fontSize: 8,
          cellPadding: 3
        }
      });
      
      yOffset = (pdf as any).lastAutoTable.finalY + 15;
      
      if (yOffset > pdf.internal.pageSize.getHeight() - 40) {
        pdf.addPage();
        yOffset = 20;
      }
    });
  }
}

/**
 * Fetch system logs data
 */
async function fetchSystemLogsData(filters: ExportFilters): Promise<any[]> {
  // Calculate start date based on dateRange
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (filters.dateRange || 7));
  
  // Build query
  let query = supabase
    .from("system_logs")
    .select('*')
    .eq("tenant_id", filters.tenantId)
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: false });
  
  // Apply filters
  if (filters.userId) {
    query = query.eq("user_id", filters.userId);
  }
  
  if (filters.search) {
    query = query.ilike("message", `%${filters.search}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching system logs data:", error);
    throw error;
  }
  
  return data || [];
}

/**
 * Add system logs report to PDF
 */
async function addSystemLogsReport(pdf: jsPDF, data: any[], filters: ExportFilters): Promise<void> {
  // Add title
  pdf.setFontSize(16);
  pdf.text('System Activity Report', 14, 20);
  
  // Add export info
  pdf.setFontSize(10);
  const exportDate = format(new Date(), "MMMM d, yyyy 'at' h:mm a");
  pdf.text(`Generated on: ${exportDate}`, 14, 28);
  pdf.text(`Date Range: Last ${filters.dateRange || 7} days`, 14, 34);
  
  // Format data for table
  const tableData = data.map(log => [
    log.event_type,
    log.message?.substring(0, 40) + (log.message?.length > 40 ? '...' : '') || '',
    log.user_id || '',
    format(new Date(log.created_at), "MMM d, yyyy h:mm a"),
    log.meta ? JSON.stringify(log.meta).substring(0, 30) + '...' : ''
  ]);
  
  // Add table
  autoTable(pdf, {
    startY: 40,
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
}

/**
 * Log export event to system_logs
 */
async function logExportEvent(filters: ExportFilters, fileName: string): Promise<void> {
  try {
    await supabase
      .from('system_logs')
      .insert({
        tenant_id: filters.tenantId,
        event_type: 'export_pdf',
        message: `Generated ${getReportTypeName(filters.type)} report`,
        meta: {
          report_type: filters.type || 'system',
          file_name: fileName,
          filters_applied: {
            dateRange: filters.dateRange,
            userId: filters.userId,
            search: filters.search,
            groupBy: filters.groupBy
          }
        }
      });
  } catch (error) {
    console.error('Error logging export event:', error);
  }
}

/**
 * Save export record to export_logs table
 */
async function saveExportLog(filters: ExportFilters, fileName: string, fileUrl?: string): Promise<void> {
  try {
    await supabase
      .from('export_logs')
      .insert({
        tenant_id: filters.tenantId,
        user_id: filters.userId || null,
        export_type: filters.type || 'system',
        delivery_method: 'download',
        status: 'completed',
        meta: {
          file_name: fileName,
          file_url: fileUrl,
          filters: {
            dateRange: filters.dateRange,
            search: filters.search,
            groupBy: filters.groupBy
          }
        },
        completed_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error saving export log:', error);
  }
}

/**
 * Email report to specified recipients
 */
async function emailReport(fileUrl: string | undefined, fileName: string, recipients: string[], filters: ExportFilters): Promise<void> {
  try {
    if (!fileUrl) {
      throw new Error('No file URL available for email attachment');
    }
    
    // Call the send-email edge function
    const { error } = await supabase.functions.invoke('send-export-email', {
      body: {
        to: recipients,
        subject: `Allora OS ${getReportTypeName(filters.type)} Report`,
        html: `
          <h1>Allora OS Report</h1>
          <p>Attached is your requested ${getReportTypeName(filters.type)} report.</p>
          <p>Report generated on: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}</p>
          <p>Date range: Last ${filters.dateRange || 7} days</p>
          <p><a href="${fileUrl}" target="_blank">Click here to download the report</a></p>
        `,
        attachmentUrl: fileUrl,
        attachmentName: fileName
      }
    });
    
    if (error) {
      throw error;
    }
    
    // Log email action
    await supabase
      .from('system_logs')
      .insert({
        tenant_id: filters.tenantId,
        event_type: 'email_report',
        message: `Emailed ${getReportTypeName(filters.type)} report to ${recipients.join(', ')}`,
        meta: {
          report_type: filters.type || 'system',
          file_name: fileName,
          recipients
        }
      });
      
  } catch (error) {
    console.error('Error sending email report:', error);
    throw error;
  }
}

/**
 * Get human-readable report type name
 */
function getReportTypeName(type?: string): string {
  switch (type) {
    case 'strategy':
      return 'Strategy';
    case 'campaign':
      return 'Campaign';
    case 'kpi':
      return 'KPI Metrics';
    case 'system':
      return 'System Activity';
    default:
      return 'System Activity';
  }
}
