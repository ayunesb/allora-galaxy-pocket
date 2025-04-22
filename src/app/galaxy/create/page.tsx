
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CreateGalaxyPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="bg-card dark:bg-gray-800 shadow-lg border border-border">
        <CardHeader>
          <CardTitle className="text-2xl">Create Galaxy Kit</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground dark:text-gray-300 mb-6">
            Create and publish your own strategy kits to the Galaxy marketplace.
          </p>
          
          <div className="grid gap-6">
            <div className="bg-background dark:bg-gray-700 p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-3">Kit Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kit Name</label>
                  <input 
                    type="text" 
                    className="w-full p-2 border border-border rounded-md bg-background dark:bg-gray-800" 
                    placeholder="My Amazing Kit"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea 
                    className="w-full p-2 border border-border rounded-md bg-background dark:bg-gray-800" 
                    rows={3} 
                    placeholder="Describe your kit and its benefits"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select className="w-full p-2 border border-border rounded-md bg-background dark:bg-gray-800">
                    <option value="">Select a category</option>
                    <option value="marketing">Marketing</option>
                    <option value="sales">Sales</option>
                    <option value="customer-service">Customer Service</option>
                    <option value="analytics">Analytics</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <Button className="bg-primary hover:bg-primary/90">
                Create Kit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
