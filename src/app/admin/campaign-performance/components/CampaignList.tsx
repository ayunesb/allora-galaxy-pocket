
import React from "react";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CampaignListProps {
  campaign: any;
  onTrack: () => void;
}

export function CampaignList({ campaign, onTrack }: CampaignListProps) {
  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg">{campaign.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{campaign.description}</p>
          <div className="flex gap-2 mt-2">
            <Badge variant={campaign.status === 'active' ? "default" : 
                          campaign.status === 'completed' ? "success" : 
                          "secondary"}>
              {campaign.status}
            </Badge>
            <Badge variant="outline">
              {format(new Date(campaign.created_at), 'MMM d, yyyy')}
            </Badge>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-shrink-0"
          onClick={onTrack}
        >
          Track Outcomes
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
      
      {campaign.insights && campaign.insights.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">KPI Insights</h4>
          <div className="space-y-2">
            {campaign.insights.map((insight: any) => (
              <div key={insight.id} className="flex justify-between items-center p-2 bg-muted rounded-md">
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">
                    {insight.kpi_name}
                  </Badge>
                  <span className="text-sm">{insight.insight}</span>
                </div>
                <Badge variant={
                  insight.outcome === 'success' ? "success" : 
                  insight.outcome === 'failed' ? "destructive" : 
                  "default"
                }>
                  {insight.outcome || 'pending'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {campaign.scripts && Object.keys(campaign.scripts).length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.keys(campaign.scripts).map(channel => (
            <Badge key={channel} variant="outline">
              {channel}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
