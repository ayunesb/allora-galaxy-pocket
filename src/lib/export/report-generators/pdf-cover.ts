
import jsPDF from 'jspdf';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ExportFilters } from '../types';
import { getReportTypeName } from '../utils';

export async function addCoverPage(pdf: jsPDF, filters: ExportFilters): Promise<void> {
  const { data: tenantData } = await supabase
    .from('tenant_profiles')
    .select('name')
    .eq('id', filters.tenantId)
    .single();
    
  pdf.setFontSize(22);
  pdf.setTextColor(41, 128, 185);
  pdf.text('Allora OS Report', 20, 40);
  
  pdf.setFontSize(16);
  pdf.setTextColor(0);
  pdf.text(tenantData?.name || 'Tenant Report', 20, 55);
  
  pdf.setFontSize(12);
  pdf.text(`Report Type: ${getReportTypeName(filters.type)}`, 20, 75);
  pdf.text(`Generated on: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`, 20, 85);
  pdf.text(`Date Range: Last ${filters.dateRange || 7} days`, 20, 95);
  
  if (filters.userId) {
    pdf.text(`Filtered by User: ${filters.userId}`, 20, 105);
  }
  
  pdf.setDrawColor(41, 128, 185);
  pdf.setLineWidth(0.5);
  pdf.line(20, 115, 190, 115);
  
  pdf.addPage();
}

