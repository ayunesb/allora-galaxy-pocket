
import { Badge } from "@/components/ui/badge";
import { useTenant } from "@/hooks/useTenant";
import { HeroSection } from "@/components/home/HeroSection";
import { TargetAudienceSection } from "@/components/home/TargetAudienceSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";

export default function Home() {
  const { tenant } = useTenant();

  return (
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
  );
}
