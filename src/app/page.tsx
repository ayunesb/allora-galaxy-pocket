
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, DatabaseIcon } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to Allora OS</h1>
        <p className="text-xl text-muted-foreground mb-12">
          Your marketing automation platform powered by AI
        </p>
        
        <div className="grid gap-8 md:grid-cols-2 mt-12">
          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Begin your journey with Allora OS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Explore the dashboard to see your strategies, campaigns, and analytics.</p>
            </CardContent>
            <CardFooter>
              <Link to="/dashboard" className="w-full">
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>
                Check system connectivity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Verify your Supabase connection and system health.</p>
            </CardContent>
            <CardFooter>
              <Link to="/system/connection-test" className="w-full">
                <Button variant="outline" className="w-full flex items-center">
                  <DatabaseIcon className="mr-2 h-4 w-4" />
                  Test Connection
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
