import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Play, Edit, Share, Eye, BarChart2, Calendar, Trash2, Pause, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCampaignDetail } from '@/hooks/useCampaignDetail';
import { CampaignEditor } from '@/components/CampaignEditor';
import { SocialShareButtons } from '@/components/SocialShareButtons';
import { CampaignMetrics } from '@/components/CampaignMetrics';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useCampaignActions } from '@/hooks/useCampaignActions';
import { useDemoRestrictions } from '@/hooks/useDemoRestrictions';

export default function CampaignDetailPage() {
  const { id } = useParams() as { id: string };
  const navigate = useNavigate();
  const { toast } = useToast();
  const { campaign, isLoading, error, refetch } = useCampaignDetail(id);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { executeCampaign, pauseCampaign, deleteCampaign } = useCampaignActions();
  const { checkAccess, showRestrictionWarning } = useDemoRestrictions();

  const handleExecute = async () => {
    if (!campaign) return;
    
    try {
      await executeCampaign(campaign.id);
      toast({
        title: "Campaign Executed",
        description: `${campaign.name} is now running.`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Execution Failed",
        description: error instanceof Error ? error.message : "Failed to execute campaign",
        variant: "destructive",
      });
    }
  };

  const handlePause = async () => {
    if (!campaign) return;
    
    try {
      await pauseCampaign(campaign.id);
      toast({
        title: "Campaign Paused",
        description: `${campaign.name} has been paused.`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Failed to Pause",
        description: error instanceof Error ? error.message : "Failed to pause campaign",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    if (!checkAccess('delete')) {
      showRestrictionWarning('delete');
      return;
    }
    
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!campaign) return;
    
    try {
      await deleteCampaign(campaign.id);
      toast({
        title: "Campaign Deleted",
        description: `${campaign.name} has been deleted.`,
      });
      navigate('/campaigns');
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete campaign",
        variant: "destructive",
      });
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Failed to load campaign details. The campaign may not exist or you don't have permission to view it.</p>
            <p className="text-sm text-muted-foreground mt-2">{error instanceof Error ? error.message : "Unknown error"}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate('/campaigns')}>Back to Campaigns</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={
                campaign.status === 'active' ? 'default' : 
                campaign.status === 'draft' ? 'outline' : 
                campaign.status === 'paused' ? 'secondary' : 
                'destructive'
              }>
                {campaign.status === 'active' ? 'Running' : 
                 campaign.status === 'draft' ? 'Draft' :
                 campaign.status === 'paused' ? 'Paused' : 'Failed'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Created {new Date(campaign.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {campaign.status === 'active' ? (
              <Button variant="outline" onClick={handlePause}>
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            ) : (
              <Button variant="default" onClick={handleExecute} disabled={campaign.execution_status === 'failed'}>
                <Play className="h-4 w-4 mr-2" />
                {campaign.status === 'paused' ? 'Resume' : 'Execute'}
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate(`/campaigns/edit/${campaign.id}`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="p-0 border-b rounded-none w-full justify-start h-auto">
                <TabsTrigger value="overview" className="py-3 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="metrics" className="py-3 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  Metrics
                </TabsTrigger>
                <TabsTrigger value="editor" className="py-3 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  Content
                </TabsTrigger>
                <TabsTrigger value="sharing" className="py-3 px-6 rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  Share
                </TabsTrigger>
              </TabsList>
              
              <div className="p-6">
                <TabsContent value="overview" className="m-0">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Campaign Details</h3>
                      <p className="text-muted-foreground mb-4">{campaign.description || 'No description provided.'}</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Scheduled: {campaign.execution_start_date ? 
                            new Date(campaign.execution_start_date).toLocaleString() : 'Not scheduled'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <span>Views: {campaign.execution_metrics?.views || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart2 className="h-4 w-4 text-muted-foreground" />
                          <span>Conversions: {campaign.execution_metrics?.conversions || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-muted-foreground" />
                          <span>Status: {campaign.execution_status || 'Not executed'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <CampaignMetrics campaignId={campaign.id} />
                  </div>
                </TabsContent>
                
                <TabsContent value="metrics" className="m-0">
                  <CampaignMetrics campaignId={campaign.id} detailed />
                </TabsContent>
                
                <TabsContent value="editor" className="m-0">
                  <CampaignEditor campaign={campaign} readOnly />
                </TabsContent>
                
                <TabsContent value="sharing" className="m-0">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Share Campaign</h3>
                      <p className="text-muted-foreground mb-4">
                        Share this campaign with your team or on social media.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-muted/30 p-4 rounded-md">
                        <h4 className="text-sm font-medium mb-2">Campaign URL</h4>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            readOnly
                            value={`${window.location.origin}/c/${campaign.id}`} 
                            className="flex-1 px-3 py-2 rounded-md text-sm bg-background border"
                          />
                          <Button variant="outline" onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/c/${campaign.id}`);
                            toast({
                              description: "URL copied to clipboard",
                            });
                          }}>
                            Copy
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Share on Social Media</h4>
                        <SocialShareButtons 
                          url={`${window.location.origin}/c/${campaign.id}`}
                          title={campaign.name}
                          description={campaign.description || 'Check out this campaign'}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Campaign"
        description={`Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        destructive
      />
    </div>
  );
}
