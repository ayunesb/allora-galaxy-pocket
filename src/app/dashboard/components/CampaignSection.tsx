
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Campaign } from "@/types/campaign";

interface CampaignSectionProps {
  campaigns?: Campaign[];
}

export function CampaignSection({ campaigns }: CampaignSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Status</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          {["active", "draft", "completed"].map((status) => (
            <TabsContent key={status} value={status}>
              {campaigns?.filter(c => c.status === status).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No {status} campaigns
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns?.filter(c => c.status === status).map(campaign => (
                    <div key={campaign.id} className="border rounded-md p-3">
                      <h3 className="font-medium">{campaign.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {campaign.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
