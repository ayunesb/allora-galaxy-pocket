
import { useNavigate } from "react-router-dom";
import { ChartBar, Bell, MessageSquare, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardHome() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <Zap className="h-6 w-6 text-primary" />
        Welcome to Allora OS
      </h1>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <h2 className="font-semibold mb-2">🎯 Current Strategy</h2>
            <p className="text-sm text-muted-foreground">
              Kickstart Growth via TikTok + WhatsApp Funnel
            </p>
            <Button 
              variant="link" 
              className="mt-2 h-auto p-0" 
              onClick={() => navigate("/startup")}
            >
              View Full Strategy →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="font-semibold mb-2">💥 Campaigns</h2>
            <p className="text-sm text-muted-foreground">
              3 campaigns awaiting approval
            </p>
            <Button 
              variant="link" 
              className="mt-2 h-auto p-0" 
              onClick={() => navigate("/campaigns/center")}
            >
              Go to Campaign Center →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <ChartBar className="h-4 w-4" />
              <h2 className="font-semibold">Performance Snapshot</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              This week: ROI 3.8x, 420 leads
            </p>
            <Button 
              variant="link" 
              className="mt-2 h-auto p-0" 
              onClick={() => navigate("/dashboard/performance")}
            >
              View Full Report →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Bell className="h-4 w-4" />
              <h2 className="font-semibold">Notifications</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              AI CEO has 2 new suggestions for you
            </p>
            <Button 
              variant="link" 
              className="mt-2 h-auto p-0" 
              onClick={() => navigate("/notifications")}
            >
              View Growth Feed →
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4" />
            <h2 className="font-semibold">Assistant</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Need to send an email, generate a post, or book a call?
          </p>
          <Button 
            variant="link"
            className="mt-2 h-auto p-0"
            onClick={() => navigate("/assistant")}
          >
            Open AI Assistant →
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
