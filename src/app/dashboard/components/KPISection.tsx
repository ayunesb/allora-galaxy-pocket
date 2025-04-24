
import { Card, CardContent } from "@/components/ui/card";
import { KPITrackerWithData } from "@/components/KPITracker";
import { KpiCampaignTracker } from "@/components/KpiCampaignTracker";

export function KPISection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="pt-6">
            <KPITrackerWithData />
          </CardContent>
        </Card>
      </div>
      <div>
        <KpiCampaignTracker />
      </div>
    </div>
  );
}
