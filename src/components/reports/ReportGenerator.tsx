
import { useState } from "react";
import { DownloadIcon, FileText, Mail, Calendar, UserIcon, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExportService } from "@/hooks/useExportService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReportGeneratorProps {
  defaultType?: 'strategy' | 'campaign' | 'kpi' | 'system';
  showEmailOption?: boolean;
}

export function ReportGenerator({ defaultType = 'system', showEmailOption = true }: ReportGeneratorProps) {
  const [reportType, setReportType] = useState<'strategy' | 'campaign' | 'kpi' | 'system'>(defaultType);
  const [dateRange, setDateRange] = useState<number>(7);
  const [email, setEmail] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv'>('pdf');
  
  const { downloadPDF, downloadCSV, emailReport, isLoading } = useExportService();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const filters = {
      dateRange,
      search: search || undefined
    };
    
    if (exportFormat === 'pdf') {
      await downloadPDF(reportType, filters);
    } else {
      const csvType = 
        reportType === 'strategy' ? 'strategies' :
        reportType === 'campaign' ? 'campaigns' :
        reportType === 'kpi' ? 'kpis' : 'system_logs';
        
      await downloadCSV(csvType, filters);
    }
  };
  
  const handleEmailReport = async () => {
    if (!email) return;
    
    await emailReport(reportType, [email], {
      dateRange,
      search: search || undefined
    });
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate Report</CardTitle>
        <CardDescription>Export data as PDF or CSV reports</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={reportType} onValueChange={(value) => setReportType(value as any)}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
            <TabsTrigger value="campaign">Campaign</TabsTrigger>
            <TabsTrigger value="kpi">KPI</TabsTrigger>
            <TabsTrigger value="system">Activity</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date-range">Date Range</Label>
                <Select 
                  value={dateRange.toString()} 
                  onValueChange={(value) => setDateRange(parseInt(value))}
                >
                  <SelectTrigger id="date-range" className="w-full">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Last 24 hours</SelectItem>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="format">Export Format</Label>
                <Select 
                  value={exportFormat} 
                  onValueChange={(value) => setExportFormat(value as 'pdf' | 'csv')}
                >
                  <SelectTrigger id="format" className="w-full">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Report</SelectItem>
                    <SelectItem value="csv">CSV Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="search">Search (Optional)</Label>
              <Input
                id="search"
                placeholder={`Search ${reportType} data...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            {showEmailOption && (
              <div className="space-y-2">
                <Label htmlFor="email">Email Report To (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleEmailReport}
                    disabled={!email || isLoading}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {exportFormat === 'pdf' ? 
            "PDF includes cover page and data summary" : 
            "CSV contains raw data for analysis"
          }
        </div>
        <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center">
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Processing...
            </span>
          ) : (
            <>
              {exportFormat === 'pdf' ? 
                <FileText className="h-4 w-4 mr-2" /> : 
                <DownloadIcon className="h-4 w-4 mr-2" />
              }
              Generate Report
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
