
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { PlusCircle, Sparkles } from "lucide-react";
import { useCampaigns } from './hooks/useCampaigns';
import { CampaignsList } from './components/CampaignsList';
import { LoadingState } from '@/components/ui/loading-state';

const CampaignsPage: React.FC = () => {
  const navigate = useNavigate();
  const { campaigns, isLoading, error } = useCampaigns();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your marketing campaigns
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => navigate('/campaigns/wizard')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            AI Wizard
          </Button>
          <Button
            onClick={() => navigate('/campaigns/create')}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Create Campaign
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Loading campaigns..." />
      ) : error ? (
        <div className="p-12 text-center">
          <p className="text-destructive">Error loading campaigns</p>
          <p className="text-muted-foreground">{error.message}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center p-12 border rounded-lg">
          <h3 className="font-medium text-lg">No campaigns yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first marketing campaign to get started
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-2">
            <Button
              onClick={() => navigate('/campaigns/wizard')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              AI Wizard
            </Button>
            <Button
              onClick={() => navigate('/campaigns/create')}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Standard Editor
            </Button>
          </div>
        </div>
      ) : (
        <CampaignsList campaigns={campaigns} />
      )}
    </div>
  );
};

export default CampaignsPage;
