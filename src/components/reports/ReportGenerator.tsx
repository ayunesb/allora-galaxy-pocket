
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, Send } from 'lucide-react';

interface ReportGeneratorProps {
  reportTypes: string[];
  onGenerate: (reportType: string, options: ReportOptions) => Promise<void>;
  isLoading?: boolean;
}

interface ReportOptions {
  includeCharts: boolean;
  format: 'pdf' | 'csv' | 'excel';
  delivery: 'download' | 'email';
  timeRange: 'week' | 'month' | 'quarter' | 'year';
  metrics: string[];
}

export function ReportGenerator({ reportTypes, onGenerate, isLoading = false }: ReportGeneratorProps) {
  const [reportType, setReportType] = useState<string>(reportTypes[0] || '');
  const [options, setOptions] = useState<ReportOptions>({
    includeCharts: true,
    format: 'pdf',
    delivery: 'download',
    timeRange: 'month',
    metrics: ['revenue', 'leads', 'conversions']
  });
  const { toast } = useToast();

  const handleGenerateReport = async () => {
    try {
      await onGenerate(reportType, options);
      toast({
        title: "Report request sent",
        description: "Your report is being generated. It will be available shortly."
      });
    } catch (error) {
      toast({
        title: "Report generation failed",
        description: error instanceof Error ? error.message : "Failed to generate report",
        variant: "destructive"
      });
    }
  };

  const toggleMetric = (metric: string) => {
    setOptions(prev => ({
      ...prev,
      metrics: prev.metrics.includes(metric)
        ? prev.metrics.filter(m => m !== metric)
        : [...prev.metrics, metric]
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generate Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Report Type</Label>
          <Select
            value={reportType}
            onValueChange={setReportType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              {reportTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Time Range</Label>
          <Select
            value={options.timeRange}
            onValueChange={(value) => setOptions({ ...options, timeRange: value as 'week' | 'month' | 'quarter' | 'year' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Format</Label>
          <Select
            value={options.format}
            onValueChange={(value) => setOptions({ ...options, format: value as 'pdf' | 'csv' | 'excel' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Delivery Method</Label>
          <Select
            value={options.delivery}
            onValueChange={(value) => setOptions({ ...options, delivery: value as 'download' | 'email' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="download">Download Now</SelectItem>
              <SelectItem value="email">Send to Email</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Include Data</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="metrics-revenue" 
                checked={options.metrics.includes('revenue')} 
                onCheckedChange={() => toggleMetric('revenue')}
              />
              <label htmlFor="metrics-revenue">Revenue</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="metrics-leads" 
                checked={options.metrics.includes('leads')} 
                onCheckedChange={() => toggleMetric('leads')}
              />
              <label htmlFor="metrics-leads">Leads</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="metrics-conversions" 
                checked={options.metrics.includes('conversions')} 
                onCheckedChange={() => toggleMetric('conversions')}
              />
              <label htmlFor="metrics-conversions">Conversions</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="metrics-engagement" 
                checked={options.metrics.includes('engagement')} 
                onCheckedChange={() => toggleMetric('engagement')}
              />
              <label htmlFor="metrics-engagement">Engagement</label>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="include-charts" 
            checked={options.includeCharts} 
            onCheckedChange={() => setOptions(prev => ({ ...prev, includeCharts: !prev.includeCharts }))}
          />
          <Label htmlFor="include-charts">Include Charts and Graphs</Label>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGenerateReport} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            'Generating...'
          ) : options.delivery === 'download' ? (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Email Report
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
