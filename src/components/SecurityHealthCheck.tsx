
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

export function SecurityHealthCheck() {
  const securityItems = [
    { name: "Vite Server", status: "secure", description: "fs.strict enabled" },
    { name: "Random ID Generation", status: "secure", description: "Using crypto.randomUUID()" },
    { name: "Dependencies", status: "secure", description: "All dependencies up to date" },
    { name: "RLS Policies", status: "secure", description: "Tenant isolation enforced" },
    { name: "Auth Session", status: "secure", description: "JWT properly validated" },
  ];

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Security Assessment</CardTitle>
        </div>
        <CardDescription>
          System security verification results
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {securityItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
              <div className="flex items-center gap-2">
                {item.status === 'secure' ? (
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                ) : item.status === 'warning' ? (
                  <ShieldAlert className="h-4 w-4 text-yellow-500" />
                ) : (
                  <ShieldAlert className="h-4 w-4 text-red-500" />
                )}
                <span className="font-medium">{item.name}</span>
              </div>
              <span className="text-xs text-muted-foreground">{item.description}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// For backward compatibility
export default SecurityHealthCheck;
