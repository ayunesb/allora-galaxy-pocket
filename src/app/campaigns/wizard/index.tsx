
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function CampaignWizard() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto p-6 max-w-3xl space-y-8">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/campaigns')}
          className="flex items-center gap-1 mr-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Campaign Wizard</h1>
          <p className="text-muted-foreground">Create an AI-powered campaign in minutes</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Wizard</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Sparkles className="h-12 w-12 text-primary mb-4" />
          <h2 className="text-xl font-medium mb-2">AI Campaign Generation</h2>
          <p className="text-muted-foreground text-center mb-6">
            Our AI will help you create optimized campaigns based on your business goals.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/campaigns/create')}
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Start Campaign Creation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
