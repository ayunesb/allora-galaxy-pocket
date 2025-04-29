
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LaunchPage() {
  const navigate = useNavigate();
  
  const launchChecklist = [
    { name: "Security Verification", status: "complete" },
    { name: "RLS Policies", status: "complete" },
    { name: "Error Boundaries", status: "warning", note: "Some components missing error handling" },
    { name: "Performance Testing", status: "complete" },
    { name: "Data Migration", status: "complete" },
    { name: "User Acceptance Testing", status: "complete" }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Launch Center</h1>
        <p className="text-muted-foreground mb-6">
          Prepare your Allora OS instance for production deployment
        </p>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Launch Readiness
            </CardTitle>
            <CardDescription>
              Pre-launch verification and checklist
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              {launchChecklist.map((item, index) => (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-3 rounded-md ${
                    item.status === 'complete' 
                      ? 'bg-green-50 border border-green-200' 
                      : item.status === 'warning'
                      ? 'bg-yellow-50 border border-yellow-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.status === 'complete' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    <span className="font-medium">{item.name}</span>
                  </div>
                  {item.note && (
                    <span className="text-xs text-muted-foreground">{item.note}</span>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => navigate("/system-verification")}
              >
                Run Verification
              </Button>
              <Button>
                <Rocket className="h-4 w-4 mr-2" />
                Launch to Production
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
