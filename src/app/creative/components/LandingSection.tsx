
import { Button } from "@/components/ui/button";
import { CreativeLayout } from "../layout/CreativeLayout";

interface LandingSectionProps {
  headline: string;
  subtext: string;
  cta: string;
}

export function LandingSection({ headline, subtext, cta }: LandingSectionProps) {
  return (
    <CreativeLayout title="📄 Landing Page Draft">
      <p className="text-md font-bold">{headline}</p>
      <p className="text-sm text-gray-500 mt-2">{subtext}</p>
      <Button variant="link" className="text-sm mt-2 p-0">{cta}</Button>
    </CreativeLayout>
  );
}
