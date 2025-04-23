
import { DemoLayout } from "./DemoLayout";
import { useDemoAnalytics } from "@/hooks/useDemoAnalytics";
import { Button } from "@/components/ui/button";
import { useDemoRestrictions } from "@/hooks/useDemoRestrictions";
import { Badge } from "@/components/ui/badge";
import { useTenant } from "@/hooks/useTenant";
import { HeroSection } from "@/components/home/HeroSection";
import { TargetAudienceSection } from "@/components/home/TargetAudienceSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";

export default function DemoPage() {
  const { trackDemoEvent } = useDemoAnalytics();
  const { tenant } = useTenant();

  const handleStrategyClick = (strategyId: string) => {
    trackDemoEvent('view_strategy', { strategy_id: strategyId });
  };

  const handleAgentClick = (agentId: string) => {
    trackDemoEvent('view_agent', { agent_id: agentId });
  };

  const handleKpiTabClick = (tabName: string) => {
    trackDemoEvent('view_kpi_tab', { tab_name: tabName });
  };

  return (
    <DemoLayout>
      <div className="min-h-screen flex flex-col">
        {tenant?.isDemo && (
          <div className="w-full bg-yellow-50 dark:bg-yellow-900/20 py-2 px-4 text-center">
            <Badge variant="warning" className="bg-yellow-100 text-yellow-700 dark:text-yellow-400 border-yellow-200">
              🧪 Demo Mode – View Only
            </Badge>
          </div>
        )}
        
        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-background to-muted">
          <HeroSection />
          <TargetAudienceSection />
          <TestimonialsSection />
        </div>
      </div>
    </DemoLayout>
  );
}
