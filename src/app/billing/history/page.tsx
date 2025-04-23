
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MobileResponsiveTable, Column } from "@/components/ui/mobile-responsive-table";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data for payment history
const mockPaymentHistory = [
  {
    id: "inv_123456",
    date: new Date(2023, 10, 1),
    amount: 49.99,
    status: "paid",
    description: "Growth Plan - Monthly"
  },
  {
    id: "inv_123455",
    date: new Date(2023, 9, 1),
    amount: 49.99,
    status: "paid",
    description: "Growth Plan - Monthly"
  },
  {
    id: "inv_123454",
    date: new Date(2023, 8, 1),
    amount: 19.99,
    status: "paid",
    description: "Standard Plan - Monthly"
  },
  {
    id: "inv_123453",
    date: new Date(2023, 7, 1),
    amount: 19.99,
    status: "paid",
    description: "Standard Plan - Monthly"
  },
  {
    id: "inv_123452",
    date: new Date(2023, 6, 1),
    amount: 19.99,
    status: "paid",
    description: "Standard Plan - Monthly"
  }
];

interface Payment {
  id: string;
  date: Date;
  amount: number;
  status: string;
  description: string;
}

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const loadPayments = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setPayments(mockPaymentHistory);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error loading payment history:", error);
        setLoading(false);
      }
    };
    
    loadPayments();
  }, []);
  
  // Filter payments based on search term
  const filteredPayments = payments.filter(payment => 
    payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleDownloadInvoice = (invoiceId: string) => {
    // In a real implementation, this would download the invoice from Stripe
    alert(`Downloading invoice ${invoiceId}...`);
  };
  
  const handleOpenStripePortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error opening Stripe portal:", error);
    }
  };
  
  // Define columns for our responsive table
  const columns: Column[] = [
    {
      header: "Invoice ID",
      accessorKey: "id",
      cell: (value) => <span className="font-mono">{value}</span>
    },
    {
      header: "Date",
      accessorKey: "date",
      cell: (value) => format(value, 'MMM d, yyyy')
    },
    {
      header: "Description",
      accessorKey: "description"
    },
    {
      header: "Amount",
      accessorKey: "amount",
      cell: (value) => `$${value.toFixed(2)}`
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          value === 'paid' 
            ? 'bg-green-100 text-green-800' 
            : value === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    {
      header: "Actions",
      accessorKey: "id",
      cell: (value) => (
        <Button 
          variant="outline" 
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => handleDownloadInvoice(value)}
        >
          <Download className="mr-2 h-3 w-3" />
          Download
        </Button>
      )
    }
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Payment History</h1>
          <p className="text-muted-foreground">View and download your past invoices</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={handleOpenStripePortal}>
            <FileText className="mr-2 h-4 w-4" />
            Full Billing History
          </Button>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>
            Your last 5 invoices are displayed below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="relative w-full sm:w-auto mb-4 sm:mb-0">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="pl-8 w-full sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Download All
            </Button>
          </div>
          
          {loading ? (
            <div className="space-y-2">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <MobileResponsiveTable 
              columns={columns}
              data={filteredPayments}
              emptyMessage="No invoices found matching your search."
            />
          )}
          
          <div className="flex justify-center mt-6">
            <Button variant="outline">View More</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Need an Invoice Copy?</CardTitle>
          <CardDescription>
            If you need a copy of an older invoice that's not listed above, please use the Stripe Customer Portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleOpenStripePortal}>Access Customer Portal</Button>
        </CardContent>
      </Card>
    </div>
  );
}
