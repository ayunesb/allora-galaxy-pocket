
import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ExportFilters, ExportOptions } from './types';
import { fetchStrategyData } from './data-fetchers/strategy-data';
import { fetchCampaignData } from './data-fetchers/campaign-data';
import { fetchKpiData } from './data-fetchers/kpi-data';
import { fetchSystemLogsData } from './data-fetchers/system-logs-data';
import { addCoverPage } from './report-generators/pdf-cover';
import { logExportEvent, saveExportLog } from './logging';
import { emailReport } from './email';
import { getReportTypeName } from './utils';

export { type ExportFilters, type ExportOptions };

/**
 * Main export function that handles different types of exports
 */
export async function exportToPDF(
  filters: ExportFilters,
  options: ExportOptions = {}
): Promise<{ url: string; fileName: string }> {
  try {
    const fileName = `allora-report-${filters.tenantId}-${format(new Date(), "yyyy-MM-dd")}.pdf`;
    const pdf = new jsPDF();
    
    if (options.attachCoverPage) {
      await addCoverPage(pdf, filters);
    }
    
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
    
    // Upload to Supabase storage
    const pdfBlob = pdf.output('blob');
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
    
    // Save export record
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

// Helper functions for adding specific report sections
async function addStrategyReport(pdf: jsPDF, data: any[], filters: ExportFilters): Promise<void> {
  pdf.setFontSize(16);
  pdf.text('Strategy Report', 14, 20);
  
  pdf.setFontSize(10);
  pdf.text(`Date Range: Last ${filters.dateRange || 7} days`, 14, 28);
  pdf.text(`Total Strategies: ${data.length}`, 14, 34);
  
  const tableData = data.map(item => [
    item.title,
    item.industry || 'N/A',
    item.goal || 'N/A',
    item.status,
    item.confidence || 'N/A',
    format(new Date(item.created_at), "MMM d, yyyy")
  ]);
  
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

async function addCampaignReport(pdf: jsPDF, data: any[], filters: ExportFilters): Promise<void> {
  pdf.setFontSize(16);
  pdf.text('Campaign Report', 14, 20);
  
  pdf.setFontSize(10);
  pdf.text(`Date Range: Last ${filters.dateRange || 7} days`, 14, 28);
  pdf.text(`Total Campaigns: ${data.length}`, 14, 34);
  
  const tableData = data.map(item => [
    item.name,
    item.description ? (item.description.substring(0, 30) + '...') : 'N/A',
    item.status,
    format(new Date(item.created_at), "MMM d, yyyy")
  ]);
  
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

async function addKpiReport(pdf: jsPDF, data: any, filters: ExportFilters): Promise<void> {
  const current = data.current;
  const history = data.history;
  
  pdf.setFontSize(16);
  pdf.text('KPI Metrics Report', 14, 20);
  
  pdf.setFontSize(10);
  pdf.text(`Date Range: Last ${filters.dateRange || 7} days`, 14, 28);
  pdf.text(`Total Metrics: ${current.length}`, 14, 34);
  
  const tableData = current.map(item => [
    item.metric,
    item.value.toString(),
    format(new Date(item.recorded_at), "MMM d, yyyy")
  ]);
  
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

async function addSystemLogsReport(pdf: jsPDF, data: any[], filters: ExportFilters): Promise<void> {
  pdf.setFontSize(16);
  pdf.text('System Activity Report', 14, 20);
  
  pdf.setFontSize(10);
  const exportDate = format(new Date(), "MMMM d, yyyy 'at' h:mm a");
  pdf.text(`Generated on: ${exportDate}`, 14, 28);
  pdf.text(`Date Range: Last ${filters.dateRange || 7} days`, 14, 34);
  
  const tableData = data.map(log => [
    log.event_type,
    log.message?.substring(0, 40) + (log.message?.length > 40 ? '...' : '') || '',
    log.user_id || '',
    format(new Date(log.created_at), "MMM d, yyyy h:mm a"),
    log.meta ? JSON.stringify(log.meta).substring(0, 30) + '...' : ''
  ]);
  
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

