
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Campaign } from '@/types/campaign';
import { ChevronRight, Calendar, BarChart } from 'lucide-react';
import { format } from 'date-fns';

interface CampaignsListProps {
  campaigns: Campaign[];
}

export const CampaignsList: React.FC<CampaignsListProps> = ({ campaigns }) => {
  const navigate = useNavigate();

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500 hover:bg-green-600';
      case 'draft':
        return 'bg-gray-500 hover:bg-gray-600';
      case 'paused':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'completed':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'archived':
        return 'bg-gray-700 hover:bg-gray-800';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {campaigns.map((campaign) => (
        <Card key={campaign.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg line-clamp-1">{campaign.name}</CardTitle>
              <Badge className={getStatusBadgeColor(campaign.status)}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </Badge>
            </div>
            <CardDescription className="line-clamp-2">
              {campaign.description || "No description provided"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <Calendar className="h-4 w-4 mr-1" />
              {campaign.created_at ? format(new Date(campaign.created_at), 'MMM d, yyyy') : 'No date'}
            </div>
            
            {campaign.execution_status && (
              <div className="flex items-center text-sm text-muted-foreground">
                <BarChart className="h-4 w-4 mr-1" />
                Execution: {campaign.execution_status.charAt(0).toUpperCase() + campaign.execution_status.slice(1)}
              </div>
            )}
          </CardContent>
          <CardFooter className="pt-1">
            <Button 
              variant="ghost" 
              className="w-full justify-between" 
              onClick={() => navigate(`/campaigns/${campaign.id}`)}
            >
              View Details
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
