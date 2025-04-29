
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Filter } from 'lucide-react';
import { useTenant } from '@/hooks/useTenant';

export default function CampaignCenter() {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Campaign Center</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button onClick={() => navigate('/campaigns/create')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Campaign
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder for campaigns that would be loaded from the database */}
        <Card className="border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" 
              onClick={() => navigate('/campaigns/create')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-center text-muted-foreground">Create New Campaign</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center py-8">
            <PlusCircle className="h-12 w-12 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
