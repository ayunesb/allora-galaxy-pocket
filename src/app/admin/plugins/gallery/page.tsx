
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AddPluginPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Add Plugin</h1>
      
      <div className="flex justify-end mb-6">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New Plugin
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placeholder cards for plugin gallery */}
        {[1, 2, 3].map((i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Sample Plugin {i}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                This is a sample plugin that can be installed.
              </p>
              <Button variant="outline" className="w-full">Install</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
